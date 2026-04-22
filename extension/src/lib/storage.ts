import { ConsentEvent, ExtensionState, UserSettings } from "./types";

const STORAGE_KEY = "consently_state";

const DEFAULT_SETTINGS: UserSettings = {
  stealth_mode: false,
  notifications_enabled: true,
  alert_frequency: "high_priority",
  handshake_interval: 120,
};

export async function getState(): Promise<ExtensionState> {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  const state = result[STORAGE_KEY] ?? { events: [], lastSyncAt: null, userId: null, userEmail: null, settings: DEFAULT_SETTINGS };
  
  // Ensure settings are always present even in old state
  if (!state.settings) {
    state.settings = DEFAULT_SETTINGS;
  }
  
  return state;
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

export interface AnalysisPatch {
  overallRisk: "LOW" | "MEDIUM" | "HIGH";
  plainSummary: string;
  privacyPolicyUrl?: string;
  scopesTranslated?: ConsentEvent["scopesTranslated"];
  sharedWith?: string[];
  dpoEmail?: string;
}

/** Patches a stored event with full analysis data once policy analysis arrives. */
export async function patchEventRisk(
  eventId: string,
  patch: AnalysisPatch,
): Promise<void> {
  const state = await getState();
  const events = state.events.map(e =>
    e.id === eventId ? { ...e, ...patch, synced: false } : e
  );
  await saveState({ ...state, events });
}

/** Updates user settings in the state. */
export async function updateSettings(settings: Partial<UserSettings>): Promise<void> {
  const state = await getState();
  await saveState({
    ...state,
    settings: { ...state.settings, ...settings },
  });
}
