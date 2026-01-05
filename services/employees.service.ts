import { api } from './api';

export interface Employee {
    id: string;
    full_name: string;
    email: string;
    role: 'admin' | 'support' | 'sales';
    status: 'active' | 'inactive';
    last_access?: string;
    created_at: string;
    permissions?: any;
    password?: string; // Optional for creation
}

export interface CreateEmployeeDTO {
    full_name: string;
    email: string;
    password?: string;
    role: 'admin' | 'support' | 'sales';
    permissions: any;
}

export const employeesService = {
    async getAll(): Promise<Employee[]> {
        const { data } = await api.get<Employee[]>('/employees');
        return data;
    },

    async create(employee: CreateEmployeeDTO): Promise<{ id: string }> {
        const { data } = await api.post<{ id: string }>('/employees', employee);
        return data;
    },

    async update(id: string, employee: Partial<Employee>): Promise<void> {
        await api.put(`/employees/${id}`, employee);
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/employees/${id}`);
    }
};
