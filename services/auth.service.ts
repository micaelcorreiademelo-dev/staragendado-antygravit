import { api } from './api';

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface User {
    id: string;
    email: string;
    full_name: string;
    role: 'admin' | 'lojista' | 'profissional' | 'cliente';
    loja_id?: string;
    permissions?: Record<string, boolean>;
}

export interface AuthResponse {
    session: {
        access_token: string;
        refresh_token: string;
    };
    user: User;
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
        } finally {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
        }
    },

    async getCurrentUser(): Promise<User> {
        const { data } = await api.get<User>('/auth/me');
        localStorage.setItem('user', JSON.stringify(data));
        return data;
    },

    getStoredUser(): User | null {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    isAuthenticated(): boolean {
        return !!localStorage.getItem('auth_token');
    },
};
