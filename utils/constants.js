// Constants - Zentrale Konstanten für Kategorien, Allergene und App-weite Konfiguration
export const CATEGORIES = [
  { id: 'salty', label: 'Salty', color: '#4A90E2', icon: '🧂', slug: 'salty' },
  { id: 'sweet', label: 'Sweet', color: '#F5A623', icon: '🍯', slug: 'sweet' },
  { id: 'spicy', label: 'Spicy', color: '#D0021B', icon: '🌶️', slug: 'spicy' },
  { id: 'sour', label: 'Sour', color: '#7ED321', icon: '🍋', slug: 'sour' },
  { id: 'cold', label: 'Cold', color: '#50E3C2', icon: '🧊', slug: 'cold' },
  { id: 'hot', label: 'Hot', color: '#FF6F00', icon: '🔥', slug: 'hot' }
];
export const ALLERGENS = [
  { id: 'gluten', label: 'Contains Gluten', color: '#FF6B6B', icon: '🌾' },
  { id: 'dairy', label: 'Contains Dairy', color: '#4ECDC4', icon: '🥛' },
  { id: 'nuts', label: 'Contains Nuts', color: '#45B7D1', icon: '🥜' },
  { id: 'eggs', label: 'Contains Eggs', color: '#FFA502', icon: '🥚' },
  { id: 'soy', label: 'Contains Soy', color: '#9B59B6', icon: '🫛' },
  { id: 'shellfish', label: 'Contains Shellfish', color: '#E67E22', icon: '🦐' },
  { id: 'fish', label: 'Contains Fish', color: '#3498DB', icon: '🐟' },
  { id: 'sesame', label: 'Contains Sesame', color: '#F39C12', icon: '🌰' }
];
export const DIETARY = [
  { id: 'vegan', label: 'Vegan', color: '#27AE60', icon: '🌱' },
  { id: 'vegetarian', label: 'Vegetarian', color: '#2ECC71', icon: '🥬' },
  { id: 'gluten-free', label: 'Gluten Free', color: '#E74C3C', icon: '🚫' },
  { id: 'dairy-free', label: 'Dairy Free', color: '#3498DB', icon: '🚫' },
  { id: 'keto', label: 'Keto', color: '#8E44AD', icon: '🥑' },
  { id: 'paleo', label: 'Paleo', color: '#D35400', icon: '🥩' },
  { id: 'low-carb', label: 'Low Carb', color: '#16A085', icon: '📉' },
  { id: 'high-protein', label: 'High Protein', color: '#C0392B', icon: '💪' }
];
export const COLORS = {
  primary: '#0D6159',
  secondary: '#A5B68D',
  background: '#F8F9FA',
  white: '#FFFFFF',
  black: '#000000',
  gray: '#6C757D',
  lightGray: '#E9ECEF',
  success: '#0D6159',
  error: '#DC3545'
};