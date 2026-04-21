"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams } from 'next/navigation'
import { ToastContainer, useToast } from "@/components/toast";
import ConfirmacaoModal from "@/components/session/ConfirmModal";

import * as React from "react";

import { SessionSlot } from "@/app/types/appointment";
import { SessionCard } from "@/components/session/SessionCard";

// ─── Data ─────────────────────────────────────────────────────────────────────

const SERVICES_MAP: Record<string, { label: string; tag: string; duration: number; color: string }> = {
    "analise-perfil": { label: "Análise de Perfil", tag: "Autoconhecimento", duration: 60, color: "#0ea5e9" },
    "reuniao-cliente": { label: "Reunião de Cliente", tag: "Negócios", duration: 45, color: "#8b5cf6" },
    "sessao-estrategica": { label: "Sessão Estratégica", tag: "Estratégia", duration: 90, color: "#f97316" },
    "terapia": { label: "Terapia", tag: "Saúde Mental", duration: 50, color: "#10b981" },
    "aula-teclado": { label: "Aula de Teclado", tag: "Música", duration: 60, color: "#ec4899" },
    "desenv-pessoal": { label: "Desenv. Pessoal", tag: "Crescimento", duration: 75, color: "#f59e0b" },
};

const HORARIOS =

    [
        "07:00", "07:30", "08:00", "08:30", "09:00", "09:30",
        "10:00", "10:30", "11:00", "11:30", "13:00", "13:30",
        "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
        "17:00", "17:30", "18:00", "18:30", "19:00", "19:30",
    ];


export default function AgendarPage({
    onBack,
    onConfirm,
    params
}: {
    onBack?: () => void;
    onConfirm?: (slots: SessionSlot[], total: number) => void;
    params: Promise<{ id: string }>;
}) {
    const { id } = React.use(params);
    const svc = SERVICES_MAP[id];

    const serviceName = svc?.label ?? "Serviço";
    const serviceTag = svc?.tag ?? "";
    const accentColor = svc?.color ?? "#f97316";
    const duration = svc?.duration ?? 60;
    const pricePerSession = 15;

    const makeSlot = (id: number): SessionSlot => ({ id, date: null, time: null });
    const [slots, setSlots] = useState<SessionSlot[]>([makeSlot(1)]);
    const nextId = useRef(2);

    const addSlot = () => setSlots(p => [...p, makeSlot(nextId.current++)]);
    const removeSlot = (id: number) => setSlots(p => p.filter(s => s.id !== id));
    const updateSlot = (id: number, patch: Partial<SessionSlot>) =>
        setSlots(p => p.map(s => s.id === id ? { ...s, ...patch } : s));

    const completedCount = slots.filter(s => s.date && s.time).length;
    const total = slots.length * pricePerSession;
    const allDone = completedCount === slots.length;


    const { toasts, addToast, removeToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const [modalAberto, setModalAberto] = useState(false);

    const [horarios, setHorarios] = useState<Record<string, string[]>>({});

    useEffect(() => {
        TakeDates();
    }, []);

    async function handleSubmit(dados: any) {
        if (!allDone) return;

        setModalAberto(false);

        try {
            const res = await fetch("/api/new-appointment", {
                method: "POST",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({ slots, total, service: SERVICES_MAP[id].label, dados, duration }),
            });

            if (!res.ok) {
                const contentType = res.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    const data = await res.json();
                    addToast(
                        "Erro ao realizar agendamento: " + (data.error || "Erro desconhecido"),
                        "error"
                    );
                } else {
                    addToast("Erro ao processar agendamento: " + res.statusText, "error");
                }
                return;
            }

            const data = await res.json();

            if (data.status === 200) {
                addToast("Agendamento realizado com sucesso!", "success");
                setTimeout(() => {
                    window.location.href = "/new-appointment";
                }, 1500);
            } else {
                setIsLoading(false);
                addToast("Erro ao realizar agendamento: " + data.error, "error");
            }
        } catch (error) {
            setIsLoading(false);
            console.error("Erro na requisição:", error);
            addToast("Erro ao realizar agendamento. Tente novamente.", "error");
        }
    }

    async function TakeDates() {
        try {
            const res = await fetch("/api/new-appointment/session-dates", {
                method: "GET",
                headers: { "Content-type": "application/json" },
            });

            if (!res.ok) {
                console.error("Erro ao buscar datas:", res.statusText);
                return;
            }

            const data = await res.json();

            setHorarios(data.availableTimes);

        } catch (error) {
            console.error("Erro na requisição:", error);
        }

    }

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Instrument+Sans:wght@400;500;600&display=swap');
        body { font-family:'Instrument Sans',sans-serif; background:#fff; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        .fu { animation:fadeUp 0.4s ease both; }
      `}</style>

            <div className="min-h-screen bg-white bg-linear-to-tr from-white to-blue-50 select-none">
                <ConfirmacaoModal
                    isOpen={modalAberto}
                    onClose={() => setModalAberto(false)}
                    onConfirmar={handleSubmit}
                    numeroConsultas={slots.filter(s => s.date && s.time).length}
                    valorTotal={total}
                    cor1={accentColor}
                    cor2={accentColor + "15"}
                />

                <ToastContainer toasts={toasts} removeToast={removeToast} />

                {/* top bar */}
                <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-gray-100">
                    <div className="max-w-2xl mx-auto px-5 py-3.5 flex items-center justify-between">
                        <button onClick={onBack ?? (() => window.history.back())}
                            className="cursor-pointer flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors font-medium">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                            </svg>
                            Voltar
                        </button>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                            <div className="flex gap-1">
                                {slots.map(s => (
                                    <div key={s.id} className="w-1.5 h-1.5 rounded-full transition-all"
                                        style={{ background: s.date && s.time ? accentColor : "#e5e7eb" }} />
                                ))}
                            </div>
                            <span className="font-semibold" style={{ color: accentColor }}>
                                {completedCount}/{slots.length}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="max-w-2xl mx-auto px-5 pt-8 pb-40">

                    {/* hero */}
                    <div className="fu mb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                                style={{ background: accentColor + "15", color: accentColor }}>◈</div>
                            <div>
                                <span className="block text-[10px] font-bold uppercase tracking-[0.2em] mb-0.5"
                                    style={{ color: accentColor }}>{serviceTag}</span>
                                <h1 className="text-2xl font-black text-gray-900 leading-tight"
                                    style={{ fontFamily: "'Syne',sans-serif" }}>{serviceName}</h1>
                            </div>
                        </div>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            Adicione as sessões que deseja agendar e escolha individualmente a data e o horário de cada uma.
                        </p>
                        <div className="flex items-center gap-1.5 mt-3 text-xs text-gray-400">
                            <svg className="w-3.5 h-3.5 text-gray-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{duration} min por sessão</span>
                            <span className="text-gray-200 mx-1">·</span>
                            <span>R$ {pricePerSession},00 cada</span>
                        </div>
                    </div>

                    {/* quantity */}
                    <div className="fu mb-6" style={{ animationDelay: "60ms" }}>
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">Número de sessões</h2>
                            <span className="text-xs text-gray-400">{slots.length} {slots.length === 1 ? "sessão" : "sessões"}</span>
                        </div>
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-2xl">
                            <button onClick={() => slots.length > 1 && removeSlot(slots[slots.length - 1].id)}
                                disabled={slots.length <= 1}
                                className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 text-xl font-light hover:bg-gray-50 transition-all disabled:opacity-25 disabled:cursor-not-allowed shadow-sm cursor-pointer">−</button>
                            <div className="flex-1 flex items-center justify-center gap-1.5">
                                {Array.from({ length: Math.min(slots.length, 10) }).map((_, i) => (
                                    <div key={i} className="w-2 h-2 rounded-full transition-all"
                                        style={{ background: i < completedCount ? accentColor : accentColor + "30" }} />
                                ))}
                                {slots.length > 10 && <span className="text-xs text-gray-400 font-semibold">+{slots.length - 10}</span>}
                            </div>
                            <button onClick={addSlot} disabled={slots.length >= 20}
                                className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 text-xl font-light hover:bg-gray-50 transition-all disabled:opacity-25 disabled:cursor-not-allowed shadow-sm cursor-pointer">+</button>
                        </div>
                    </div>

                    {/* session cards */}
                    <div className="space-y-3 mb-6">
                        {slots.map((slot, i) => (
                            <div key={slot.id} className="fu" style={{ animationDelay: `${80 + i * 40}ms` }}>
                                <SessionCard
                                    slot={slot} index={i} accentColor={accentColor} duration={duration}
                                    onUpdate={patch => updateSlot(slot.id, patch)}
                                    onRemove={() => removeSlot(slot.id)}
                                    canRemove={slots.length > 1}
                                    horarios={horarios}
                                />
                            </div>
                        ))}
                    </div>

                    <button onClick={addSlot} disabled={slots.length >= 20}
                        className="cursor-pointer w-full py-3 rounded-2xl border-2 border-dashed text-sm font-semibold transition-all hover:border-solid disabled:opacity-30 disabled:cursor-not-allowed"
                        style={{ borderColor: accentColor + "44", color: accentColor }}>
                        + Adicionar sessão
                    </button>
                </div>

                {/* sticky footer */}
                <div className="fixed bottom-0 left-0 right-0 z-10 bg-white/95 backdrop-blur-sm"
                    style={{ boxShadow: "0 -1px 0 rgba(0,0,0,0.06), 0 -8px 24px rgba(0,0,0,0.06)" }}>
                    <div className="max-w-2xl mx-auto px-5 py-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-4">
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Sessões</p>
                                    <p className="text-base font-black text-gray-900" style={{ fontFamily: "'Syne',sans-serif" }}>{slots.length}</p>
                                </div>
                                <div className="w-px h-8 bg-gray-100" />
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Definidas</p>
                                    <p className="text-base font-black" style={{ fontFamily: "'Syne',sans-serif", color: accentColor }}>
                                        {completedCount}/{slots.length}
                                    </p>
                                </div>
                                <div className="w-px h-8 bg-gray-100" />
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Total</p>
                                    <p className="text-base font-black text-gray-900" style={{ fontFamily: "'Syne',sans-serif" }}>R$ {total},00</p>
                                </div>
                            </div>
                            <div className="relative w-10 h-10">
                                <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                                    <circle cx="18" cy="18" r="14" fill="none" stroke="#f3f4f6" strokeWidth="3.5" />
                                    <circle cx="18" cy="18" r="14" fill="none" stroke={accentColor} strokeWidth="3.5"
                                        strokeDasharray={`${slots.length > 0 ? (completedCount / slots.length) * 88 : 0} 88`}
                                        strokeLinecap="round" style={{ transition: "stroke-dasharray 0.4s ease" }} />
                                </svg>
                                <span className="absolute inset-0 flex items-center justify-center text-[9px] font-black"
                                    style={{ color: accentColor }}>
                                    {slots.length > 0 ? Math.round((completedCount / slots.length) * 100) : 0}%
                                </span>
                            </div>
                        </div>
                        <button disabled={!allDone} onClick={() => { onConfirm?.(slots, total); setModalAberto(true); }} className="cursor-pointer w-full py-4 rounded-2xl text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-30 disabled:cursor-not-allowed disabled:translate-y-0" style={{ background: accentColor }}>
                            {allDone
                                ? `Confirmar ${slots.length} ${slots.length === 1 ? "sessão" : "sessões"} · R$ ${total},00`
                                : `Defina mais ${slots.length - completedCount} ${slots.length - completedCount === 1 ? "sessão" : "sessões"} para continuar`
                            }
                        </button>
                    </div>
                </div>
            </div >
        </>
    );
}