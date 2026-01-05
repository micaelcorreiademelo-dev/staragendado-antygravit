import { api } from './api';
import { storesService } from './stores.service';
import { appointmentsService } from './appointments.service';

export interface DashboardMetrics {
    totalStores: number;
    activeStores: number;
    newStoresThisMonth: number;
    totalRevenue: number;
    totalAppointments: number;
}

export interface ChartDataPoint {
    name: string;
    value: number;
}

export const dashboardService = {
    async getMetrics(range: '7d' | '30d' | 'month'): Promise<DashboardMetrics> {
        try {
            // Fetch real data
            const stores = await storesService.getAll().catch(() => []);
            const appointments = await appointmentsService.getAll().catch(() => []);

            // Calculate metrics (mock logic for now, should be backend)
            // Real implementation would call /dashboard/metrics endpoint
            
            const totalStores = stores.length;
            const activeStores = stores.filter(s => s.status === 'ativa').length;
            const newStoresThisMonth = stores.filter(s => {
                const date = new Date(s.created_at);
                const now = new Date();
                return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
            }).length;

            const totalRevenue = 15000; // Mock revenue since we don't track payments yet
            const totalAppointments = appointments.length;

            return {
                totalStores,
                activeStores,
                newStoresThisMonth,
                totalRevenue,
                totalAppointments
            };
        } catch (error) {
            console.error("Error fetching dashboard metrics", error);
            // Return fallback mock data
            return {
                totalStores: 0,
                activeStores: 0,
                newStoresThisMonth: 0,
                totalRevenue: 0,
                totalAppointments: 0
            };
        }
    },

    async getRevenueChart(range: '7d' | '30d' | 'month'): Promise<ChartDataPoint[]> {
        // Mock chart data
        return [
            { name: 'Seg', value: 4000 },
            { name: 'Ter', value: 3000 },
            { name: 'Qua', value: 2000 },
            { name: 'Qui', value: 2780 },
            { name: 'Sex', value: 1890 },
            { name: 'Sáb', value: 2390 },
            { name: 'Dom', value: 3490 },
        ];
    },

    async getAppointmentsChart(range: '7d' | '30d' | 'month'): Promise<ChartDataPoint[]> {
         // Mock chart data
         return [
            { name: 'Sem 1', value: 120 },
            { name: 'Sem 2', value: 150 },
            { name: 'Sem 3', value: 180 },
            { name: 'Sem 4', value: 210 },
        ];
    }
};
