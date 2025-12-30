import { api } from './api';

export interface Appointment {
    id: string;
    loja_id: string;
    cliente_nome: string;
    cliente_telefone?: string;
    profissional_id: string;
    servico_id: string;
    data: string;
    hora: string;
    status: 'confirmado' | 'cancelado' | 'pendente';
}

export interface CreateAppointmentDTO {
    loja_id: string;
    cliente_nome: string;
    cliente_telefone?: string;
    profissional_id: string;
    servico_id: string;
    data: string;
    hora: string;
}

export interface AppointmentFilters {
    loja_id?: string;
    profissional_id?: string;
    status?: 'confirmado' | 'cancelado' | 'pendente';
    data?: string;
}

export const appointmentsService = {
    async getAll(filters?: AppointmentFilters): Promise<Appointment[]> {
        const params = new URLSearchParams();
        if (filters) {
            if (filters.loja_id) params.append('loja_id', filters.loja_id);
            if (filters.profissional_id) params.append('profissional_id', filters.profissional_id);
            if (filters.status) params.append('status', filters.status);
            if (filters.data) params.append('data', filters.data);
        }
        const { data } = await api.get<Appointment[]>(`/agendamentos?${params.toString()}`);
        return data;
    },

    async create(appointment: CreateAppointmentDTO): Promise<{ id: string }> {
        const { data } = await api.post<{ id: string }>('/agendamentos', appointment);
        return data;
    },

    async updateStatus(id: string, status: 'confirmado' | 'cancelado' | 'pendente'): Promise<void> {
        await api.patch(`/agendamentos/${id}/status`, { status });
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/agendamentos/${id}`);
    }
};
