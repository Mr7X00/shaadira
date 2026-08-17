import Redis from "ioredis";
import { connectDb } from "./db";

// 1. Define the Redis Adapter Interface
export interface IRedisAdapter {
  isRealRedis: boolean;
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds?: number): Promise<void>;
  del(key: string): Promise<void>;
  
  // OTP Management
  storeOtp(email: string, otp: string, ttlSeconds: number): Promise<void>;
  verifyOtp(email: string, otp: string): Promise<boolean>;

  // Background Tasks / Notification Queues
  enqueueEmail(to: string, subject: string, text: string, html: string): Promise<void>;
}

// In-memory caching and OTP fallback store
interface MemoryCacheItem {
  value: string;
  expiresAt: number;
}
const memoryCache = new Map<string, MemoryCacheItem>();
const memoryOtps = new Map<string, { otp: string; expiresAt: number }>();

// Clean up expired local items periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, item] of memoryCache.entries()) {
    if (now > item.expiresAt) memoryCache.delete(key);
  }
  for (const [email, data] of memoryOtps.entries()) {
    if (now > data.expiresAt) memoryOtps.delete(email);
  }
}, 30000);

// Helper for direct email execution fallback
import { sendEmail } from "./nodemailer";

// 2. Real Redis Implementation
class RealRedisAdapter implements IRedisAdapter {
  public isRealRedis = true;
  private client: Redis;

  constructor(url: string) {
    this.client = new Redis(url, {
      maxRetriesPerRequest: 1,
      connectTimeout: 4000,
    });
    this.client.on("connect", () => {
      console.log("Redis connected. Active caching & queues enabled.");
    });
    this.client.on("error", (err) => {
      console.warn("Redis runtime error, keeping connection alive but fail-safe active:", err.message);
    });
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch {
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds = 60): Promise<void> {
    try {
      await this.client.set(key, value, "EX", ttlSeconds);
    } catch (err) {
      console.error("Redis SET failed:", err);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (err) {
      console.error("Redis DEL failed:", err);
    }
  }

  async storeOtp(email: string, otp: string, ttlSeconds: number): Promise<void> {
    try {
      const key = `otp:${email}`;
      await this.client.set(key, otp, "EX", ttlSeconds);
    } catch (err) {
      console.error("Redis storeOtp failed, using memory fallback:", err);
      memoryOtps.set(email, { otp, expiresAt: Date.now() + ttlSeconds * 1000 });
    }
  }

  async verifyOtp(email: string, otp: string): Promise<boolean> {
    try {
      const key = `otp:${email}`;
      const cachedOtp = await this.client.get(key);
      if (cachedOtp === otp) {
        await this.client.del(key);
        return true;
      }
    } catch (err) {
      console.error("Redis verifyOtp failed, reading from memory fallback:", err);
    }
    // Fallback search
    const local = memoryOtps.get(email);
    if (local && local.otp === otp && Date.now() <= local.expiresAt) {
      memoryOtps.delete(email);
      return true;
    }
    return false;
  }

  async enqueueEmail(to: string, subject: string, text: string, html: string): Promise<void> {
    try {
      // Simulate/Implement high performance BullMQ-like queue push to Redis list
      const jobData = JSON.stringify({ to, subject, text, html, timestamp: Date.now() });
      await this.client.lpush("queue:emails", jobData);
      
      // Instantly trigger background worker loop non-blockingly
      this.triggerBackgroundWorker();
    } catch (err) {
      console.warn("Queue push failed, dispatching email directly:", err);
      await sendEmail({ to, subject, text, html });
    }
  }

  private async triggerBackgroundWorker() {
    // Process single job asynchronously
    setTimeout(async () => {
      try {
        const job = await this.client.rpop("queue:emails");
        if (job) {
          const { to, subject, text, html } = JSON.parse(job);
          await sendEmail({ to, subject, text, html });
        }
      } catch (err) {
        console.error("Background queue processing error:", err);
      }
    }, 100);
  }
}

// 3. High-Performance Fallback Adapter (Saves to MongoDB with TTL + in-memory store)
class InMemoryFallbackAdapter implements IRedisAdapter {
  public isRealRedis = false;

  constructor() {
    console.log("Initializing free, high-performance in-memory Cache & direct task dispatcher.");
  }

  async get(key: string): Promise<string | null> {
    const item = memoryCache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      memoryCache.delete(key);
      return null;
    }
    return item.value;
  }

  async set(key: string, value: string, ttlSeconds = 60): Promise<void> {
    memoryCache.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000
    });
  }

  async del(key: string): Promise<void> {
    memoryCache.delete(key);
  }

  async storeOtp(email: string, otp: string, ttlSeconds: number): Promise<void> {
    const expiresAtDate = new Date(Date.now() + ttlSeconds * 1000);
    
    // 1. Store in memory for rapid lookup
    memoryOtps.set(email, { otp, expiresAt: expiresAtDate.getTime() });

    // 2. Dual-write to MongoDB collection with built-in Mongo TTL for permanent trace if database connected
    try {
      const db = await connectDb();
      if (db) {
        await db.collection("otps").updateOne(
          { email },
          { $set: { otp, expiresAt: expiresAtDate, createdAt: new Date() } },
          { upsert: true }
        );
        // Create MongoDB TTL index if not exists (expires after 0 seconds relative to expiresAt)
        await db.collection("otps").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
      }
    } catch (err) {
      console.warn("MongoDB OTP fallback persistence error, keeping inside RAM state:", err);
    }
  }

  async verifyOtp(email: string, otp: string): Promise<boolean> {
    const now = Date.now();
    
    // 1. Try memory verification first
    const memItem = memoryOtps.get(email);
    if (memItem) {
      if (memItem.otp === otp && now <= memItem.expiresAt) {
        memoryOtps.delete(email);
        return true;
      }
    }

    // 2. Fallback to MongoDB lookup
    try {
      const db = await connectDb();
      if (db) {
        const record = await db.collection("otps").findOne({ email });
        if (record && record.otp === otp && new Date() <= new Date(record.expiresAt)) {
          await db.collection("otps").deleteOne({ email });
          return true;
        }
      }
    } catch (err) {
      console.error("MongoDB OTP fallback verification error:", err);
    }

    return false;
  }

  async enqueueEmail(to: string, subject: string, text: string, html: string): Promise<void> {
    console.log(`[Queue Disabled] Direct asynchronous email dispatch to: ${to}`);
    // Direct non-blocking execution fallback as requested
    setTimeout(async () => {
      await sendEmail({ to, subject, text, html });
    }, 0);
  }
}

// 4. Create and export the active Adapter instance dynamically
let adapterInstance: IRedisAdapter;

const redisUrl = process.env.REDIS_URL;
if (redisUrl && redisUrl.startsWith("redis")) {
  try {
    adapterInstance = new RealRedisAdapter(redisUrl);
  } catch (err) {
    console.error("Failed to connect to configured Redis. Loading high performance in-memory failover.", err);
    adapterInstance = new InMemoryFallbackAdapter();
  }
} else {
  adapterInstance = new InMemoryFallbackAdapter();
}

export const redisAdapter = adapterInstance;

// 5. Maintain direct export wrappers for flawless backward-compatibility in existing server.ts routes
export async function getCachedData<T>(key: string): Promise<T | null> {
  const cached = await redisAdapter.get(key);
  if (!cached) return null;
  try {
    return JSON.parse(cached) as T;
  } catch {
    return null;
  }
}

export async function setCachedData(key: string, data: any, ttlSeconds = 60): Promise<void> {
  await redisAdapter.set(key, JSON.stringify(data), ttlSeconds);
}

export async function invalidateCache(key: string): Promise<void> {
  await redisAdapter.del(key);
}
