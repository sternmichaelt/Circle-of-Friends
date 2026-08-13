"use client";

import { useEffect, useState } from "react";
import {
  X,
  Plus,
  BarChart,
  Users,
  ChevronDown,
  ChevronRight,
  Mail,
  Phone,
  Briefcase,
  Cake,
  FileText,
  Trash2,
} from "lucide-react";
import { generateId } from "@/lib/ids";
import { loadContacts, saveContacts } from "@/lib/storage";
import { tierDefinitions } from "@/lib/tiers";
import type { Contact } from "@/lib/types";

type ViewMode = "circles" | "rectangles";

export default function RelationshipCircles() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [newName, setNewName] = useState("");
  const [selectedTier, setSelectedTier] = useState(0);
  const [showStats, setShowStats] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [expandedTiers, setExpandedTiers] = useState<Record<number, boolean>>({});
  const [expandedLists, setExpandedLists] = useState<Record<number, boolean>>({});
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [newNoteText, setNewNoteText] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("circles");
  const [expandedRects, setExpandedRects] = useState<Record<number, boolean>>({});
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    setContacts(loadContacts());
    const initTiers: Record<number, boolean> = {};
    const initLists: Record<number, boolean> = {};
    tierDefinitions.forEach((_, index) => {
      initTiers[index] = true;
      initLists[index] = true;
    });
    setExpandedTiers(initTiers);
    setExpandedLists(initLists);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveContacts(contacts);
  }, [contacts, hydrated]);

  useEffect(() => {
    if (!selectedContactId) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedContactId(null);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selectedContactId]);

  useEffect(() => {
    if (!confirmDeleteId) return;
    const t = setTimeout(() => setConfirmDeleteId(null), 3000);
    return () => clearTimeout(t);
  }, [confirmDeleteId]);

  const addContact = () => {
    if (newName.trim() === "") return;
    const newContact: Contact = {
      id: generateId(),
      name: newName.trim(),
      tier: selectedTier,
      email: "",
      phone: "",
      company: "",
      birthday: "",
      notes: [],
    };
    setContacts([...contacts, newContact]);
    setNewName("");
    setShowForm(false);
  };

  const removeContact = (id: string) => {
    setContacts(contacts.filter((contact) => contact.id !== id));
    if (selectedContactId === id) setSelectedContactId(null);
    setConfirmDeleteId(null);
  };

  const moveContact = (id: string, newTier: number) => {
    setContacts(
      contacts.map((contact) =>
        contact.id === id ? { ...contact, tier: newTier } : contact
      )
    );
  };

  const updateContactField = (
    id: string,
    field: "email" | "phone" | "company" | "birthday",
    value: string
  ) => {
    setContacts(
      contacts.map((contact) =>
        contact.id === id ? { ...contact, [field]: value } : contact
      )
    );
  };

  const addNote = (id: string) => {
    if (newNoteText.trim() === "") return;
    const note = {
      id: generateId(),
      text: newNoteText.trim(),
      date: new Date().toLocaleDateString(),
    };
    setContacts(
      contacts.map((contact) =>
        contact.id === id
          ? { ...contact, notes: [note, ...(contact.notes || [])] }
          : contact
      )
    );
    setNewNoteText("");
  };

  const removeNote = (contactId: string, noteId: string) => {
    setContacts(
      contacts.map((contact) =>
        contact.id === contactId
          ? { ...contact, notes: contact.notes.filter((n) => n.id !== noteId) }
          : contact
      )
    );
  };

  const toggleTier = (tierIndex: number) => {
    setExpandedTiers((prev) => ({
      ...prev,
      [tierIndex]: !prev[tierIndex],
    }));
  };

  const toggleList = (tierIndex: number) => {
    setExpandedLists((prev) => ({
      ...prev,
      [tierIndex]: !prev[tierIndex],
    }));
  };

  const toggleRect = (tierIndex: number) => {
    setExpandedRects((prev) => ({
      ...prev,
      [tierIndex]: !prev[tierIndex],
    }));
  };

  const countByTier = () => {
    const counts: Record<number, number> = {};
    tierDefinitions.forEach((_, index) => {
      counts[index] = contacts.filter((contact) => contact.tier === index).length;
    });
    return counts;
  };

  const tierCounts = countByTier();
  const selectedContact =
    contacts.find((c) => c.id === selectedContactId) || null;

  const renderContactList = (tierIndex: number) => (
    <ul className="space-y-2">
      {contacts
        .filter((contact) => contact.tier === tierIndex)
        .map((contact) => (
          <li
            key={contact.id}
            className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
          >
            <button
              onClick={() => setSelectedContactId(contact.id)}
              className="text-left hover:underline hover:text-blue-600"
            >
              {contact.name}
            </button>
            <div className="flex items-center space-x-1">
              <select
                value={contact.tier}
                onChange={(e) => moveContact(contact.id, Number(e.target.value))}
                className="text-xs p-1 border rounded"
                aria-label={`Change tier for ${contact.name}`}
              >
                {tierDefinitions.map((t, i) => (
                  <option key={i} value={i}>
                    Move to {t.name}
                  </option>
                ))}
              </select>
              {confirmDeleteId === contact.id ? (
                <button
                  onClick={() => removeContact(contact.id)}
                  className="px-2 py-1 text-xs bg-red-500 text-white rounded whitespace-nowrap"
                >
                  Confirm?
                </button>
              ) : (
                <button
                  onClick={() => setConfirmDeleteId(contact.id)}
                  className="p-1 text-red-500 rounded-full hover:bg-red-100"
                  aria-label={`Remove ${contact.name}`}
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </li>
        ))}

      {tierCounts[tierIndex] === 0 && (
        <p className="text-sm text-gray-400 italic flex items-center justify-center py-2">
          <Users size={14} className="mr-1" /> No relationships in this tier
        </p>
      )}
    </ul>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto w-full">
      <h1 className="text-2xl font-bold mb-4 text-center">Circle of Friends</h1>

      <div className="mb-6 flex space-x-4">
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md"
        >
          <Plus size={16} className="mr-2" /> Add Relationship
        </button>
        <button
          onClick={() => setShowStats(!showStats)}
          className="flex items-center px-4 py-2 bg-gray-200 rounded-md text-gray-900"
        >
          <BarChart size={16} className="mr-2" />{" "}
          {showStats ? "Hide" : "Show"} Stats
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-4 rounded-md shadow-md mb-6 w-full max-w-md text-gray-900">
          <h2 className="text-lg font-semibold mb-2">Add New Relationship</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                Person&apos;s Name
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addContact()}
                className="w-full p-2 border rounded-md"
                placeholder="Enter name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Relationship Tier
              </label>
              <select
                value={selectedTier}
                onChange={(e) => setSelectedTier(Number(e.target.value))}
                className="w-full p-2 border rounded-md"
              >
                {tierDefinitions.map((tier, index) => (
                  <option key={index} value={index}>
                    {tier.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={addContact}
                className="px-4 py-2 bg-blue-500 text-white rounded-md"
              >
                Add
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-200 rounded-md"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showStats && (
        <div className="bg-white p-4 rounded-md shadow-md mb-6 w-full max-w-md text-gray-900">
          <h2 className="text-lg font-semibold mb-2 flex items-center">
            <BarChart size={20} className="mr-2" /> Relationship Statistics
          </h2>
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Tier</th>
                <th className="text-center py-2">Count</th>
                <th className="text-right py-2">Recommended</th>
              </tr>
            </thead>
            <tbody>
              {tierDefinitions.map((tier, index) => (
                <tr key={index} className="border-b">
                  <td className="py-2">{tier.name}</td>
                  <td className="text-center py-2">
                    <span
                      className={
                        tierCounts[index] > tier.maxRecommended
                          ? "text-red-500 font-bold"
                          : ""
                      }
                    >
                      {tierCounts[index] || 0}
                    </span>
                  </td>
                  <td className="text-right py-2">0-{tier.maxRecommended}</td>
                </tr>
              ))}
              <tr className="font-semibold">
                <td className="py-2">Total</td>
                <td className="text-center py-2">{contacts.length}</td>
                <td className="text-right py-2"></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <div className="mb-4 flex space-x-2">
        <button
          onClick={() => setViewMode("circles")}
          className={`px-3 py-1.5 rounded-md text-sm font-medium ${
            viewMode === "circles"
              ? "bg-gray-800 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Concentric Circles
        </button>
        <button
          onClick={() => setViewMode("rectangles")}
          className={`px-3 py-1.5 rounded-md text-sm font-medium ${
            viewMode === "rectangles"
              ? "bg-gray-800 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Stacked View
        </button>
      </div>

      {viewMode === "circles" && (
        <div
          className="relative flex flex-col items-center justify-center mb-6 mt-4 mx-auto"
          style={{ height: "min(600px, 90vw)", width: "min(600px, 90vw)" }}
        >
          <div className="relative w-full h-full">
            <div
              className="absolute top-0 left-0 w-full h-full rounded-full"
              style={{ backgroundColor: tierDefinitions[3].color, opacity: 1 }}
            >
              <span className="absolute top-4 left-1/2 transform -translate-x-1/2 text-white px-3 py-1 font-bold">
                {tierDefinitions[3].name}
              </span>
              <span className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white px-3 py-1 font-bold text-xl">
                {tierCounts[3] || 0}
              </span>
            </div>

            <div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                backgroundColor: tierDefinitions[2].color,
                opacity: 1,
                width: "75%",
                height: "75%",
                border: "4px solid white",
              }}
            >
              <span className="absolute top-4 left-1/2 transform -translate-x-1/2 text-white px-3 py-1 font-bold">
                {tierDefinitions[2].name}
              </span>
              <span className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white px-3 py-1 font-bold text-xl">
                {tierCounts[2] || 0}
              </span>
            </div>

            <div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                backgroundColor: tierDefinitions[1].color,
                opacity: 1,
                width: "50%",
                height: "50%",
                border: "4px solid white",
              }}
            >
              <span className="absolute top-4 left-1/2 transform -translate-x-1/2 text-white px-3 py-1 font-bold">
                {tierDefinitions[1].name}
              </span>
              <span className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white px-3 py-1 font-bold text-xl">
                {tierCounts[1] || 0}
              </span>
            </div>

            <div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                backgroundColor: tierDefinitions[0].color,
                opacity: 1,
                width: "25%",
                height: "25%",
                border: "4px solid white",
              }}
            >
              <span className="absolute top-4 left-1/2 transform -translate-x-1/2 text-white px-3 py-1 font-bold">
                {tierDefinitions[0].name}
              </span>
              <span className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white px-3 py-1 font-bold text-xl">
                {tierCounts[0] || 0}
              </span>
            </div>
          </div>
        </div>
      )}

      {viewMode === "rectangles" && (
        <div
          className="flex flex-col items-center mb-6 mt-4 w-full"
          style={{ maxWidth: "500px", margin: "0 auto" }}
        >
          {tierDefinitions.map((tier, index) => (
            <div key={index} className="w-full mb-2">
              <button
                onClick={() => toggleRect(index)}
                className="flex items-center justify-between text-white font-bold rounded-md shadow-md px-6 cursor-pointer w-full"
                style={{ backgroundColor: tier.color, height: "90px" }}
                aria-expanded={!!expandedRects[index]}
              >
                <div className="flex items-center">
                  {expandedRects[index] ? (
                    <ChevronDown size={20} className="mr-2" />
                  ) : (
                    <ChevronRight size={20} className="mr-2" />
                  )}
                  <span className="text-lg">{tier.name}</span>
                </div>
                <span className="text-2xl">{tierCounts[index] || 0}</span>
              </button>

              {expandedRects[index] && (
                <div className="bg-white rounded-md shadow-md p-4 mt-1 text-gray-900">
                  {renderContactList(index)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {viewMode === "circles" && (
        <div className="grid grid-cols-1 gap-4 w-full">
          {tierDefinitions.map((tier, tierIndex) => (
            <div
              key={tierIndex}
              className="bg-white rounded-md shadow-md overflow-hidden text-gray-900"
            >
              <button
                className="w-full p-4 cursor-pointer flex items-center justify-between text-left"
                onClick={() => toggleTier(tierIndex)}
                style={{ borderLeft: `4px solid ${tier.color}` }}
                aria-expanded={!!expandedTiers[tierIndex]}
              >
                <div className="flex items-center">
                  {expandedTiers[tierIndex] ? (
                    <ChevronDown size={20} className="mr-2" />
                  ) : (
                    <ChevronRight size={20} className="mr-2" />
                  )}
                  <h2
                    className="text-lg font-semibold"
                    style={{ color: tier.color }}
                  >
                    {tier.name}{" "}
                    <span className="text-gray-500 text-sm">
                      ({tierCounts[tierIndex] || 0})
                    </span>
                  </h2>
                </div>
                <span className="text-sm text-gray-500">{tier.description}</span>
              </button>

              {expandedTiers[tierIndex] && (
                <div className="px-4 pb-4">
                  <button
                    className="w-full py-2 cursor-pointer flex items-center mb-2 border-b text-left"
                    onClick={() => toggleList(tierIndex)}
                    aria-expanded={!!expandedLists[tierIndex]}
                  >
                    {expandedLists[tierIndex] ? (
                      <ChevronDown size={16} className="mr-2" />
                    ) : (
                      <ChevronRight size={16} className="mr-2" />
                    )}
                    <span className="text-sm font-medium">
                      {tierCounts[tierIndex] || 0} Relationships
                    </span>
                  </button>

                  {expandedLists[tierIndex] && renderContactList(tierIndex)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedContact && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedContactId(null)}
          role="presentation"
        >
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto text-gray-900"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={`Details for ${selectedContact.name}`}
          >
            <div
              className="p-4 flex items-center justify-between border-b"
              style={{
                borderTop: `4px solid ${tierDefinitions[selectedContact.tier].color}`,
              }}
            >
              <div>
                <h2 className="text-xl font-bold">{selectedContact.name}</h2>
                <span
                  className="text-sm font-medium"
                  style={{
                    color: tierDefinitions[selectedContact.tier].color,
                  }}
                >
                  {tierDefinitions[selectedContact.tier].name}
                </span>
              </div>
              <button
                onClick={() => setSelectedContactId(null)}
                className="p-1 text-gray-500 rounded-full hover:bg-gray-100"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                  Contact Info
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Mail size={16} className="text-gray-400 flex-shrink-0" />
                    <input
                      type="email"
                      value={selectedContact.email}
                      onChange={(e) =>
                        updateContactField(
                          selectedContact.id,
                          "email",
                          e.target.value
                        )
                      }
                      placeholder="Email address"
                      className="w-full p-1.5 border rounded-md text-sm"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone size={16} className="text-gray-400 flex-shrink-0" />
                    <input
                      type="tel"
                      value={selectedContact.phone}
                      onChange={(e) =>
                        updateContactField(
                          selectedContact.id,
                          "phone",
                          e.target.value
                        )
                      }
                      placeholder="Phone number"
                      className="w-full p-1.5 border rounded-md text-sm"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                  General Info
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Briefcase
                      size={16}
                      className="text-gray-400 flex-shrink-0"
                    />
                    <input
                      type="text"
                      value={selectedContact.company}
                      onChange={(e) =>
                        updateContactField(
                          selectedContact.id,
                          "company",
                          e.target.value
                        )
                      }
                      placeholder="Company / role"
                      className="w-full p-1.5 border rounded-md text-sm"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Cake size={16} className="text-gray-400 flex-shrink-0" />
                    <input
                      type="text"
                      value={selectedContact.birthday}
                      onChange={(e) =>
                        updateContactField(
                          selectedContact.id,
                          "birthday",
                          e.target.value
                        )
                      }
                      placeholder="Birthday"
                      className="w-full p-1.5 border rounded-md text-sm"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2 flex items-center">
                  <FileText size={14} className="mr-1" /> Notes
                </h3>
                <div className="flex space-x-2 mb-3">
                  <textarea
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder="Add a note about this person..."
                    className="w-full p-2 border rounded-md text-sm resize-none"
                    rows={2}
                  />
                  <button
                    onClick={() => addNote(selectedContact.id)}
                    className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm self-start"
                  >
                    Add
                  </button>
                </div>
                <div className="space-y-2">
                  {(selectedContact.notes || []).length === 0 && (
                    <p className="text-sm text-gray-400 italic">No notes yet.</p>
                  )}
                  {(selectedContact.notes || []).map((note) => (
                    <div
                      key={note.id}
                      className="bg-gray-50 p-2 rounded-md flex items-start justify-between"
                    >
                      <div>
                        <p className="text-sm">{note.text}</p>
                        <p className="text-xs text-gray-400 mt-1">{note.date}</p>
                      </div>
                      <button
                        onClick={() => removeNote(selectedContact.id, note.id)}
                        className="p-1 text-gray-400 hover:text-red-500 flex-shrink-0"
                        aria-label="Delete note"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
