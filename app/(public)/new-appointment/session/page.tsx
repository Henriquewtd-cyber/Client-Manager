"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useSearchParams } from "next/navigation";
import { ToastContainer, useToast } from "@/components/toast";
import ConfirmacaoModal from "@/components/ConfirmModal";


// ─── Data ─────────────────────────────────────────────────────────────────────

const SERVICES_MAP: Record<string, { label: string; tag: string; duration: number; color: string }> = {
    "analise-perfil": { label: "Análise de Perfil", tag: "Autoconhecimento", duration: 60, color: "#0ea5e9" },
    "reuniao-cliente": { label: "Reunião de Cliente", tag: "Negócios", duration: 45, color: "#8b5cf6" },
    "sessao-estrategica": { label: "Sessão Estratégica", tag: "Estratégia", duration: 90, color: "#f97316" },
    "terapia": { label: "Terapia", tag: "Saúde Mental", duration: 50, color: "#10b981" },
    "aula-teclado": { label: "Aula de Teclado", tag: "Música", duration: 60, color: "#ec4899" },
    "desenv-pessoal": { label: "Desenv. Pessoal", tag: "Crescimento", duration: 75, color: "#f59e0b" },
};

const MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const DIAS_HDR = ["D", "S", "T", "Q", "Q", "S", "S"];
const HORARIOS = [
    "07:00", "07:30", "08:00", "08:30", "09:00", "09:30",
    "10:00", "10:30", "11:00", "11:30", "13:00", "13:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
    "17:00", "17:30", "18:00", "18:30", "19:00", "19:30",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isBeforeToday(d: Date) {
    const t = new Date(); t.setHours(0, 0, 0, 0);
    const c = new Date(d); c.setHours(0, 0, 0, 0);
    return c < t;
}
function isSameDay(a: Date, b: Date) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function fmtShort(d: Date) { return `${d.getDate()} ${MESES[d.getMonth()].slice(0, 3)}`; }
function fmtFull(d: Date) { return `${d.getDate()} de ${MESES[d.getMonth()]}`; }

// ─── Types ────────────────────────────────────────────────────────────────────

interface SessionSlot { id: number; date: Date | null; time: string | null; }
interface FloatPos { top: number; left: number; }

// ─── usePortalDropdown ────────────────────────────────────────────────────────
// Hook que gerencia um dropdown renderizado via portal no document.body.
// Posição calculada no momento do clique via getBoundingClientRect do botão.

function usePortalDropdown() {
    const [pos, setPos] = useState<FloatPos | null>(null);

    const open = (btn: HTMLButtonElement) => {
        const r = btn.getBoundingClientRect();
        // position:fixed usa coordenadas de viewport — getBoundingClientRect já devolve isso
        setPos({ top: r.bottom + 6, left: r.left });
    };

    const close = () => setPos(null);
    const toggle = (btn: HTMLButtonElement) => pos ? close() : open(btn);

    return { pos, open, close, toggle, isOpen: pos !== null };
}

// ─── Portal wrapper ───────────────────────────────────────────────────────────

function DropdownPortal({ pos, onClose, children }: {
    pos: FloatPos;
    onClose: () => void;
    children: React.ReactNode;
}) {
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        // delay para não fechar no mesmo click que abre
        const t = setTimeout(() => document.addEventListener("mousedown", handler), 10);
        return () => { clearTimeout(t); document.removeEventListener("mousedown", handler); };
    }, [onClose]);

    return createPortal(
        <div
            ref={panelRef}
            style={{
                position: "fixed",
                top: pos.top,
                left: pos.left,
                zIndex: 99999,
            }}
        >
            {children}
        </div>,
        document.body
    );
}

// ─── MiniCalendar ─────────────────────────────────────────────────────────────

function MiniCalendar({ accentColor, selected, onSelect }: {
    accentColor: string;
    selected: Date | null;
    onSelect: (d: Date) => void;
}) {
    const today = new Date();
    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth());

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (number | null)[] = [
        ...Array(firstDay).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];
    while (cells.length % 7 !== 0) cells.push(null);

    const prev = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
    const next = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

    return (
        <div className="select-none w-60">
            <div className="flex items-center justify-between mb-3">
                <button onClick={prev} className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors">‹</button>
                <span className="text-xs font-bold text-gray-700" style={{ fontFamily: "'Syne',sans-serif" }}>
                    {MESES[month].slice(0, 3)} {year}
                </span>
                <button onClick={next} className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors">›</button>
            </div>
            <div className="grid grid-cols-7 mb-1">
                {DIAS_HDR.map((d, i) => (
                    <div key={i} className="text-center text-[9px] font-bold py-0.5" style={{ color: accentColor + "99" }}>{d}</div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-0.5">
                {cells.map((day, i) => {
                    if (!day) return <div key={i} className="aspect-square" />;
                    const d = new Date(year, month, day);
                    const past = isBeforeToday(d);
                    const isTod = isSameDay(d, today);
                    const isSel = selected ? isSameDay(d, selected) : false;
                    return (
                        <button key={i} disabled={past} onClick={() => onSelect(d)}
                            className={`aspect-square rounded-lg text-[11px] font-semibold flex items-center justify-center transition-all
                ${past ? "text-gray-200 cursor-not-allowed" :
                                    isSel ? "text-white scale-110 shadow-sm" :
                                        isTod ? "font-bold" :
                                            "text-gray-600 hover:bg-gray-100 hover:scale-105"}`}
                            style={isSel ? { background: accentColor } : isTod ? { color: accentColor, outline: `1.5px solid ${accentColor}44`, borderRadius: "8px" } : {}}
                        >{day}</button>
                    );
                })}
            </div>
        </div>
    );
}

// ─── SessionCard ──────────────────────────────────────────────────────────────

function SessionCard({ slot, index, accentColor, duration, onUpdate, onRemove, canRemove }: {
    slot: SessionSlot;
    index: number;
    accentColor: string;
    duration: number;
    onUpdate: (p: Partial<SessionSlot>) => void;
    onRemove: () => void;
    canRemove: boolean;
}) {
    const cal = usePortalDropdown();
    const time = usePortalDropdown();
    const isComplete = slot.date !== null && slot.time !== null;

    return (
        <div>
            <div
                className="bg-white rounded-2xl border transition-all duration-200"
                style={isComplete
                    ? { borderColor: accentColor + "33", boxShadow: `0 4px 20px ${accentColor}12` }
                    : { borderColor: "#f3f4f6" }}
            >
                {/* accent bar */}
                <div className="absolute left-0 top-3 bottom-3 w-0.75 rounded-r-full"
                    style={{ background: isComplete ? accentColor : "#e5e7eb" }} />

                <div className="pl-5 pr-4 py-4">
                    {/* header */}
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black"
                                style={{ background: accentColor + "15", color: accentColor, fontFamily: "'Syne',sans-serif" }}>
                                {index + 1}
                            </div>
                            <span className="text-sm font-bold text-gray-800" style={{ fontFamily: "'Syne',sans-serif" }}>
                                Sessão {index + 1}
                            </span>
                            {isComplete && (
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                                    style={{ background: accentColor + "15", color: accentColor }}>✓ Definida</span>
                            )}
                        </div>
                        {canRemove && (
                            <button onClick={onRemove}
                                className="w-6 h-6 rounded-full bg-gray-100 hover:bg-red-50 text-gray-300 hover:text-red-400 flex items-center justify-center text-[10px] transition-colors">✕</button>
                        )}
                    </div>

                    {/* pickers */}
                    <div className="flex gap-2">
                        {/* DATE */}
                        <button
                            onClick={e => { time.close(); cal.toggle(e.currentTarget); }}
                            className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all"
                            style={cal.isOpen
                                ? { color: accentColor, borderColor: accentColor, background: accentColor + "08" }
                                : { borderColor: "#f3f4f6", background: "#f9fafb", color: "#6b7280" }}
                        >
                            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5" />
                            </svg>
                            {slot.date ? fmtShort(slot.date) : "Escolher data"}
                        </button>

                        {/* TIME */}
                        <button
                            onClick={e => { cal.close(); time.toggle(e.currentTarget); }}
                            className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all"
                            style={time.isOpen
                                ? { color: accentColor, borderColor: accentColor, background: accentColor + "08" }
                                : { borderColor: "#f3f4f6", background: "#f9fafb", color: "#6b7280" }}
                        >
                            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {slot.time ?? "Horário"}
                        </button>
                    </div>

                    {/* completion summary */}
                    {isComplete && (
                        <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-400">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>
                                <span className="font-semibold text-gray-600">{fmtFull(slot.date!)}</span>
                                {" "}às{" "}
                                <span className="font-semibold text-gray-600">{slot.time}</span>
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Calendar portal */}
            {cal.isOpen && cal.pos && (
                <DropdownPortal pos={cal.pos} onClose={cal.close}>
                    <div className="bg-white rounded-2xl border border-gray-100 p-4"
                        style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)" }}>
                        <MiniCalendar
                            accentColor={accentColor}
                            selected={slot.date}
                            onSelect={d => { onUpdate({ date: d }); cal.close(); }}
                        />
                    </div>
                </DropdownPortal>
            )}

            {/* Time portal */}
            {time.isOpen && time.pos && (
                <DropdownPortal pos={time.pos} onClose={time.close}>
                    <div className="bg-white rounded-2xl border border-gray-100 p-3"
                        style={{ width: 200, boxShadow: "0 20px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)" }}>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2.5 px-1">
                            {duration} min · horário
                        </p>
                        <div className="grid grid-cols-3 gap-1 max-h-56 overflow-y-auto">
                            {HORARIOS.map(h => (
                                <button key={h} onClick={() => { onUpdate({ time: h }); time.close(); }}
                                    className="py-2 rounded-xl text-[11px] font-bold transition-all hover:scale-105"
                                    style={slot.time === h
                                        ? { background: accentColor, color: "white" }
                                        : { background: "#f9fafb", color: "#374151" }}>
                                    {h}
                                </button>
                            ))}
                        </div>
                    </div>
                </DropdownPortal>
            )}
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AgendarPage({
    onBack,
    onConfirm,
}: {
    onBack?: () => void;
    onConfirm?: (slots: SessionSlot[], total: number) => void;
}) {
    const searchParams = useSearchParams();
    const serviceId = searchParams.get("id") ?? "";
    const svc = SERVICES_MAP[serviceId];

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

    async function handleSubmit(dados: any) {
        if (!allDone) return;

        try {
            const res = await fetch("/api/new-appointment", {
                method: "POST",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({ slots, total, service: SERVICES_MAP[serviceId].label, dados, duration }),
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
                    addToast("Erro ao realizar login: " + res.statusText, "error");
                }
                return;
            }

            const data = await res.json();

            if (data.status === 200) {
                addToast("Agendamento realizado com sucesso!", "success");
                setTimeout(() => {
                    window.location.href = "/new-appointment";
                }, 1000);
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




    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Instrument+Sans:wght@400;500;600&display=swap');
        body { font-family:'Instrument Sans',sans-serif; background:#fff; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        .fu { animation:fadeUp 0.4s ease both; }
      `}</style>

            <div className="min-h-screen bg-white">
                <ConfirmacaoModal
                    isOpen={modalAberto}
                    onClose={() => setModalAberto(false)}
                    onConfirmar={handleSubmit}
                    numeroConsultas={slots.filter(s => s.date && s.time).length}
                    valorTotal={total}
                />
                {/* top bar */}
                <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-gray-100">
                    <div className="max-w-2xl mx-auto px-5 py-3.5 flex items-center justify-between">
                        <button onClick={onBack ?? (() => window.history.back())}
                            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors font-medium">
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
                                className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 text-xl font-light hover:bg-gray-50 transition-all disabled:opacity-25 disabled:cursor-not-allowed shadow-sm">−</button>
                            <div className="flex-1 flex items-center justify-center gap-1.5">
                                {Array.from({ length: Math.min(slots.length, 10) }).map((_, i) => (
                                    <div key={i} className="w-2 h-2 rounded-full transition-all"
                                        style={{ background: i < completedCount ? accentColor : accentColor + "30" }} />
                                ))}
                                {slots.length > 10 && <span className="text-xs text-gray-400 font-semibold">+{slots.length - 10}</span>}
                            </div>
                            <button onClick={addSlot} disabled={slots.length >= 20}
                                className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 text-xl font-light hover:bg-gray-50 transition-all disabled:opacity-25 disabled:cursor-not-allowed shadow-sm">+</button>
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
                                />
                            </div>
                        ))}
                    </div>

                    <button onClick={addSlot} disabled={slots.length >= 20}
                        className="w-full py-3 rounded-2xl border-2 border-dashed text-sm font-semibold transition-all hover:border-solid disabled:opacity-30 disabled:cursor-not-allowed"
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
                        <button disabled={!allDone} onClick={() => { onConfirm?.(slots, total); setModalAberto(true); }} className="w-full py-4 rounded-2xl text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-30 disabled:cursor-not-allowed disabled:translate-y-0" style={{ background: accentColor }}>
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