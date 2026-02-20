"use client";

import { useState } from "react";

const MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const MESES_ABR = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const DIAS = ["D", "S", "T", "Q", "Q", "S", "S"];
const HORARIOS = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
    "17:00", "17:30", "18:00", "18:30",
];
const PRICE_PER_SESSION = 15;

function isBeforeToday(d: Date) {
    const t = new Date(); t.setHours(0, 0, 0, 0); return d < t;
}
function isSameDay(a: Date, b: Date) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function fmtDate(d: Date) {
    return `${d.getDate()} ${MESES_ABR[d.getMonth()]}`;
}

export interface BookingResult {
    quantity: number;
    time: string;
    dates: Date[];
    total: number;
}

interface Props {
    serviceName: string;
    accentColor: string;
    duration: number;
    onConfirm: (result: BookingResult) => void;
    onClose: () => void;
}

export function BookingModal({ serviceName, accentColor, duration, onConfirm, onClose }: Props) {
    const today = new Date();

    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [quantity, setQuantity] = useState(1);
    const [selTime, setSelTime] = useState<string | null>(null);
    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth());
    const [selDates, setSelDates] = useState<Date[]>([]);

    const total = quantity * PRICE_PER_SESSION;

    // calendar cells
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
    while (cells.length % 7 !== 0) cells.push(null);

    const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
    const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

    const toggleDate = (d: Date) => {
        setSelDates(prev => {
            const already = prev.some(p => isSameDay(p, d));
            if (already) return prev.filter(p => !isSameDay(p, d));
            if (prev.length >= quantity) return [...prev.slice(1), d];
            return [...prev, d];
        });
    };

    const canConfirm = selDates.length === quantity && !!selTime;

    const STEP_LABELS = ["Sessões", "Horário", "Datas"];

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.22)", backdropFilter: "blur(10px)" }}
            onClick={onClose}
        >
            <div
                className="bg-white rounded-3xl w-full max-w-sm overflow-hidden"
                style={{ boxShadow: "0 40px 80px rgba(0,0,0,0.14), 0 0 0 1px rgba(0,0,0,0.05)" }}
                onClick={e => e.stopPropagation()}
            >
                {/* accent bar */}
                <div className="h-1 w-full" style={{ background: accentColor }} />

                <div className="p-6">

                    {/* header */}
                    <div className="flex items-start justify-between mb-5">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-0.5">
                                {serviceName}
                            </p>
                            <h3 className="text-lg font-black text-gray-900 tracking-tight" style={{ fontFamily: "'Syne',sans-serif" }}>
                                {STEP_LABELS[step - 1]}
                            </h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 text-xs transition-colors"
                        >✕</button>
                    </div>

                    {/* step indicators */}
                    <div className="flex items-center mb-6">
                        {STEP_LABELS.map((label, i) => {
                            const n = i + 1;
                            const done = step > n;
                            const curr = step === n;
                            return (
                                <div key={label} className="flex items-center flex-1 last:flex-none">
                                    <button
                                        onClick={() => { if (done) setStep(n as 1 | 2 | 3); }}
                                        className={`flex items-center gap-1.5 ${done ? "cursor-pointer" : "cursor-default"}`}
                                    >
                                        <div
                                            className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 transition-all"
                                            style={
                                                done ? { background: accentColor, color: "white" } :
                                                    curr ? { background: accentColor + "18", color: accentColor, border: `1.5px solid ${accentColor}` } :
                                                        { background: "#f3f4f6", color: "#9ca3af" }
                                            }
                                        >
                                            {done ? "✓" : n}
                                        </div>
                                        <span className={`text-[10px] font-semibold hidden sm:block ${curr ? "text-gray-800" : "text-gray-400"}`}>
                                            {label}
                                        </span>
                                    </button>
                                    {i < STEP_LABELS.length - 1 && (
                                        <div className="h-px flex-1 mx-2 rounded" style={{ background: step > n ? accentColor : "#e5e7eb" }} />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* ── STEP 1: Quantidade ─────────────────────────── */}
                    {step === 1 && (
                        <div>
                            <p className="text-xs text-gray-400 leading-relaxed mb-5">
                                Escolha quantas sessões deseja agendar. O valor total é calculado automaticamente.
                            </p>

                            {/* counter */}
                            <div className="flex items-center justify-between bg-gray-50 rounded-2xl p-4 mb-4">
                                <button
                                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                    disabled={quantity <= 1}
                                    className="w-10 h-10 rounded-xl bg-white shadow-sm border border-gray-100 text-gray-600 text-2xl font-light hover:bg-gray-50 transition-all active:scale-95 disabled:opacity-25 flex items-center justify-center"
                                >−</button>

                                <div className="text-center">
                                    <span
                                        className="block text-5xl font-black leading-none"
                                        style={{ fontFamily: "'Syne',sans-serif", color: accentColor }}
                                    >{quantity}</span>
                                    <span className="text-[11px] text-gray-400 font-medium mt-1 block">
                                        {quantity === 1 ? "sessão" : "sessões"}
                                    </span>
                                </div>

                                <button
                                    onClick={() => setQuantity(q => Math.min(20, q + 1))}
                                    disabled={quantity >= 20}
                                    className="w-10 h-10 rounded-xl bg-white shadow-sm border border-gray-100 text-gray-600 text-2xl font-light hover:bg-gray-50 transition-all active:scale-95 disabled:opacity-25 flex items-center justify-center"
                                >+</button>
                            </div>

                            {/* price breakdown */}
                            <div className="rounded-2xl border border-gray-100 overflow-hidden mb-5">
                                <div className="flex justify-between items-center px-4 py-2.5 bg-gray-50">
                                    <span className="text-xs text-gray-400">Valor por sessão</span>
                                    <span className="text-xs font-semibold text-gray-500">R$ {PRICE_PER_SESSION},00</span>
                                </div>
                                <div className="flex justify-between items-center px-4 py-3">
                                    <span className="text-xs text-gray-400">{quantity} × R$ {PRICE_PER_SESSION},00</span>
                                    <span
                                        className="text-xl font-black"
                                        style={{ fontFamily: "'Syne',sans-serif", color: accentColor }}
                                    >R$ {total},00</span>
                                </div>
                            </div>

                            <button
                                onClick={() => setStep(2)}
                                className="w-full py-3.5 rounded-2xl text-sm font-bold text-white transition-all hover:-translate-y-0.5 active:translate-y-0"
                                style={{ background: accentColor }}
                            >
                                Continuar — {quantity} {quantity === 1 ? "sessão" : "sessões"} · R$ {total},00
                            </button>
                        </div>
                    )}

                    {/* ── STEP 2: Horário ────────────────────────────── */}
                    {step === 2 && (
                        <div>
                            <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 rounded-xl mb-4">
                                <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-xs text-gray-400 font-medium">
                                    {duration} min · mesmo horário aplicado em todos os dias
                                </span>
                            </div>

                            <div className="grid grid-cols-4 gap-1.5 mb-5">
                                {HORARIOS.map(h => (
                                    <button
                                        key={h}
                                        onClick={() => setSelTime(h)}
                                        className="py-2.5 rounded-xl text-xs font-bold transition-all duration-100 hover:scale-105"
                                        style={
                                            selTime === h
                                                ? { background: accentColor, color: "white" }
                                                : { background: "#f9fafb", color: "#374151" }
                                        }
                                    >{h}</button>
                                ))}
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => setStep(1)}
                                    className="px-4 py-3.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-500 text-sm font-semibold transition-colors"
                                >←</button>
                                <button
                                    disabled={!selTime}
                                    onClick={() => setStep(3)}
                                    className="flex-1 py-3.5 rounded-2xl text-sm font-bold text-white transition-all hover:-translate-y-0.5 disabled:opacity-30 disabled:cursor-not-allowed disabled:translate-y-0"
                                    style={{ background: accentColor }}
                                >
                                    {selTime ? `Continuar — ${selTime}` : "Selecione um horário"}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── STEP 3: Calendário ─────────────────────────── */}
                    {step === 3 && (
                        <div>
                            {/* chips de datas selecionadas */}
                            <div className="flex flex-wrap gap-1.5 mb-4 min-h-7">
                                {selDates.length === 0 ? (
                                    <span className="text-[11px] text-gray-300 py-1">
                                        Selecione {quantity} {quantity === 1 ? "data" : "datas"} no calendário
                                    </span>
                                ) : (
                                    <>
                                        {selDates
                                            .slice().sort((a, b) => a.getTime() - b.getTime())
                                            .map((d, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => toggleDate(d)}
                                                    className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg transition-opacity hover:opacity-70"
                                                    style={{ background: accentColor + "15", color: accentColor }}
                                                >
                                                    {fmtDate(d)} <span className="opacity-60">×</span>
                                                </button>
                                            ))}
                                        {selDates.length < quantity && (
                                            <span className="text-[11px] text-gray-300 py-1">
                                                +{quantity - selDates.length} {quantity - selDates.length === 1 ? "data" : "datas"}
                                            </span>
                                        )}
                                    </>
                                )}
                            </div>

                            {/* month nav */}
                            <div className="flex items-center justify-between mb-3">
                                <button onClick={prevMonth} className="w-8 h-8 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 text-base transition-colors">‹</button>
                                <span className="text-sm font-bold text-gray-800" style={{ fontFamily: "'Syne',sans-serif" }}>
                                    {MESES[month]} {year}
                                </span>
                                <button onClick={nextMonth} className="w-8 h-8 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 text-base transition-colors">›</button>
                            </div>

                            {/* day headers */}
                            <div className="grid grid-cols-7 mb-1">
                                {DIAS.map((d, i) => (
                                    <div key={i} className="text-center text-[10px] font-bold py-1" style={{ color: accentColor + "99" }}>{d}</div>
                                ))}
                            </div>

                            {/* day cells */}
                            <div className="grid grid-cols-7 gap-0.5 mb-4">
                                {cells.map((day, i) => {
                                    if (!day) return <div key={i} className="aspect-square" />;
                                    const d = new Date(year, month, day);
                                    const past = isBeforeToday(d);
                                    const isTod = isSameDay(d, today);
                                    const idx = selDates.findIndex(s => isSameDay(s, d));
                                    const isSel = idx !== -1;

                                    return (
                                        <button
                                            key={i}
                                            disabled={past}
                                            onClick={() => toggleDate(d)}
                                            className={`
                        aspect-square rounded-xl text-xs font-semibold flex items-center justify-center
                        relative transition-all duration-100
                        ${past ? "text-gray-200 cursor-not-allowed" :
                                                    isSel ? "text-white shadow scale-105" :
                                                        isTod ? "font-bold" :
                                                            "text-gray-700 hover:bg-gray-100 hover:scale-105"}
                      `}
                                            style={
                                                isSel ? { background: accentColor } :
                                                    isTod ? { color: accentColor, outline: `1.5px solid ${accentColor}44` } :
                                                        {}
                                            }
                                        >
                                            {day}
                                            {isSel && quantity > 1 && (
                                                <span
                                                    className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-white text-[8px] font-black flex items-center justify-center"
                                                    style={{ color: accentColor }}
                                                >{idx + 1}</span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* summary */}
                            {canConfirm && (
                                <div className="rounded-2xl px-4 py-3 mb-3 flex items-center justify-between" style={{ background: accentColor + "10" }}>
                                    <div className="text-xs text-gray-500">
                                        <span className="font-semibold text-gray-700">{quantity} {quantity === 1 ? "sessão" : "sessões"}</span>
                                        {" "}· {selTime}
                                    </div>
                                    <span className="font-black text-base" style={{ fontFamily: "'Syne',sans-serif", color: accentColor }}>
                                        R$ {total},00
                                    </span>
                                </div>
                            )}

                            <div className="flex gap-2">
                                <button
                                    onClick={() => setStep(2)}
                                    className="px-4 py-3.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-500 text-sm font-semibold transition-colors"
                                >←</button>
                                <button
                                    disabled={!canConfirm}
                                    onClick={() => onConfirm({ quantity, time: selTime!, dates: selDates, total })}
                                    className="flex-1 py-3.5 rounded-2xl text-sm font-bold text-white transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-30 disabled:cursor-not-allowed disabled:translate-y-0"
                                    style={{ background: accentColor }}
                                >
                                    {canConfirm
                                        ? "Confirmar agendamento"
                                        : `Selecione mais ${quantity - selDates.length} ${quantity - selDates.length === 1 ? "data" : "datas"}`
                                    }
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}