import { api } from './api';
import { Appointment } from '../types';

export interface CreateAppointmentDTO {
    date: string; // ISO string or YYYY-MM-DD HH:mm
    clientId?: string; // If registered client
    clientName: string;
    clientPhone?: string;
    serviceId: string;
    professionalId: string;
    notes?: string;
    status: 'agendado' | 'concluido' | 'cancelado' | 'pendente';
}

export const appointmentsService = {
    async getAll(filters?: { start?: string; end?: string; professionalId?: string }): Promise<Appointment[]> {
        const { data } = await api.get<Appointment[]>('/agendamentos', { params: filters });
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
