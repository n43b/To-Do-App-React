export interface Category {
  id: string;
  name: string;
  color: string;
}

export const CATEGORIES: Category[] = [
  { id: "none", name: "Keine", color: "#8E8E93" },
  { id: "work", name: "Arbeit", color: "#007AFF" },
  { id: "personal", name: "Privat", color: "#34C759" },
  { id: "shopping", name: "Einkaufen", color: "#FF9500" },
  { id: "health", name: "Gesundheit", color: "#FF2D55" },
  { id: "finance", name: "Finanzen", color: "#5856D6" },
];

export const getCategoryById = (id: string): Category => {
  return CATEGORIES.find((cat) => cat.id === id) || CATEGORIES[0];
};
