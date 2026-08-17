import { MongoClient, Db } from "mongodb";
import { ArtistProfile, Booking, Message, SystemLog, ArtistCategory, VerificationStatus, BookingStatus } from "../types";

let mongoClient: MongoClient | null = null;
let database: Db | null = null;
let lastError: string | null = null;
let lastAttemptTime = 0;

export function getLastDbError(): string | null {
  return lastError;
}

export function clearDbError() {
  lastError = null;
  lastAttemptTime = 0;
  database = null;
  mongoClient = null;
}

export async function connectDb(forceRetry = false): Promise<Db | null> {
  if (database) return database;

  const uri = process.env.MONGODB_URI;
  console.log("DEBUG: MONGODB_URI is set:", !!uri);
  if (!uri) {
    console.warn("MongoDB Altas connection requested but MONGODB_URI is not set. Falling back to in-memory store.");
    return null;
  }

  const now = Date.now();
  if (lastError && !forceRetry && (now - lastAttemptTime < 15000)) {
    return null;
  }

  lastAttemptTime = now;
  try {
    if (mongoClient) {
      try {
        await mongoClient.close();
      } catch (e) {}
    }

    mongoClient = new MongoClient(uri, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000,
      socketTimeoutMS: 30000
    });
    await mongoClient.connect();
    database = mongoClient.db("veltora");
    console.log("Successfully connected to MongoDB Atlas!");
    lastError = null;
    
    // Seed database if empty
    await seedIfEmpty(database);
    
    return database;
  } catch (err: any) {
    lastError = err.message || String(err);
    console.error("Failed to connect to MongoDB Atlas:", err);
    return null;
  }
}

export async function seedIfEmpty(db: Db) {
  const artistsColl = db.collection("artists");
  const count = await artistsColl.countDocuments();
  if (count > 0) return;

  console.log("Seeding initial data into MongoDB Atlas...");

  const defaultArtists: ArtistProfile[] = [];
  const defaultBookings: Booking[] = [];
  const defaultMessages: Message[] = [];
  const defaultLogs: SystemLog[] = [];

  if (defaultArtists.length > 0) await db.collection("artists").insertMany(defaultArtists);
  if (defaultBookings.length > 0) await db.collection("bookings").insertMany(defaultBookings);
  if (defaultMessages.length > 0) await db.collection("messages").insertMany(defaultMessages);
  if (defaultLogs.length > 0) await db.collection("logs").insertMany(defaultLogs);
  console.log("Database seeded successfully!");
}
