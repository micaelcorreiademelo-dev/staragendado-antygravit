import { api } from './api';

export interface Employee {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
    role: 'admin'; // Apenas admin é válido no enum user_role
    permissions: Record<string, boolean>;
    created_at: string;
}

export interface CreateEmployeeData {
    full_name: string;
    email: string;
    password?: string; // Opcional na edição
    permissions: Record<string, boolean>;
    role?: 'admin';
}

export const employeesService = {
    async getAll(): Promise<Employee[]> {
        const { data } = await api.get<Employee[]>('/employees');
        return data;
    },

    async create(data: CreateEmployeeData): Promise<{ id: string }> {
        const response = await api.post<{ id: string }>('/employees', data);
        return response.data;
    },

    async update(id: string, data: Partial<CreateEmployeeData>): Promise<{ message: string }> {
        const response = await api.put<{ message: string }>(`/employees/${id}`, data);
        return response.data;
    },

    async delete(id: string): Promise<{ message: string }> {
        const response = await api.delete<{ message: string }>(`/employees/${id}`);
        return response.data;
    }
};
