import { api } from './api';
import { User, Store } from '../types';

export interface LoginCredentials {
    email: string;
    password?: string;
}

export interface AuthResponse {
    user: User;
    session: {
        access_token: string;
        refresh_token: string;
    };
    store?: Store; // Optional store info if shopkeeper
}

export const authService = {
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const { data } = await api.post<AuthResponse>('/auth/login', credentials);

        // Store token and user
        localStorage.setItem('auth_token', data.session.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));

        return data;
    },

    async logout(): Promise<void> {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Error logging out:', error);
        } finally {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            // Make sure these are cleared too if used
            localStorage.removeItem('user_session');
        }
    },

    getCurrentUser(): User | null {
        const userStr = localStorage.getItem('user');
        if (!userStr) return null;
        try {
            return JSON.parse(userStr);
        } catch {
            return null;
        }
    },

    isAuthenticated(): boolean {
        return !!localStorage.getItem('auth_token');
    }
};
