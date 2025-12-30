
import { api } from './api';

export interface Segment {
    id: string;
    nome: string;
    active: boolean;
}

export interface CreateSegmentData {
    nome: string;
    active?: boolean;
}

export const segmentsService = {
    async getAll(): Promise<Segment[]> {
        const { data } = await api.get<Segment[]>('/segmentos');
        return data;
    },

    async create(data: CreateSegmentData): Promise<{ id: string }> {
        const { data: response } = await api.post<{ id: string }>('/segmentos', data);
        return response;
    },

    async update(id: string, data: Partial<CreateSegmentData>): Promise<{ message: string }> {
        const { data: response } = await api.put<{ message: string }>(`/segmentos/${id}`, data);
        return response;
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/segmentos/${id}`);
    }
};
