import type { Contact } from "./types";

export const CONTACTS_STORAGE_KEY = "circle-of-friends:contacts";

export function loadContacts(): Contact[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CONTACTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Contact[];
    if (!Array.isArray(parsed)) return [];
    return parsed.map((contact) => ({
      ...contact,
      notes: Array.isArray(contact.notes) ? contact.notes : [],
    }));
  } catch {
    return [];
  }
}

export function saveContacts(contacts: Contact[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(contacts));
  } catch {
    // Ignore quota / private-mode write failures
  }
}
