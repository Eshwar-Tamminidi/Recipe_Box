export interface Recipe {
  id: number;
  name: string;
  ingredients: string;
  steps: string;
  photoUrl: string | null;
  cookingTime: number;
  cuisine: string;
  isFavorite: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface RecipeFormData {
  name: string;
  ingredients: string;
  steps: string;
  photoUrl: string | null;
  cookingTime: number;
  cuisine: string;
  isFavorite: boolean;
}

export interface RecipeFilter {
  cuisine: string;
  search: string;
  favorite: boolean;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export type ToastSeverity = 'success' | 'error' | 'warning' | 'info';

export interface ToastState {
  open: boolean;
  severity: ToastSeverity;
  message: string;
}
