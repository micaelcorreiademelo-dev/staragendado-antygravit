import { api } from './api';

export interface User {
    id: string;
    email: string;
    full_name: string;
    role: 'admin' | 'lojista' | 'profissional';
    created_at: string;
}

export const usersService = {
    async getAll(filters?: { role?: string }): Promise<User[]> {
        const { data } = await api.get<User[]>('/users', { params: filters });
        return data;
    },

    async getLojistas(): Promise<User[]> {
        const { data } = await api.get<User[]>('/users', { params: { role: 'lojista' } });
        return data;
    },

    async getById(id: string): Promise<User> {
        const { data } = await api.get<User>(`/users/${id}`);
        return data;
    },
};
