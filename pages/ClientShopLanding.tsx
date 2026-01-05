import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Phone, Clock, Star, ChevronRight } from 'lucide-react';

import { Service } from '../../types';

// Fallback data
const defaultServices = [
    { id: '1', name: 'Corte Masculino', duration: 45, price: 50, image: 'https://images.unsplash.com/photo-1599351431202-6e0c06e72ed3?auto=format&fit=crop&q=80&w=300&h=200' },
    { id: '2', name: 'Barba Tradicional', duration: 30, price: 40, image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=300&h=200' },
];

export const ClientShopLanding = () => {
    const navigate = useNavigate();
    const [services, setServices] = React.useState<Service[]>([]);

    React.useEffect(() => {
        const saved = localStorage.getItem('shop_services');
        if (saved) {
            setServices(JSON.parse(saved));
        } else {
            // @ts-ignore - mapping fallback to Service type roughly
            setServices(defaultServices.map(s => ({ ...s, category: 'Geral', description: '', professionalIds: [] })));
        }
    }, []);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Shop Header Info */}
            <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-sm">
                <div className="h-32 bg-gradient-to-r from-primary to-blue-600 relative">
                    <div className="absolute -bottom-12 left-6 border-4 border-surface rounded-2xl overflow-hidden shadow-lg">
                        <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCsEZfd9MFsWIr0XheUgRoxqrlz4_GNIH3EUztIzp3ZQF35LLAr7vSXXYMe3MgIJoQJLjskxk_xvV5rD9RKtXGGjVpx19341D_i8PgaqLd_1KwSkyqUMbjUhXUOTukuoyInbHvD-771gBUl0xNw6zqiFS1ISHhBPXtJDSKmsopoBkPJlcJwbGt5jpzgou799wo7HNEewdUWFStnebEO7YP6_tfK7f_IXKVbRhSvRCWT7OdfL0Dn--SLR2KymxKx-EdlVBsWgQNA9NBE" alt="Logo" className="w-24 h-24 object-cover bg-white" />
                    </div>
                </div>
                <div className="pt-14 pb-6 px-6">
                    <h1 className="text-2xl font-black text-white">BarberFlow</h1>
                    <div className="flex flex-wrap gap-4 mt-3 text-sm text-text-muted">
                        <span className="flex items-center gap-1"><MapPin size={16} /> Rua das Flores, 123 - Centro</span>
                        <span className="flex items-center gap-1"><Phone size={16} /> (11) 99999-9999</span>
                        <span className="flex items-center gap-1 text-secondary"><Star size={16} fill="currentColor" /> 4.8 (120 avaliações)</span>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-xs font-medium text-success bg-success/10 w-fit px-3 py-1 rounded-full">
                        <Clock size={14} /> Aberto agora até as 19:00
                    </div>
                </div>
            </div>

            {/* Services List */}
            <div>
                <h2 className="text-xl font-bold text-white mb-4">Nossos Serviços</h2>
                <div className="grid gap-4">
                    {services.map((service) => (
                        <div
                            key={service.id}
                            className="group bg-surface border border-border rounded-xl p-4 flex gap-4 hover:border-primary/50 transition-all cursor-pointer shadow-sm hover:shadow-md"
                            onClick={() => {
                                localStorage.setItem('client_booking_draft', JSON.stringify({ service: service }));
                                navigate(`/client/book/professional`);
                            }}
                        >
                            <div className="w-24 h-24 rounded-lg bg-background overflow-hidden shrink-0">
                                <img src="https://images.unsplash.com/photo-1599351431202-6e0c06e72ed3?auto=format&fit=crop&q=80&w=300&h=200" alt={service.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            </div>
                            <div className="flex-1 flex flex-col justify-between py-1">
                                <div>
                                    <h3 className="font-bold text-white text-lg">{service.name}</h3>
                                    <p className="text-text-muted text-sm">{service.duration} min</p>
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                    <span className="font-bold text-primary">R$ {service.price.toFixed(2).replace('.', ',')}</span>
                                    <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-600 transition-colors flex items-center gap-1">
                                        Agendar <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
