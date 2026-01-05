import axios from 'axios';

// Create a configured axios instance
export const api = axios.create({
    baseURL: 'http://localhost:3000', // Adjust if your backend is elsewhere
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add a request interceptor to attach the token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add a response interceptor to handle errors globally
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
