import { seedContacts } from "./seedContacts";
import type { Contact } from "./types";

export const CONTACTS_STORAGE_KEY = "circle-of-friends:contacts";

function normalizeContacts(contacts: Contact[]): Contact[] {
  return contacts.map((contact) => ({
    ...contact,
    notes: Array.isArray(contact.notes) ? contact.notes : [],
  }));
}

export function loadContacts(): Contact[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CONTACTS_STORAGE_KEY);
    if (!raw) {
      saveContacts(seedContacts);
      return normalizeContacts(seedContacts);
    }
    const parsed = JSON.parse(raw) as Contact[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      saveContacts(seedContacts);
      return normalizeContacts(seedContacts);
    }
    return normalizeContacts(parsed);
  } catch {
    saveContacts(seedContacts);
    return normalizeContacts(seedContacts);
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
