import { apiService } from './api';

export interface User {
  id: string;
  email: string;
  isAdmin?: boolean;
}

export const signUp = async (email: string, password: string) => {
  const response = await apiService.post<{ token: string; user: User }>(
    '/auth/register',
    { email, password }
  );

  if (response.error) {
    throw new Error(response.error);
  }

  if (response.data) {
    apiService.setToken(response.data.token);
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  }

  throw new Error('Registration failed');
};

export const signIn = async (email: string, password: string) => {
  const response = await apiService.post<{ token: string; user: User }>(
    '/auth/login',
    { email, password }
  );

  if (response.error) {
    throw new Error(response.error);
  }

  if (response.data) {
    apiService.setToken(response.data.token);
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  }

  throw new Error('Login failed');
};

export const signOut = () => {
  apiService.setToken(null);
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user');
  }
};

export const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

export const getStoredUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

