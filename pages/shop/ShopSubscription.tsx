
import React, { useEffect, useState } from 'react';
import { CheckCircle, Download, Loader2, AlertCircle, Clock, Calendar } from 'lucide-react';
import { plansService, Plan as ApiPlan } from '../../services/plans.service';
import { storesService } from '../../services/stores.service';
import { differenceInDays, parseISO, format } from 'date-fns';

export const ShopSubscription = () => {
    const [plans, setPlans] = useState<ApiPlan[]>([]);
    const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);
    const [currentPlan, setCurrentPlan] = useState<ApiPlan | null>(null);
    const [storeId, setStoreId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);
    const [planExpiresAt, setPlanExpiresAt] = useState<string | null>(null);
    const [planStartDate, setPlanStartDate] = useState<string | null>(null); // To calculate used days if needed, or just rely on expiresAt

    useEffect(() => {
        const load = async () => {
            try {
                // 1. Carregar Planos
                const plansData = await plansService.getAll();
                setPlans(plansData.filter(p => p.active !== false && !p.is_default).sort((a, b) => (a.price || 0) - (b.price || 0)));

                // 2. Carregar Dados da Loja
                const sessionStr = localStorage.getItem('user_session');
                if (sessionStr) {
                    const session = JSON.parse(sessionStr);
                    let targetStoreId = session.storeId;

                    // Fallback para buscar por ID de lojista se storeId não estiver na sessão
                    if (!targetStoreId && session.id) {
                        try {
                            const myStores = await storesService.getAll({ lojista_id: session.id });
                            if (myStores.length > 0) targetStoreId = myStores[0].id;
                        } catch (e) { console.error("Erro ao buscar lojas do usuario", e); }
                    }

                    if (targetStoreId) {
                        setStoreId(targetStoreId);
                        const store = await storesService.getById(targetStoreId);
                        if (store.plano_id) {
                            setCurrentPlanId(store.plano_id);
                            setPlanExpiresAt(store.plan_expires_at || null);
                            setPlanStartDate(store.created_at); // fallback to created_at if plan_start unknown, but ideally we need when plan started. Using store creation or we assume 'vigencia' implies from 'now' backwards? 
                            // Actually backend only gives expires_at. 
                            // Let's assume (expires_at - vigencia) is start, or just show days remaining.
                            // User asked: "contagem de dias utilizando o plano e de quantos dias o plano é valido (vigencia)"
                            // "Count of days using the plan" -> (Today - Start). 
                            // "How many days plan is valid" -> Total duration (Vigencia).
                            // We might need to approximate Start = Expires - Vigencia.

                            // Tentar achar o plano atual
                            const activeP = plansData.find(p => p.id === store.plano_id);
                            if (activeP) setCurrentPlan(activeP);
                        }
                    }
                }
            } catch (err) {
                console.error("Erro ao carregar assinatura:", err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleChangePlan = async (planId: string) => {
        const sessionStr = localStorage.getItem('user_session');
        const session = sessionStr ? JSON.parse(sessionStr) : null;
        const finalStoreId = storeId || session?.storeId;

        if (!finalStoreId) return alert("Erro: ID da loja não identificado. Faça login novamente.");

        const isRenewal = planId === currentPlanId;
        const confirmMessage = isRenewal
            ? "Deseja renovar o seu plano atual? Isso estenderá a validade."
            : "Deseja realmente alterar seu plano de assinatura?";

        if (!confirm(confirmMessage)) return;

        setUpdating(planId);
        try {
            await storesService.update(storeId, { plano_id: planId });

            // Reload store data to get new expiration
            const updatedStore = await storesService.getById(storeId);
            setPlanExpiresAt(updatedStore.plan_expires_at || null);

            setCurrentPlanId(planId);
            const newPlan = plans.find(p => p.id === planId);
            if (newPlan) setCurrentPlan(newPlan);
            alert("Plano alterado com sucesso!");
        } catch (err) {
            console.error(err);
            alert("Erro ao alterar o plano. Tente novamente.");
        } finally {
            setUpdating(null);
        }
    };

    const getFeatures = (p: ApiPlan) => {
        const feats: string[] = [];
        if (p.limite_profissionais === -1) feats.push("Profissionais Ilimitados");
        else feats.push(`Até ${p.limite_profissionais} Profissionais`);

        if (p.limite_agendamentos === -1) feats.push("Agendamentos Ilimitados");
        else feats.push(`Até ${p.limite_agendamentos} Agendamentos/mês`);

        if (p.permite_pagamentos_online) feats.push("Pagamentos Online");
        if (p.permite_integracao_calendar) feats.push("Google Agenda");

        if (p.features && typeof p.features === 'object') {
            // Tentar pegar features extras se existirem
            if (p.features.displayFeatures && Array.isArray(p.features.displayFeatures)) {
                feats.push(...p.features.displayFeatures);
            } else if (p.features.apiAccess) {
                feats.push("Acesso à API");
            }
        }
        return feats;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] text-white">
                <Loader2 className="animate-spin mr-2" /> Carregando planos...
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500">
            <h1 className="text-4xl font-black text-white">Gerenciar Assinatura</h1>

            {/* Current Plan Section */}
            {currentPlan ? (
                <section className="bg-surface border border-primary/50 rounded-xl p-6 shadow-sm relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-xl font-bold text-primary">Plano Atual: {currentPlan.nome}</h2>
                                <p className="text-text-muted">R$ {currentPlan.price?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês</p>
                            </div>
                            <span className="bg-primary/20 text-primary text-xs font-bold px-3 py-1 rounded-full">ATIVO</span>
                        </div>
                        <p className="text-white mb-2">{currentPlan.description || 'Aproveite todos os benefícios do seu plano.'}</p>

                        {planExpiresAt && (
                            <div className="mt-4 p-4 bg-background/50 rounded-lg border border-border/50">
                                <div className="flex items-center gap-2 mb-2">
                                    <Clock size={16} className="text-secondary" />
                                    <span className="text-sm font-semibold text-white">Vigência do Plano</span>
                                </div>

                                {(() => {
                                    const expires = parseISO(planExpiresAt);
                                    const now = new Date();
                                    const totalDays = currentPlan.vigencia_dias || 30;
                                    const daysRemaining = differenceInDays(expires, now);
                                    const daysUsed = totalDays - daysRemaining;

                                    // Progress bar calculation
                                    const progress = Math.min(100, Math.max(0, (daysUsed / totalDays) * 100));

                                    return (
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs text-text-muted">
                                                <span>{daysUsed} dias utilizados</span>
                                                <span>{daysRemaining} dias restantes</span>
                                            </div>
                                            <div className="h-2 w-full bg-surface rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-1000 ${daysRemaining <= 3 ? 'bg-danger' : 'bg-success'}`}
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                            <div className="text-right text-xs text-text-muted">
                                                Válido até {format(expires, 'dd/MM/yyyy')}
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        )}

                        <div className="text-text-muted text-sm mt-4">
                            <strong className="text-white block mb-2">Seus Benefícios:</strong>
                            <div className="flex flex-wrap gap-x-6 gap-y-2">
                                {getFeatures(currentPlan).map((feat, i) => (
                                    <span key={i} className="flex items-center gap-1"><CheckCircle size={14} className="text-success" /> {feat}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
                </section>
            ) : (
                <section className="bg-surface border border-border rounded-xl p-6">
                    <div className="flex items-center gap-3 text-text-muted">
                        <AlertCircle size={24} />
                        <p>Você ainda não possui um plano ativo ou o plano expirou. Escolha uma opção abaixo.</p>
                    </div>
                </section>
            )}

            {/* Plans List */}
            <section className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-white">Planos Disponíveis</h2>
                    <div className="bg-surface rounded-full p-1 flex text-sm font-medium border border-border">
                        <button className="bg-primary text-white shadow-sm px-4 py-1 rounded-full text-xs sm:text-sm transition-all">Mensal</button>
                        {/* Futuro: Implementar switch anual */}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {plans.map((plan) => {
                        const isCurrent = plan.id === currentPlanId;
                        const features = getFeatures(plan);
                        const daysToExpiration = (isCurrent && planExpiresAt)
                            ? differenceInDays(parseISO(planExpiresAt), new Date())
                            : 999;

                        return (
                            <div
                                key={plan.id}
                                className={`bg-surface rounded-xl p-6 flex flex-col relative transition-all duration-300 ${isCurrent ? 'border-2 border-primary shadow-lg shadow-primary/10 scale-[1.02]' : 'border border-border hover:border-primary/50 hover:shadow-md'}`}
                            >
                                {isCurrent && (
                                    <div className="absolute top-0 right-0 bg-primary text-white text-[10px] uppercase font-bold px-3 py-1 rounded-bl-lg rounded-tr-md">Atual</div>
                                )}

                                <h3 className={`text-lg font-bold ${isCurrent ? 'text-primary' : 'text-white'}`}>{plan.nome}</h3>
                                <p className="text-3xl font-black text-white mt-2 mb-6">
                                    R$ {plan.price?.toLocaleString('pt-BR', { minimumFractionDigits: 0 }) || '0'}
                                    <span className="text-base font-normal text-text-muted">/mês</span>
                                </p>

                                <ul className="space-y-3 text-sm text-text-muted mb-8 flex-1">
                                    {features.map((feat, i) => (
                                        <li key={i} className="flex gap-2 items-start">
                                            <CheckCircle size={18} className="text-success shrink-0 mt-0.5" />
                                            <span className="leading-snug">{feat}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    onClick={() => handleChangePlan(plan.id)}
                                    // Disabled if:
                                    // 1. Current plan AND not default AND > 3 days (Just a label "Plano Atual")
                                    // 2. Default plan (Always disabled label)
                                    // 3. Currently updating this specific plan
                                    disabled={(isCurrent && !plan.is_default && daysToExpiration > 3) || (isCurrent && plan.is_default) || updating === plan.id}
                                    className={`w-full py-3 rounded-lg font-bold text-sm transition-all flex items-center justify-center ${isCurrent
                                        ? plan.is_default
                                            ? 'bg-background text-text-muted cursor-not-allowed opacity-50'
                                            : daysToExpiration <= 3
                                                ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-900/20' // Renewal available
                                                : 'bg-primary text-white cursor-default' // "Plano Atual" label (Blue)
                                        : 'bg-secondary hover:bg-orange-600 text-white shadow-lg shadow-orange-900/10'
                                        }`}
                                >
                                    {updating === plan.id ? <Loader2 className="animate-spin" /> : (
                                        isCurrent
                                            ? (plan.is_default ? 'Plano Atual' : (daysToExpiration <= 3 ? 'Renovar Plano' : 'Plano Atual'))
                                            : 'Escolher Plano'
                                    )}
                                </button>
                            </div>
                        );
                    })}

                    {plans.length === 0 && (
                        <div className="col-span-full text-center py-12 text-text-muted">
                            Nenhum plano disponível no momento.
                        </div>
                    )}
                </div>
            </section>

            {/* Histórico Mockado (Manter visual) */}
            <section className="bg-surface border border-border rounded-xl overflow-hidden opacity-70">
                <div className="p-6 border-b border-border">
                    <h2 className="text-xl font-bold text-white">Histórico de Cobrança (Exemplo)</h2>
                </div>
                <table className="w-full text-left text-sm">
                    <thead className="bg-background border-b border-border text-text-muted">
                        <tr>
                            <th className="px-6 py-3 font-semibold">Data</th>
                            <th className="px-6 py-3 font-semibold">Descrição</th>
                            <th className="px-6 py-3 font-semibold">Valor</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {[
                            { date: 'Assinatura', desc: 'Histórico será exibido aqui', val: '-' },
                        ].map((item, i) => (
                            <tr key={i} className="hover:bg-white/5">
                                <td className="px-6 py-4 text-text-muted">{item.date}</td>
                                <td className="px-6 py-4 text-white">{item.desc}</td>
                                <td className="px-6 py-4 text-text-muted">{item.val}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </div>
    );
};
