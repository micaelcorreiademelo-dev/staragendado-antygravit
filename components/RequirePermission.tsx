import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface Props {
    children: React.ReactNode;
    permission?: string;
}

export const RequirePermission: React.FC<Props> = ({ children, permission }) => {
    const { user } = useAuth();

    if (!user) return <Navigate to="/login" replace />;

    // Se permission for fornecida, verificar
    if (permission) {
        // Se user for superadmin (sem permissions definidas ou vazias), permite tudo
        const isSuperAdmin = !user.permissions || Object.keys(user.permissions).length === 0;

        if (!isSuperAdmin && !user.permissions[permission]) {
            // Se não tiver permissão, exibe mensagem ou redireciona
            // Vamos exibir uma UI de "Acesso Negado" simples
            return (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-in fade-in duration-300">
                    <div className="bg-red-500/10 p-4 rounded-full mb-4">
                        <svg className="w-12 h-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Acesso Negado</h2>
                    <p className="text-text-muted max-w-md">
                        Você não tem permissão para acessar esta funcionalidade ({permission}).
                        Entre em contato com o administrador do sistema.
                    </p>
                </div>
            );
        }
    }

    return <>{children}</>;
};
