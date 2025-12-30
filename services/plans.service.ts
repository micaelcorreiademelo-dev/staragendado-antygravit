import { api } from './api';

export interface Plan {
    id: string;
    nome: string;
    limite_profissionais: number;
    limite_agendamentos: number;
    permite_pagamentos_online: boolean;
    permite_integracao_calendar: boolean;
    price?: number;
    description?: string;
    active?: boolean;
    highlight?: boolean;
    features?: any;
    vigencia_dias?: number;
    hidden?: boolean;
    is_default?: boolean;
}

export interface CreatePlanData {
    nome: string;
    limite_profissionais: number;
    limite_agendamentos: number;
    permite_pagamentos_online?: boolean;
    permite_integracao_calendar?: boolean;
    price?: number;
    description?: string;
    active?: boolean;
    highlight?: boolean;
    features?: any;
    vigencia_dias?: number;
    hidden?: boolean;
    is_default?: boolean;
}

export const plansService = {
    async getAll(): Promise<Plan[]> {
        const { data } = await api.get<Plan[]>('/planos');
        return data;
    },

    async create(planData: CreatePlanData): Promise<{ id: string }> {
        const { data } = await api.post<{ id: string }>('/planos', planData);
        return data;
    },

    async update(id: string, planData: Partial<CreatePlanData>): Promise<{ message: string }> {
        const { data } = await api.put<{ message: string }>(`/planos/${id}`, planData);
        return data;
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/planos/${id}`);
    },

    async setDefault(id: string): Promise<{ message: string }> {
        const { data } = await api.put<{ message: string }>(`/planos/${id}/default`, {});
        return data;
    }
};
