import axios from 'axios';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Se for erro de login, não redireciona (deixa o componente tratar 'Credenciais Inválidas')
            if (error.config.url?.includes('/login') || error.config.url?.includes('/auth')) {
                return Promise.reject(error);
            }

            // Token expired or invalid
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            // window.location.href = '/login'; // Evitar redirect forçado em SPA se possível, mas mantendo legado
            // Só redireciona se não estivermos já em uma tela de login pública
            if (!window.location.pathname.includes('/shop-login')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);
