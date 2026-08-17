import { connectDb } from "./db.js";
import { CityAvailability } from "../types.js";
import { emailService } from "./email/email.service.js";

export async function updateCityStats(cityName: string, state: string, type: 'artist' | 'client', increment: number, userName?: string, userEmail?: string) {
  const db = await connectDb();
  if (!db) return;

  const id = `${cityName.toLowerCase().trim()}_${state.toLowerCase().trim()}`;
  
  const update: any = {
    $inc: type === 'artist' ? { artistCount: increment } : { clientCount: increment },
    $set: { lastUpdated: new Date().toISOString(), cityName, state, country: "India" }
  };

  const cityBefore = await db.collection("cityAvailability").findOne({ id });
  const city = await db.collection("cityAvailability").findOneAndUpdate(
    { id },
    update,
    { upsert: true, returnDocument: 'after' }
  );

  if (!city) return;

  // Auto-activate if artist count > 0
  if (type === 'artist' && city.artistCount > 0 && !city.isServiceAvailable) {
    await db.collection("cityAvailability").updateOne({ id }, { $set: { isServiceAvailable: true } });
    
    // Notify clients in waitlist
    const waitingClients = await db.collection("users").find({ city: cityName, state, status: "WAITLIST" }).toArray();
    for (const client of waitingClients) {
        await emailService.sendCityAvailable(client.email, client.name, cityName);
    }
  }

  // Notify artists if client count > 0 and threshold reached
  if (type === 'client' && city.clientCount >= 2 && (!cityBefore || cityBefore.clientCount < 2)) {
    const waitingArtists = await db.collection("artists").find({ city: cityName, state }).toArray();
    for (const artist of waitingArtists) {
        await emailService.sendClientAvailable(artist.email, artist.name, cityName);
    }
  }
}

export async function getCityStats(cityName: string, state: string) {
    const db = await connectDb();
    if (!db) return null;
    const id = `${cityName.toLowerCase().trim()}_${state.toLowerCase().trim()}`;
    return await db.collection("cityAvailability").findOne({ id });
}
