import { api } from './api';
import { Professional, Permissions, Unavailability, WeekSchedule } from '../types';

export interface CreateProfessionalDTO {
    nome: string;
    email: string;
    phone: string;
    avatar?: string;
    loja_id: string;
    status: 'Active' | 'Inactive';
    disponibilidade: WeekSchedule;
    indisponibilidade: Unavailability[];
    permissoes: Permissions;
    password?: string;
}

export interface UpdateProfessionalDTO {
    nome?: string;
    email?: string;
    phone?: string;
    avatar?: string;
    status?: 'Active' | 'Inactive';
    disponibilidade?: WeekSchedule;
    indisponibilidade?: Unavailability[];
    permissoes?: Permissions;
    password?: string;
}

export const professionalsService = {
    getAll: async (lojaId: string): Promise<Professional[]> => {
        const response = await api.get(`/profissionais?loja_id=${lojaId}`);
        // Map backend response to frontend type if necessary
        return response.data.map((p: any) => ({
            id: p.id,
            name: p.nome,
            email: p.email,
            phone: p.phone,
            avatar: p.avatar,
            status: p.status || 'Active',
            workSchedule: p.disponibilidade,
            permissions: p.permissoes,
            unavailability: p.indisponibilidade || [],
            loja_id: p.loja_id
        }));
    },

    create: async (data: CreateProfessionalDTO) => {
        const response = await api.post('/profissionais', data);
        return response.data;
    },

    update: async (id: string, data: UpdateProfessionalDTO) => {
        const response = await api.put(`/profissionais/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await api.delete(`/profissionais/${id}`);
        return response.data;
    },

    updatePermissions: async (id: string, permissions: Permissions) => {
        const response = await api.patch(`/profissionais/${id}/permissoes`, { permissoes: permissions });
        return response.data;
    },

    updateUnavailability: async (id: string, unavailability: Unavailability[]) => {
        const response = await api.patch(`/profissionais/${id}/indisponibilidade`, { indisponibilidade: unavailability });
        return response.data;
    }
};
