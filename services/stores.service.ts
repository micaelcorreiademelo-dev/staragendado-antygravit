import { api } from './api';

export interface Store {
    id: string;
    nome: string;
    email: string;
    status: 'ativa' | 'bloqueada' | 'pendente';
    lojista_id?: string;
    plano_id?: string;
    plan_expires_at?: string;
    created_at: string;
    // Campos populados em getById
    lojista_nome?: string;
    lojista_telefone?: string;
    segmento_id?: string;
}

export interface CreateStoreData {
    nome: string;
    email: string;
    plano_id?: string;
    status?: 'ativa' | 'bloqueada' | 'pendente';
    // Dados do lojista (criado junto com a loja)
    lojista_nome: string;
    lojista_email: string;
    lojista_telefone?: string;
    lojista_senha: string;
    segmento_id?: string;
}

export interface UpdateStoreData {
    nome?: string;
    email?: string;
    lojista_id?: string;
    plano_id?: string;
    status?: 'ativa' | 'bloqueada' | 'pendente';
    plan_expires_at?: string | null;
    lojista_senha?: string;
    lojista_email?: string;
    segmento_id?: string;
}

export interface StoresFilters {
    status?: 'ativa' | 'bloqueada' | 'pendente';
    plano_id?: string;
    lojista_id?: string;
}

export const storesService = {
    async getAll(filters?: StoresFilters): Promise<Store[]> {
        const { data } = await api.get<Store[]>('/lojas', { params: filters });
        return data;
    },

    async getById(id: string): Promise<Store> {
        const { data } = await api.get<Store>(`/lojas/${id}`);
        return data;
    },

    async create(storeData: CreateStoreData): Promise<{ id: string }> {
        const { data } = await api.post<{ id: string }>('/lojas', storeData);
        return data;
    },

    async update(id: string, storeData: UpdateStoreData): Promise<{ message: string }> {
        const { data } = await api.put<{ message: string }>(`/lojas/${id}`, storeData);
        return data;
    },

    async delete(id: string): Promise<{ message: string }> {
        const { data } = await api.delete<{ message: string }>(`/lojas/${id}`);
        return data;
    },
};
