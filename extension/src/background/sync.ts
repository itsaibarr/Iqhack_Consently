import { ConsentEvent } from "../lib/types";
import { getState, markSynced, updateSettings } from "../lib/storage";

// In production, this would be your Vercel/Railway URL
// Use dynamic dashboard URL from environment or fallback to localhost
const API_BASE = import.meta.env.VITE_DASHBOARD_URL || "https://consently.vercel.app";

export async function syncEvent(event: ConsentEvent): Promise<boolean> {
  const state = await getState();
  const userId = event.userId || state.userId;
  
  if (!userId) {
    console.warn(`[Consently] Skipping sync for ${event.appName}: No userId found`);
    return false;
  }

  console.debug(`[Consently] Syncing event for ${event.appName} to ${API_BASE}...`);
  try {
    const res = await fetch(`${API_BASE}/api/consents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...event, userId }),
    });
    
    if (res.ok) {
      console.log(`[Consently] Sync successful for ${event.appName}`);
      return true;
    } else {
      const errorText = await res.text();
      console.error(`[Consently] Sync failed for ${event.appName}: ${res.status} ${res.statusText}`, errorText);
      return false;
    }
  } catch {
    // Network unavailable (server offline / no connection) — expected in dev. Not an error.
    console.warn("[Consently] Sync skipped — server unreachable for", event.appName);
    return false;
  }
}

export async function flushUnsynced(): Promise<void> {
  const state = await getState();
  const unsynced = state.events.filter(e => !e.synced);
  
  if (unsynced.length === 0) return;
  
  console.log(`[Consently] Flushing ${unsynced.length} unsynced events...`);
  for (const event of unsynced) {
    const success = await syncEvent(event);
    if (success) {
      await markSynced(event.id);
    }
  }
}

export async function fetchUserSettings(): Promise<void> {
  const state = await getState();
  if (!state.userId) return;

  console.log("[Consently] Fetching latest user settings...");
  try {
    const res = await fetch(`${API_BASE}/api/settings?userId=${state.userId}`);
    if (res.ok) {
      const settings = await res.json();
      await updateSettings(settings);
      console.log("[Consently] Settings synced successfully");
    } else {
      console.warn("[Consently] Failed to fetch settings:", res.status, res.statusText);
    }
  } catch (err) {
    console.warn("[Consently] Settings sync error (likely offline):", err);
  }
}
