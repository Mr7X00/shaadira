import { EmailLog } from "../../types";
import { connectDb } from "../db.js";

// Decoupled sync callback to prevent circular imports with server.ts
type SyncCallback = (collectionName: string, id: string, data: any) => Promise<void>;
let syncCallback: SyncCallback | null = null;

export const emailLogsFallback: EmailLog[] = [];

export function registerEmailSyncCallback(callback: SyncCallback) {
  syncCallback = callback;
}

// Logs an email delivery attempt
export async function logEmail(logData: Omit<EmailLog, "id" | "sentTime">): Promise<EmailLog> {
  const newLog: EmailLog = {
    id: "elog_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
    sentTime: new Date().toISOString(),
    ...logData,
  };

  try {
    const db = await connectDb();
    if (db) {
      await db.collection("email_logs").insertOne(newLog);
      console.log(`[EmailLogger] Logged email attempt in MongoDB: ${newLog.id}`);
    } else {
      emailLogsFallback.unshift(newLog);
      console.log(`[EmailLogger] Logged email attempt in fallback cache: ${newLog.id}`);
    }
  } catch (error) {
    console.error("[EmailLogger] Failed to write log to MongoDB, using fallback:", error);
    emailLogsFallback.unshift(newLog);
  }

  // Trigger Firestore sync if callback is registered
  if (syncCallback) {
    try {
      await syncCallback("email_logs", newLog.id, newLog);
    } catch (fsError) {
      console.error("[EmailLogger] Failed syncing email log to Firestore:", fsError);
    }
  }

  return newLog;
}

// Retrieves all email logs
export async function getEmailLogs(): Promise<EmailLog[]> {
  try {
    const db = await connectDb();
    if (db) {
      return await db.collection("email_logs").find({}).sort({ sentTime: -1 }).toArray() as unknown as EmailLog[];
    }
  } catch (error) {
    console.error("[EmailLogger] Failed to fetch logs from MongoDB, using fallback:", error);
  }
  return emailLogsFallback;
}
