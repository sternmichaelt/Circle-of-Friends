import type { TierDefinition } from "./types";

export const tierDefinitions: TierDefinition[] = [
  {
    name: "Inner Circle",
    description: "Your closest relationships (5-8 people)",
    color: "#38D15E",
    maxRecommended: 8,
  },
  {
    name: "Close Friends",
    description: "Important relationships, but not as close",
    color: "#33A1FD",
    maxRecommended: 15,
  },
  {
    name: "Friends",
    description: "Regular friends you enjoy spending time with",
    color: "#8B3FFD",
    maxRecommended: 30,
  },
  {
    name: "Acquaintances",
    description: "People you know but aren't close with",
    color: "#FF8C42",
    maxRecommended: 50,
  },
];
