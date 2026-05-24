// src/types/auth.ts
export interface User {
  id: string | number;
  username?: string;
  full_name?: string;
  email?: string;
  role?: string;
  avatar?: string;
}

export interface AuthState {
  access_token: string | null;
  user: User | null;
  setAuth: (user: User, access_token: string) => void;
  logout: () => void;
}