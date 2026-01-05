
import React, { useState, useEffect } from 'react';
import { Layers, Plus, Search, Edit, Trash2, X, Check } from 'lucide-react';
import { segmentsService, Segment } from '../services/segments.service';

export const Segments = () => {
    const [segments, setSegments] = useState<Segment[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSegment, setEditingSegment] = useState<Segment | null>(null);
    const [formData, setFormData] = useState({ nome: '', active: true });

    const loadSegments = async () => {
        try {
            const data = await segmentsService.getAll();
            setSegments(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSegments();
    }, []);

    const handleOpenModal = (segment?: Segment) => {
        if (segment) {
            setEditingSegment(segment);
            setFormData({ nome: segment.nome, active: segment.active });
        } else {
            setEditingSegment(null);
            setFormData({ nome: '', active: true });
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        try {
            if (editingSegment) {
                await segmentsService.update(editingSegment.id, formData);
            } else {
                await segmentsService.create(formData);
            }
            await loadSegments();
            setIsModalOpen(false);
        } catch (error) {
            alert('Erro ao salvar segmento');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza? Isso pode afetar lojas vinculadas.')) return;
        try {
            await segmentsService.delete(id);
            await loadSegments();
        } catch (error) {
            alert('Erro ao deletar (verifique se há lojas usando este segmento)');
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-start">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold text-white">Segmentos</h1>
                    <p className="text-text-muted">Gerencie as áreas de atuação das lojas da plataforma.</p>
                </div>
                <button onClick={() => handleOpenModal()} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-600 transition-colors shadow-lg shadow-blue-900/20">
                    <Plus size={20} /> Novo Segmento
                </button>
            </div>

            <div className="bg-surface border border-border rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-background text-text-muted border-b border-border">
                        <tr>
                            <th className="px-6 py-3 font-semibold">Nome do Segmento</th>
                            <th className="px-6 py-3 font-semibold text-center">Status</th>
                            <th className="px-6 py-3 font-semibold text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {segments.map(segment => (
                            <tr key={segment.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 text-white font-medium">{segment.nome}</td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${segment.active ? 'bg-success/10 text-success border border-success/20' : 'bg-border text-text-muted border border-border'}`}>
                                        {segment.active ? 'Ativo' : 'Inativo'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => handleOpenModal(segment)} className="p-2 hover:bg-white/10 rounded-lg text-text-muted hover:text-white transition-colors" title="Editar"><Edit size={16} /></button>
                                        <button onClick={() => handleDelete(segment.id)} className="p-2 hover:bg-red-500/10 rounded-lg text-red-500 hover:text-red-400 transition-colors" title="Excluir"><Trash2 size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {segments.length === 0 && !loading && (
                            <tr><td colSpan={3} className="px-6 py-12 text-center text-text-muted">Nenhum segmento encontrado. Adicione um novo para começar.</td></tr>
                        )}
                        {loading && (
                            <tr><td colSpan={3} className="px-6 py-12 text-center text-text-muted">Carregando...</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-surface border border-border rounded-xl w-full max-w-md p-6 space-y-6 shadow-2xl">
                        <div className="flex justify-between items-center border-b border-border pb-4">
                            <h2 className="text-xl font-bold text-white">{editingSegment ? 'Editar Segmento' : 'Novo Segmento'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-text-muted hover:text-white transition-colors"><X size={20} /></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-text-muted block mb-1">Nome do Segmento</label>
                                <input
                                    value={formData.nome}
                                    onChange={e => setFormData({ ...formData, nome: e.target.value })}
                                    className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-primary outline-none transition-all"
                                    placeholder="Ex: Beleza e Estética"
                                    autoFocus
                                />
                            </div>

                            <div className="flex items-center gap-3 pt-2">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.active}
                                        onChange={e => setFormData({ ...formData, active: e.target.checked })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-background border border-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-text-muted after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success peer-checked:after:bg-white peer-checked:border-success"></div>
                                    <span className="ms-3 text-sm font-medium text-white">Segmento Ativo</span>
                                </label>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t border-border">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg border border-border text-white hover:bg-white/5 font-medium transition-colors">Cancelar</button>
                            <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-blue-600 font-bold transition-colors shadow-lg shadow-blue-900/20">
                                {editingSegment ? 'Salvar Alterações' : 'Criar Segmento'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
