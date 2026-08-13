export type Note = {
  id: string;
  text: string;
  date: string;
};

export type Contact = {
  id: string;
  name: string;
  tier: number;
  email: string;
  phone: string;
  company: string;
  birthday: string;
  notes: Note[];
};

export type TierDefinition = {
  name: string;
  description: string;
  color: string;
  maxRecommended: number;
};
