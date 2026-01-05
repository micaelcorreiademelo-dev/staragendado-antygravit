import React, { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, Plus, Clock, User, Scissors, CheckCircle, Calendar, AlertCircle } from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  add,
  sub,
  isSameDay,
  isSameMonth,
  getDay,
  isBefore,
  setHours
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { api } from '../../services/api';
import { professionalsService } from '../../services/professionalsService';

// --- TYPES ---
interface Service {
  id: string;
  nome: string;
  preco: number;
  duracao_minutos: number;
}

interface Professional {
  id: string;
  name: string; // Mapped from nome
}

interface Appointment {
  id: string;
  clientName: string;
  serviceName: string;
  professionalName: string;
  date: Date;
  duration: number;
  status: 'Confirmed' | 'Pending' | 'Cancelled';
  price?: number;
}

const defaultAppointmentForm = {
  clientName: '',
  serviceId: '',
  professionalId: '',
  date: format(new Date(), 'yyyy-MM-dd'),
  time: '09:00',
  notes: ''
}

export const ShopCalendar = () => {
  // Data States
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [lojaId, setLojaId] = useState<string | null>(null);

  // Filter States
  const [professionalFilter, setProfessionalFilter] = useState('Todos');
  const [serviceFilter, setServiceFilter] = useState('Todos');

  // UI States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [formData, setFormData] = useState(defaultAppointmentForm);
  const [isLoading, setIsLoading] = useState(true);

  // Feedback States
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  // --- INITIALIZATION ---
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
        // 1. Get Loja ID
        let userLojaId = null;
        const sessionStr = localStorage.getItem('user_session');
        if (sessionStr) {
          const session = JSON.parse(sessionStr);
          userLojaId = session.loja_id;
        }

        if (!userLojaId) {
          // Fallback using API
          try {
            const storesRes = await api.get('/lojas');
            if (storesRes.data?.[0]?.id) userLojaId = storesRes.data[0].id;
          } catch (e) {
            console.warn("Failed to fetch stores fallback");
          }
        }

        if (!userLojaId) {
          showFeedback('Erro: Loja não identificada. Faça login novamente.', 'error');
          return;
        }

        setLojaId(userLojaId);

        // 2. Fetch Metadata (Pros & Services)
        const [prosRes, servicesRes] = await Promise.all([
          professionalsService.getAll(userLojaId),
          api.get(`/servicos?loja_id=${userLojaId}`)
        ]);

        // Map professionals correctly
        setProfessionals(prosRes); // Service already maps backend 'nome' to 'name'
        setServices(servicesRes.data);

        // 3. Fetch Appointments
        await fetchAppointments(userLojaId, prosRes, servicesRes.data);

      } catch (error) {
        console.error('Init Error:', error);
        showFeedback('Erro ao carregar dados da agenda.', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const fetchAppointments = async (lojaId: string, prosList: Professional[], servicesList: Service[]) => {
    try {
      // Fetch all appointments for the store
      const { data } = await api.get(`/agendamentos?loja_id=${lojaId}`);

      // Map backend data to frontend Appointment model
      const mappedAppointments: Appointment[] = data.map((appt: any) => {
        const service = servicesList.find(s => s.id === appt.servico_id);
        const prof = prosList.find(p => p.id === appt.profissional_id);

        return {
          id: appt.id,
          clientName: appt.cliente_nome,
          serviceName: service?.nome || 'Serviço Desconhecido',
          professionalName: prof?.name || 'Profissional Desconhecido',
          date: new Date(`${appt.data}T${appt.hora}`),
          duration: service?.duracao_minutos || 60,
          status: appt.status.charAt(0).toUpperCase() + appt.status.slice(1), // capitalize
          price: service?.preco
        };
      });

      setAppointments(mappedAppointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  const showFeedback = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // --- HANDLERS ---
  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    setCurrentDate(day);
    setViewMode('day');
  };

  const handleOpenModal = (day?: Date) => {
    const targetDate = day || new Date();
    setSelectedDate(targetDate);
    setFormData({
      ...defaultAppointmentForm,
      date: format(targetDate, 'yyyy-MM-dd'),
      professionalId: professionals.length > 0 ? professionals[0].id : '',
      serviceId: services.length > 0 ? services[0].id : ''
    });
    setIsModalOpen(true);
  };

  const handleSaveAppointment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!lojaId) return showFeedback('Erro de sistema: Loja ID ausente', 'error');
    if (!formData.clientName) return showFeedback("Preencha o nome do cliente.", 'error');
    if (!formData.professionalId) return showFeedback("Selecione um profissional.", 'error');
    if (!formData.serviceId) return showFeedback("Selecione um serviço.", 'error');

    try {
      const payload = {
        loja_id: lojaId,
        cliente_nome: formData.clientName,
        profissional_id: formData.professionalId,
        servico_id: formData.serviceId,
        data: formData.date,
        hora: formData.time + ':00' // Ensure HH:MM:SS format
      };

      await api.post('/agendamentos', payload);

      showFeedback('Agendamento criado com sucesso!');
      setIsModalOpen(false);

      // Refresh list
      await fetchAppointments(lojaId, professionals, services);
    } catch (error: any) {
      console.error('Save Error:', error);
      const msg = error.response?.data?.error || 'Erro ao criar agendamento.';
      showFeedback(msg, 'error');
    }
  };

  // --- NAVIGATION ---
  const handlePrev = () => {
    if (viewMode === 'month') setCurrentDate(sub(currentDate, { months: 1 }));
    if (viewMode === 'week') setCurrentDate(sub(currentDate, { weeks: 1 }));
    if (viewMode === 'day') {
      const newDate = sub(selectedDate, { days: 1 });
      setSelectedDate(newDate); setCurrentDate(newDate);
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') setCurrentDate(add(currentDate, { months: 1 }));
    if (viewMode === 'week') setCurrentDate(add(currentDate, { weeks: 1 }));
    if (viewMode === 'day') {
      const newDate = add(selectedDate, { days: 1 });
      setSelectedDate(newDate); setCurrentDate(newDate);
    }
  };

  // --- HELPERS ---
  const getAppointmentsForDay = (day: Date) => {
    return filteredAppointments
      .filter(app => isSameDay(app.date, day))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  const filteredAppointments = useMemo(() => {
    return appointments.filter(app => {
      const professionalMatch = professionalFilter === 'Todos' || app.professionalName === professionalFilter;
      const serviceMatch = serviceFilter === 'Todos' || app.serviceName === serviceFilter;
      return professionalMatch && serviceMatch;
    });
  }, [professionalFilter, serviceFilter, appointments]);

  const getStatusClasses = (status: string) => {
    const lower = status.toLowerCase();
    if (lower === 'confirmed' || lower === 'confirmado') return 'bg-success/20 border-l-4 border-success text-success';
    if (lower === 'pending' || lower === 'pendente') return 'bg-yellow-500/20 border-l-4 border-yellow-500 text-yellow-500';
    if (lower === 'cancelled' || lower === 'cancelado') return 'bg-danger/20 border-l-4 border-danger text-danger';
    return 'bg-primary/20 text-white';
  }

  // --- RENDERS (Simplified from original) ---
  // (Keeping renderMonthView, renderDayView, renderWeekView structure mostly same but using new data)

  // Logic for Month Grid
  const firstDayOfMonth = startOfMonth(currentDate);
  const lastDayOfMonth = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: firstDayOfMonth, end: lastDayOfMonth });
  const startingDayIndex = getDay(firstDayOfMonth);
  const totalMonthCells = startingDayIndex + daysInMonth.length;
  const weeksInMonth = Math.ceil(totalMonthCells / 7);

  const renderMonthView = () => (
    <div className="flex-1 grid grid-cols-7" style={{ gridTemplateRows: `auto repeat(${weeksInMonth}, minmax(120px, 1fr))` }}>
      {['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'].map(d => (
        <div key={d} className="p-3 text-center border-b border-r border-border text-sm font-medium text-text-muted bg-surface/50">{d}</div>
      ))}
      {Array.from({ length: startingDayIndex }).map((_, i) => (
        <div key={`empty-${i}`} className="border-b border-r border-border bg-surface/20" />
      ))}
      {daysInMonth.map(day => {
        const appointmentsToday = getAppointmentsForDay(day);
        return (
          <div
            key={day.toString()}
            onClick={() => handleDayClick(day)}
            className={`border-b border-r border-border p-2 group cursor-pointer transition-colors hover:bg-white/5 ${isSameDay(day, selectedDate) ? 'bg-primary/10' : ''} ${!isSameMonth(day, currentDate) ? 'bg-background/50' : ''}`}
          >
            <span className={`text-sm font-medium inline-block w-7 h-7 text-center leading-7 rounded-full ${isSameDay(day, new Date()) ? 'bg-primary text-white' : isSameDay(day, selectedDate) ? 'bg-primary text-white' : 'text-text-muted group-hover:text-white'}`}>
              {format(day, 'd')}
            </span>
            <div className="mt-1 space-y-1 overflow-hidden">
              {appointmentsToday.slice(0, 2).map(app => (
                <div key={app.id} className={`p-1.5 rounded text-xs truncate ${getStatusClasses(app.status)}`}>
                  <span className="font-bold mr-1">{format(app.date, 'HH:mm')}</span>
                  <span className="text-white">{app.clientName}</span>
                </div>
              ))}
              {appointmentsToday.length > 2 && (
                <div className="text-xs text-text-muted mt-1">+ {appointmentsToday.length - 2} mais</div>
              )}
            </div>
          </div>
        );
      })}
      {Array.from({ length: (7 * (weeksInMonth)) - (daysInMonth.length + startingDayIndex) }).map((_, i) => (
        <div key={`empty-end-${i}`} className="border-b border-r border-border bg-surface/20 min-h-[120px]" />
      ))}
    </div>
  );

  const renderDayView = () => {
    const appointmentsToday = getAppointmentsForDay(selectedDate);
    return (
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {appointmentsToday.length > 0 ? (
          appointmentsToday.map(app => (
            <div key={app.id} className={`p-4 rounded-xl ${getStatusClasses(app.status)} bg-surface border border-border flex items-center justify-between`}>
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center justify-center w-16 text-center">
                  <span className="font-bold text-lg text-white">{format(app.date, 'HH:mm')}</span>
                  <span className="text-xs text-text-muted">{app.duration} min</span>
                </div>
                <div className="border-l border-border h-12" />
                <div>
                  <h4 className="font-bold text-white">{app.clientName}</h4>
                  <p className="text-sm text-text-muted flex items-center gap-1"><Scissors size={14} /> {app.serviceName}</p>
                  <p className="text-sm text-text-muted flex items-center gap-1"><User size={14} /> {app.professionalName}</p>
                </div>
              </div>
              <div className="text-right">
                {app.price && <p className="text-sm font-bold text-white">R$ {app.price.toFixed(2)}</p>}
                <p className={`text-xs font-medium ${app.status === 'Confirmed' ? 'text-success' : 'text-text-muted'}`}>{app.status}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-text-muted h-full flex flex-col justify-center items-center">
            <Calendar size={48} className="opacity-30 mb-4" />
            <p>Nenhum agendamento para este dia.</p>
          </div>
        )}
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate, { locale: ptBR });
    const weekEnd = endOfWeek(currentDate, { locale: ptBR });
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
    const hours = Array.from({ length: 13 }, (_, i) => i + 8); // 8 AM to 8 PM
    const timeSlotHeight = 80;

    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="grid flex-shrink-0" style={{ gridTemplateColumns: '60px repeat(7, 1fr)' }}>
          <div className="h-24 bg-surface border-b border-r border-border"></div>
          {days.map(day => (
            <div key={`header-${day.toString()}`} className="text-center py-3 border-b border-r border-border bg-surface">
              <p className="text-text-muted text-sm uppercase">{format(day, 'EEE', { locale: ptBR })}</p>
              <p className={`font-bold text-2xl mt-1 ${isSameDay(day, new Date()) ? 'text-primary' : 'text-white'}`}>{format(day, 'd')}</p>
            </div>
          ))}
        </div>
        <div className="flex-1 overflow-auto">
          <div className="grid relative" style={{ gridTemplateColumns: '60px repeat(7, 1fr)' }}>
            <div className="col-start-1 col-end-9 row-start-1 grid" style={{ gridTemplateRows: `repeat(${hours.length}, ${timeSlotHeight}px)` }}>
              {hours.map(hour => (
                <div key={`time-line-${hour}`} className="relative border-t border-border">
                  <span className="absolute -top-2.5 left-2 text-xs text-text-muted bg-background px-1">{format(setHours(new Date(), hour), 'HH:mm')}</span>
                </div>
              ))}
            </div>
            <div className="col-start-2 col-end-9 row-start-1 grid grid-cols-7">
              {Array.from({ length: 7 }).map((_, i) => <div key={`vline-${i}`} className="border-r border-border"></div>)}
            </div>
            {days.map((day, dayIndex) => (
              <div key={`day-col-${day.toString()}`} className="relative" style={{ gridColumn: dayIndex + 2, gridRow: `1 / span ${hours.length}` }}>
                {getAppointmentsForDay(day).map(app => {
                  const startHour = app.date.getHours();
                  const startMinute = app.date.getMinutes();
                  const top = ((startHour - 8) * timeSlotHeight) + ((startMinute / 60) * timeSlotHeight);
                  const height = (app.duration / 60) * timeSlotHeight - 2;
                  return (
                    <div key={app.id} className={`absolute w-[calc(100%-8px)] left-[4px] p-2 rounded-lg text-white text-xs overflow-hidden flex flex-col ${getStatusClasses(app.status)}`} style={{ top: `${top}px`, height: `${height}px` }}>
                      <p className="font-bold text-white text-[11px] truncate">{app.clientName}</p>
                      <p className="opacity-80 text-[10px] truncate">{app.serviceName}</p>
                      <p className="opacity-60 text-[10px] mt-auto">{format(app.date, 'HH:mm')}</p>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

  return (
    <div className="flex h-full bg-background text-white">
      <aside className="w-72 bg-surface border-r border-border p-6 flex-col gap-6 hidden lg:flex">
        <button
          onClick={() => handleOpenModal(new Date())}
          className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-900/20 transition-all whitespace-nowrap"
        >
          <Plus size={20} /> Novo Agendamento
        </button>
        <div className="space-y-4">
          <h3 className="font-medium text-white">Filtros</h3>
          <div className="space-y-2">
            <label className="text-xs text-text-muted block">Filtrar por funcionário</label>
            <select onChange={(e) => setProfessionalFilter(e.target.value)} value={professionalFilter} className="w-full bg-background border border-border rounded-lg p-2 text-sm text-white outline-none focus:ring-1 focus:ring-primary">
              <option>Todos</option>
              {professionals.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs text-text-muted block">Filtrar por serviço</label>
            <select onChange={(e) => setServiceFilter(e.target.value)} value={serviceFilter} className="w-full bg-background border border-border rounded-lg p-2 text-sm text-white outline-none focus:ring-1 focus:ring-primary">
              <option>Todos</option>
              {services.map(s => <option key={s.id} value={s.nome}>{s.nome}</option>)}
            </select>
          </div>
        </div>

        <div className="bg-background rounded-xl p-4 border border-border">
          <div className="flex items-center justify-between mb-4 text-white">
            <button onClick={() => setCurrentDate(sub(currentDate, { months: 1 }))} className="hover:bg-white/10 p-1 rounded"><ChevronLeft size={16} /></button>
            <span className="font-bold text-sm">{format(currentDate, 'MMMM yyyy', { locale: ptBR })}</span>
            <button onClick={() => setCurrentDate(add(currentDate, { months: 1 }))} className="hover:bg-white/10 p-1 rounded"><ChevronRight size={16} /></button>
          </div>
          <div className="grid grid-cols-7 gap-y-2 text-center text-xs text-text-muted mb-2">
            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => <div key={i} className="h-8 flex items-center justify-center">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-y-1 text-center text-sm text-white">
            {Array.from({ length: startingDayIndex }).map((_, i) => <span key={`pad-start-${i}`} />)}
            {daysInMonth.map(d => (
              <button
                key={d.toString()}
                onClick={() => handleDayClick(d)}
                className={`w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors mx-auto ${isSameDay(d, selectedDate) ? 'bg-primary text-white font-bold' : ''}`}
              >
                {format(d, 'd')}
              </button>
            ))}
          </div>
        </div>

      </aside>

      <main className="flex-1 flex flex-col">
        <header className="h-20 border-b border-border flex items-center justify-between px-6 bg-surface">
          <div className="flex items-center gap-4 text-white">
            <button onClick={handlePrev} className="p-2 hover:bg-white/10 rounded-full"><ChevronLeft size={20} /></button>
            <h2 className="text-xl font-bold text-center w-52 capitalize">
              {viewMode === 'month' && format(currentDate, 'MMMM yyyy', { locale: ptBR })}
              {viewMode === 'week' && `Semana de ${format(startOfWeek(currentDate, { locale: ptBR }), 'dd/MM')}`}
              {viewMode === 'day' && format(selectedDate, 'PPP', { locale: ptBR })}
            </h2>
            <button onClick={handleNext} className="p-2 hover:bg-white/10 rounded-full"><ChevronRight size={20} /></button>
          </div>
          <div className="flex bg-background rounded-lg p-1 border border-border">
            <button onClick={() => setViewMode('month')} className={`px-3 py-1 text-sm font-medium ${viewMode === 'month' ? 'bg-primary text-white rounded shadow-sm' : 'text-text-muted hover:text-white'}`}>Mês</button>
            <button onClick={() => setViewMode('week')} className={`px-3 py-1 text-sm font-medium ${viewMode === 'week' ? 'bg-primary text-white rounded shadow-sm' : 'text-text-muted hover:text-white'}`}>Semana</button>
            <button onClick={() => setViewMode('day')} className={`px-3 py-1 text-sm font-medium ${viewMode === 'day' ? 'bg-primary text-white rounded shadow-sm' : 'text-text-muted hover:text-white'}`}>Dia</button>
          </div>
        </header>

        {viewMode === 'month' && renderMonthView()}
        {viewMode === 'day' && renderDayView()}
        {viewMode === 'week' && renderWeekView()}
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-surface border border-border w-full max-w-lg rounded-xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95">
            <div className="flex items-center justify-between p-6 border-b border-border shrink-0">
              <h3 className="text-xl font-bold text-white">Novo Agendamento</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-text-muted hover:text-white"><X size={24} /></button>
            </div>

            <form onSubmit={handleSaveAppointment} className="p-6 space-y-4 overflow-y-auto">
              <div className="space-y-1">
                <label className="text-sm font-medium text-text-muted">Cliente</label>
                <input required value={formData.clientName} onChange={e => setFormData({ ...formData, clientName: e.target.value })} type="text" placeholder="Nome do Cliente" className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-white outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-text-muted">Serviço</label>
                <select value={formData.serviceId} onChange={e => setFormData({ ...formData, serviceId: e.target.value })} className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-white outline-none focus:ring-1 focus:ring-primary">
                  <option value="">Selecione...</option>
                  {services.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-text-muted">Data</label>
                  <input value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} type="date" className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-white outline-none focus:ring-1 focus:ring-primary" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-text-muted">Hora</label>
                  <input value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} type="time" className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-white outline-none focus:ring-1 focus:ring-primary" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-text-muted">Profissional</label>
                <select value={formData.professionalId} onChange={e => setFormData({ ...formData, professionalId: e.target.value })} className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-white outline-none focus:ring-1 focus:ring-primary">
                  <option value="">Selecione...</option>
                  {professionals.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-text-muted">Notas (opcional)</label>
                <textarea value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} rows={3} className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-white outline-none focus:ring-1 focus:ring-primary resize-none" />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg border border-border text-white hover:bg-white/5 transition-colors font-medium">Cancelar</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-secondary hover:bg-orange-600 text-white font-bold transition-colors shadow-lg shadow-orange-900/20">Confirmar Agendamento</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div className={`fixed bottom-6 right-6 z-[150] bg-surface border p-4 rounded-lg shadow-xl flex items-center gap-3 animate-in slide-in-from-bottom-5 ${toast.type === 'success' ? 'border-success/30' : 'border-danger/30'}`}>
          {toast.type === 'success' ? <CheckCircle size={20} className="text-success" /> : <AlertCircle size={20} className="text-danger" />}
          <p className="text-white font-medium">{toast.message}</p>
        </div>
      )}
    </div>
  );
};
