import { ConsentEvent, ExtensionState } from "./types";

const STORAGE_KEY = "consently_state";

export async function getState(): Promise<ExtensionState> {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  return result[STORAGE_KEY] ?? { events: [], lastSyncAt: null, userId: null, userEmail: null };
}

export async function saveState(state: ExtensionState): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEY]: state });
}

export async function appendEvent(event: ConsentEvent): Promise<void> {
  const state = await getState();
  const eventWithUser = { ...event, userId: event.userId || state.userId || undefined };
  const events = [eventWithUser, ...state.events].slice(0, 500); // cap at 500
  await saveState({ ...state, events });
}

export async function markSynced(eventId: string): Promise<void> {
  const state = await getState();
  const events = state.events.map(e => e.id === eventId ? { ...e, synced: true } : e);
  await saveState({ ...state, events });
}

export async function updateEventAction(eventId: string, action: "granted" | "cancelled"): Promise<void> {
  const state = await getState();
  const events = state.events.map(e => e.id === eventId ? { ...e, userAction: action, synced: false } : e);
  await saveState({ ...state, events });
}
