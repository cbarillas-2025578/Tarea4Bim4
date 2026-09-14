export interface Category {
  id: number;
  name: string;
  type: string;
  color: string;
  icon: string;
  createdAt: string;
}

export interface CreateCategoryDTO {
  name: string;
  type: string;
  color?: string;
  icon?: string;
}

export interface UpdateCategoryDTO {
  name?: string;
  type?: string;
  color?: string;
  icon?: string;
}

export const CATEGORY_ICONS: string[] = [
  "📁",
  "🍽️",
  "🚗",
  "🏠",
  "💡",
  "🎮",
  "🏥",
  "📚",
  "🛍️",
  "📦",
  "💰",
  "💻",
  "📈",
  "🎁",
  "🏆",
  "💵",
  "✈️",
  "👕",
  "🍿",
  "🔧",
];

export const CATEGORY_COLORS: string[] = [
  "#38BDF8",
  "#22C55E",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#F97316",
  "#10B981",
  "#3B82F6",
  "#6B7280",
  "#14B8A6",
  "#A855F7",
];