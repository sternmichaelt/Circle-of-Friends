"use client";

import { useEffect, useState, type MouseEvent } from "react";
import { RefreshCw } from "lucide-react";
import { tierDefinitions } from "@/lib/tiers";
import type { Contact } from "@/lib/types";

const RING_LAYOUT = [
  { tier: 3, size: "100%", radiusPercent: 56 },
  { tier: 2, size: "75%", radiusPercent: 44 },
  { tier: 1, size: "50%", radiusPercent: 32 },
  { tier: 0, size: "25%", radiusPercent: 16 },
] as const;

const MAX_ORBIT_LABELS = 8;

type CirclesDiagramProps = {
  contacts: Contact[];
  tierCounts: Record<number, number>;
  onSelectContact: (id: string) => void;
  onFlipToStacked: (tierIndex: number) => void;
};

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export default function CirclesDiagram({
  contacts,
  tierCounts,
  onSelectContact,
  onFlipToStacked,
}: CirclesDiagramProps) {
  const [activeOrbitTier, setActiveOrbitTier] = useState<number | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setReducedMotion(prefersReducedMotion());
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (activeOrbitTier === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveOrbitTier(null);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activeOrbitTier]);

  const finishFlip = (tierIndex: number) => {
    setIsFlipping(false);
    setActiveOrbitTier(null);
    onFlipToStacked(tierIndex);
  };

  const startFlip = (tierIndex: number) => {
    if (isFlipping) return;
    if (reducedMotion) {
      finishFlip(tierIndex);
      return;
    }
    setIsFlipping(true);
    window.setTimeout(() => finishFlip(tierIndex), 500);
  };

  const handleRingClick = (tierIndex: number, e: MouseEvent) => {
    e.stopPropagation();
    if (isFlipping) return;
    if (activeOrbitTier === tierIndex) {
      startFlip(tierIndex);
      return;
    }
    setActiveOrbitTier(tierIndex);
  };

  const orbitContacts =
    activeOrbitTier === null
      ? []
      : contacts.filter((c) => c.tier === activeOrbitTier);
  const visibleOrbit = orbitContacts.slice(0, MAX_ORBIT_LABELS);
  const overflowCount = Math.max(0, orbitContacts.length - visibleOrbit.length);
  const activeRadius =
    RING_LAYOUT.find((r) => r.tier === activeOrbitTier)?.radiusPercent ?? 40;

  return (
    <div className="w-full flex flex-col items-center mb-6 mt-4">
      <div
        className={`relative flex flex-col items-center justify-center mx-auto ${
          isFlipping ? "cof-flip-out" : ""
        }`}
        style={{
          height: "min(600px, 90vw)",
          width: "min(600px, 90vw)",
          perspective: "1200px",
        }}
        onClick={() => {
          if (!isFlipping) setActiveOrbitTier(null);
        }}
        role="presentation"
      >
        <div className="relative w-full h-full">
          {RING_LAYOUT.map(({ tier, size }) => {
            const isOuter = tier === 3;
            const isActive = activeOrbitTier === tier;
            const isDimmed = activeOrbitTier !== null && !isActive;
            return (
              <button
                key={tier}
                type="button"
                onClick={(e) => handleRingClick(tier, e)}
                className={`absolute rounded-full focus:outline-none focus-visible:ring-4 focus-visible:ring-white/80 transition-opacity duration-300 ${
                  isOuter
                    ? "top-0 left-0 w-full h-full"
                    : "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                } ${isActive ? "ring-4 ring-white/90 shadow-lg" : ""}`}
                style={{
                  backgroundColor: tierDefinitions[tier].color,
                  opacity: isDimmed ? 0.35 : 1,
                  width: isOuter ? undefined : size,
                  height: isOuter ? undefined : size,
                  border: isOuter ? undefined : "4px solid white",
                  cursor: "pointer",
                  zIndex: 10 - tier,
                }}
                aria-label={
                  isActive
                    ? `Flip ${tierDefinitions[tier].name} to list view`
                    : `Explore ${tierDefinitions[tier].name}`
                }
                aria-pressed={isActive}
              >
                <span className="absolute top-4 left-1/2 -translate-x-1/2 text-white px-3 py-1 font-bold pointer-events-none">
                  {tierDefinitions[tier].name}
                </span>
                <span
                  className={`absolute left-1/2 -translate-x-1/2 text-white px-3 py-1 font-bold text-xl pointer-events-none ${
                    tier === 0 ? "bottom-4" : "bottom-8"
                  }`}
                >
                  {tierCounts[tier] || 0}
                </span>
              </button>
            );
          })}

          {activeOrbitTier !== null && !isFlipping && (
            <>
              <div
                className={`absolute inset-0 z-20 pointer-events-none ${
                  reducedMotion ? "" : "cof-orbit-spin"
                }`}
              >
                {visibleOrbit.map((contact, index) => {
                  const angle =
                    (index / Math.max(visibleOrbit.length, 1)) * Math.PI * 2 -
                    Math.PI / 2;
                  const x = 50 + Math.cos(angle) * activeRadius;
                  const y = 50 + Math.sin(angle) * activeRadius;
                  const crowded = visibleOrbit.length > 5;
                  const label = crowded
                    ? initials(contact.name)
                    : contact.name.split(" ")[0];

                  return (
                    <button
                      key={contact.id}
                      type="button"
                      className={`absolute pointer-events-auto rounded-full bg-white text-gray-900 shadow-md border border-white/80 px-2.5 py-1 text-xs font-semibold hover:scale-105 ${
                        reducedMotion ? "" : "cof-orbit-label"
                      }`}
                      style={{
                        left: `${x}%`,
                        top: `${y}%`,
                        ...(reducedMotion
                          ? { transform: "translate(-50%, -50%)" }
                          : {}),
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectContact(contact.id);
                      }}
                      aria-label={`Open ${contact.name}`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              {overflowCount > 0 && (
                <div className="absolute left-1/2 top-[58%] -translate-x-1/2 z-30 pointer-events-none rounded-full bg-black/50 text-white text-xs font-bold px-3 py-1">
                  +{overflowCount} more
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {activeOrbitTier === null ? (
        <p className="text-sm text-gray-500 mt-2">Click a ring to explore</p>
      ) : (
        <div className="mt-3 flex flex-col sm:flex-row items-center gap-2">
          <p className="text-sm text-gray-700 font-medium">
            Exploring {tierDefinitions[activeOrbitTier].name}
            {orbitContacts.length === 0 ? " — no one here yet" : ""}
          </p>
          <button
            type="button"
            onClick={() => startFlip(activeOrbitTier)}
            disabled={isFlipping}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-60"
          >
            <RefreshCw size={14} />
            Flip to list
          </button>
          <button
            type="button"
            onClick={() => setActiveOrbitTier(null)}
            className="px-3 py-1.5 rounded-md text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300"
          >
            Back
          </button>
        </div>
      )}
    </div>
  );
}
