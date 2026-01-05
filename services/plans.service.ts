import { api } from './api';

export interface PlanFeature {
    displayFeatures?: string[];
    // outras props
    [key: string]: any;
}

export interface Plan {
    id: string;
    nome: string;
    description: string;
    price: number;
    limite_profissionais: number; // -1 for unlimited
    limite_agendamentos: number; // -1 for unlimited
    permite_pagamentos_online: boolean;
    permite_integracao_calendar: boolean;
    features?: PlanFeature;
    active: boolean;
    is_default?: boolean;
    vigencia_dias?: number;
}

export interface CreatePlanData {
    nome: string;
    description: string;
    price: number;
    limite_profissionais: number;
    limite_agendamentos: number;
    permite_pagamentos_online: boolean;
    permite_integracao_calendar: boolean;
    features?: any;
    vigencia_dias?: number;
    active?: boolean;
    is_default?: boolean;
}

export const plansService = {
    async getAll(): Promise<Plan[]> {
        const { data } = await api.get<Plan[]>('/planos');
        return data;
    },

    async getById(id: string): Promise<Plan> {
        const { data } = await api.get<Plan>(`/planos/${id}`);
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

    async delete(id: string): Promise<{ message: string }> {
        const { data } = await api.delete<{ message: string }>(`/planos/${id}`);
        return data;
    },
};
