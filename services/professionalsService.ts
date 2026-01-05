import { api } from './api';
import { Professional } from '../types';

export const professionalsService = {
  async getAll(): Promise<Professional[]> {
    const { data } = await api.get<Professional[]>('/profissionais');
    return data;
  },

  async getById(id: string): Promise<Professional> {
    const { data } = await api.get<Professional>(`/profissionais/${id}`);
    return data;
  },

  async create(professional: Omit<Professional, 'id'>): Promise<Professional> {
    const { data } = await api.post<Professional>('/profissionais', professional);
    return data;
  },

  async update(id: string, professional: Partial<Professional>): Promise<Professional> {
    const { data } = await api.put<Professional>(`/profissionais/${id}`, professional);
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/profissionais/${id}`);
  }
};
