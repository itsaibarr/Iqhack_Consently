import { ScopeEntry } from "./types";

export const SCOPE_MAP: Record<string, Omit<ScopeEntry, "raw">> = {
  // Google — Identity
  "email":                                        { label: "Your email address",                  category: "identity",      risk: "LOW" },
  "profile":                                      { label: "Your name and profile photo",          category: "identity",      risk: "LOW" },
  "openid":                                       { label: "Verify your identity (OpenID)",        category: "identity",      risk: "LOW" },

  // Google — Gmail
  "https://www.googleapis.com/auth/gmail.readonly":      { label: "Read all your emails",         category: "communication", risk: "HIGH" },
  "https://www.googleapis.com/auth/gmail.send":          { label: "Send emails on your behalf",   category: "communication", risk: "HIGH" },
  "https://www.googleapis.com/auth/gmail.modify":        { label: "Read, delete and modify emails", category: "communication", risk: "HIGH" },

  // Google — Calendar
  "https://www.googleapis.com/auth/calendar":            { label: "Read and write your calendar", category: "calendar",      risk: "MEDIUM" },
  "https://www.googleapis.com/auth/calendar.readonly":   { label: "Read your calendar events",    category: "calendar",      risk: "MEDIUM" },

  // Google — Drive
  "https://www.googleapis.com/auth/drive":               { label: "Access all files in your Drive", category: "files",       risk: "HIGH" },
  "https://www.googleapis.com/auth/drive.readonly":      { label: "Read all files in your Drive",   category: "files",       risk: "HIGH" },
  "https://www.googleapis.com/auth/drive.file":          { label: "Access files this app creates",  category: "files",       risk: "LOW" },

  // Google — Contacts
  "https://www.googleapis.com/auth/contacts":            { label: "Read and write your contacts", category: "communication", risk: "HIGH" },
  "https://www.googleapis.com/auth/contacts.readonly":   { label: "Read your contacts list",      category: "communication", risk: "HIGH" },

  // GitHub
  "read:user":       { label: "Read your GitHub profile",          category: "identity",  risk: "LOW" },
  "user:email":      { label: "Read your GitHub email addresses",  category: "identity",  risk: "LOW" },
  "repo":            { label: "Full access to all your repositories", category: "files",  risk: "HIGH" },
  "public_repo":     { label: "Read your public repositories",     category: "files",     risk: "LOW" },
  "read:org":        { label: "Read your organization membership", category: "access",    risk: "MEDIUM" },
  "write:org":       { label: "Manage your organization membership", category: "access",  risk: "HIGH" },
};

export function translateScope(raw: string): ScopeEntry {
  const entry = SCOPE_MAP[raw];
  if (entry) return { raw, ...entry };
  return { 
    raw, 
    label: `Unrecognized permission: ${raw}`, 
    category: "access", 
    risk: "MEDIUM" 
  };
}
