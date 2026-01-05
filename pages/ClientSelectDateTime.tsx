import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '13:00', '14:00', '14:30', '15:00', '16:30', '17:00', '18:00'
];

export const ClientSelectDateTime = () => {
  const navigate = useNavigate();
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
          <ArrowLeft size={24} className="text-white" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-white">Data e Horário</h1>
          <p className="text-text-muted text-sm">Escolha o melhor momento para você</p>
        </div>
      </div>

      {/* Calendar Mock */}
      <div className="bg-surface border border-border rounded-xl p-4">
        <div className="flex justify-between items-center mb-4">
          <button className="p-1 hover:bg-white/10 rounded"><ChevronLeft size={20} className="text-white" /></button>
          <span className="font-bold text-white">Outubro 2024</span>
          <button className="p-1 hover:bg-white/10 rounded"><ChevronRight size={20} className="text-white" /></button>
        </div>
        <div className="grid grid-cols-7 text-center text-sm gap-y-2">
          {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(d => <div key={d} className="text-text-muted text-xs">{d}</div>)}
          {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
            <button
              key={d}
              className={`h-9 w-9 rounded-full flex items-center justify-center text-sm transition-colors
                        ${d === 24 ? 'bg-primary text-white font-bold shadow-lg shadow-primary/30' : 'text-white hover:bg-white/10'}
                        ${d < 24 ? 'opacity-30 cursor-not-allowed' : ''}
                    `}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Time Slots */}
      <div>
        <h3 className="font-bold text-white mb-3">Horários disponíveis para 24/10</h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {timeSlots.map(time => (
            <button
              key={time}
              onClick={() => setSelectedTime(time)}
              className={`py-2.5 rounded-lg border text-sm font-medium transition-all
                        ${selectedTime === time
                  ? 'bg-primary border-primary text-white shadow-md'
                  : 'bg-surface border-border text-white hover:border-primary/50'}
                    `}
            >
              {time}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => {
          const draft = JSON.parse(localStorage.getItem('client_booking_draft') || '{}');
          // Mocking date as today + selected time for simplicity, ideally would use selected calendar date
          const today = new Date().toISOString().split('T')[0];
          localStorage.setItem('client_booking_draft', JSON.stringify({ ...draft, date: today, time: selectedTime }));
          navigate('/client/book/data');
        }}
        disabled={!selectedTime}
        className="w-full py-3.5 rounded-xl bg-primary text-white font-bold text-lg shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:bg-blue-600"
      >
        Continuar
      </button>
    </div>
  );
};
