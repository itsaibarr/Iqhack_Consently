import { ConsentEvent, ExtensionState, UserSettings, ScopeEntry } from "./types";
import { getBaseDomain } from "./utils";

const STORAGE_KEY = "consently_state";

const DEFAULT_SETTINGS: UserSettings = {
  stealth_mode: false,
  notifications_enabled: true,
  alert_frequency: "high_priority",
  handshake_interval: 120,
};

export async function getState(): Promise<ExtensionState> {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  const state = result[STORAGE_KEY] ?? { events: [], lastSyncAt: null, userId: null, userEmail: null, accessToken: null, settings: DEFAULT_SETTINGS };
  
  // Ensure settings are always present even in old state
  if (!state.settings) {
    state.settings = DEFAULT_SETTINGS;
  }
  
  return state;
}

export async function saveState(state: ExtensionState): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEY]: state });
}

export async function upsertEvent(event: ConsentEvent): Promise<string> {
  const state = await getState();
  const eventDomain = getBaseDomain(event.appDomain);
  
  // Find index of existing event for this domain
  const existingIndex = state.events.findIndex(e => getBaseDomain(e.appDomain) === eventDomain);
  
  let targetEvent: ConsentEvent;
  let newEvents = [...state.events];

  if (existingIndex !== -1) {
    const existing = state.events[existingIndex];
    // Merge scopes uniquely
    const scopeMap = new Map<string, ScopeEntry>();
    existing.scopesTranslated.forEach(s => scopeMap.set(s.raw, s));
    event.scopesTranslated.forEach(s => scopeMap.set(s.raw, s));
    
    // Risk priority: AI analysis verdict wins over OAuth scopes.
    const isNewAnalysis = !!event.plainSummary;
    const hadAnalysis = !!existing.plainSummary;
    
    targetEvent = {
      ...existing,
      ...event, // new data wins (analysis, etc)
      appDomain: eventDomain, // Ensure it's normalized
      id: existing.id, // preserve ID
      overallRisk: (isNewAnalysis || hadAnalysis) 
        ? (isNewAnalysis ? event.overallRisk : existing.overallRisk)
        : event.overallRisk,
      scopesRaw: Array.from(new Set([...existing.scopesRaw, ...event.scopesRaw])),
      scopesTranslated: Array.from(scopeMap.values()),
      synced: false,
    };
    newEvents[existingIndex] = targetEvent;
    
    // Safety check: Remove any other duplicates of the same domain that might have snuck in
    newEvents = newEvents.filter((e, idx) => 
      idx === existingIndex || getBaseDomain(e.appDomain) !== eventDomain
    );
  } else {
    targetEvent = { 
      ...event, 
      appDomain: eventDomain, // Ensure it's normalized
      userId: event.userId || state.userId || undefined 
    };
    newEvents = [targetEvent, ...newEvents].slice(0, 500);
  }

  await saveState({ ...state, events: newEvents });
  return targetEvent.id;
}

export async function appendEvent(event: ConsentEvent): Promise<void> {
  await upsertEvent(event);
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

/** Clears auth session while preserving settings. */
export async function clearAuth(): Promise<void> {
  const state = await getState();
  await saveState({
    ...state,
    userId: null,
    userEmail: null,
    accessToken: null,
    handshakeComplete: false,
    isDemoMode: false,
    events: [],
  });
}
