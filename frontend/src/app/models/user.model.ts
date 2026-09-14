// frontend/src/app/models/user.model.ts
export interface User {
  id?: number;
  nombre: string;
  email: string;
  password?: string;
  avatar?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserProfile {
  id: number;
  nombre: string;
  email: string;
  avatar?: string;
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  memberSince: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends User {
  confirmPassword?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  expiresIn?: number;
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user'
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: 'es' | 'en';
  currency: string;
  notifications: {
    email: boolean;
    push: boolean;
    weeklyReport: boolean;
  };
}