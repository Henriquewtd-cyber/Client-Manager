"use client";

import { useState } from "react";

const MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const DIAS = ["D", "S", "T", "Q", "Q", "S", "S"];
const HORARIOS = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30"];

function isBeforeToday(d: Date) {
    const t = new Date(); t.setHours(0, 0, 0, 0); return d < t;
}
function isSameDay(a: Date, b: Date) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export interface BookingResult { date: Date; time: string; }

interface Props {
    serviceName: string;
    accentColor: string;   // hex
    duration: number;
    onConfirm: (result: BookingResult) => void;
    onClose: () => void;
}

export function BookingModal({ serviceName, accentColor, duration, onConfirm, onClose }: Props) {
    const today = new Date();
    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth());
    const [selDate, setSelDate] = useState<Date | null>(null);
    const [selTime, setSelTime] = useState<string | null>(null);
    const [step, setStep] = useState<"cal" | "time">("cal");

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
    while (cells.length % 7 !== 0) cells.push(null);

    const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
    const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

    const handleDateSelect = (d: Date) => { setSelDate(d); setStep("time"); };
    const handleConfirm = () => { if (selDate && selTime) onConfirm({ date: selDate, time: selTime }); };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.25)", backdropFilter: "blur(10px)" }}
            onClick={onClose}
        >
            <div
                className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl"
                style={{ boxShadow: `0 40px 80px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.06)` }}
                onClick={e => e.stopPropagation()}
            >
                {/* accent bar */}
                <div className="h-1 w-full" style={{ background: accentColor }} />

                <div className="p-6">
                    {/* header */}
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                                {step === "cal" ? "Escolha a data" : `${selDate!.getDate()} de ${MESES[selDate!.getMonth()]}`}
                            </p>
                            <h3 className="text-lg font-black text-gray-900 tracking-tight leading-tight" style={{ fontFamily: "'Syne',sans-serif" }}>
                                {serviceName}
                            </h3>
                        </div>
                        <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 text-xs transition-colors">✕</button>
                    </div>

                    {step === "cal" ? (
                        <>
                            {/* month nav */}
                            <div className="flex items-center justify-between mb-4">
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

                            {/* days */}
                            <div className="grid grid-cols-7 gap-0.5">
                                {cells.map((day, i) => {
                                    if (!day) return <div key={i} />;
                                    const d = new Date(year, month, day);
                                    const past = isBeforeToday(d);
                                    const isTod = isSameDay(d, today);
                                    const isSel = selDate ? isSameDay(d, selDate) : false;
                                    return (
                                        <button
                                            key={i}
                                            disabled={past}
                                            onClick={() => handleDateSelect(d)}
                                            className={`aspect-square rounded-xl text-xs font-semibold transition-all duration-100 flex items-center justify-center
                        ${past ? "text-gray-200 cursor-not-allowed" :
                                                    isSel ? "text-white shadow scale-105" :
                                                        isTod ? "ring-2 font-bold" :
                                                            "text-gray-700 hover:bg-gray-100"}`}
                                            style={
                                                isSel ? { background: accentColor } :
                                                    isTod ? { color: accentColor, borderColor: accentColor, borderWidth: 2 } :
                                                        {}
                                            }
                                        >
                                            {day}
                                        </button>
                                    );
                                })}
                            </div>
                        </>
                    ) : (
                        <>
                            {/* time step */}
                            <div className="flex items-center gap-2 text-xs text-gray-400 mb-4 p-2.5 bg-gray-50 rounded-xl">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <span className="font-medium">{duration} minutos · sessão individual</span>
                            </div>
                            <div className="grid grid-cols-4 gap-1.5 max-h-48 overflow-y-auto">
                                {HORARIOS.map(h => (
                                    <button
                                        key={h}
                                        onClick={() => setSelTime(h)}
                                        className="py-2 rounded-xl text-xs font-bold transition-all duration-100"
                                        style={
                                            selTime === h
                                                ? { background: accentColor, color: "white" }
                                                : { background: "#f9fafb", color: "#374151" }
                                        }
                                    >
                                        {h}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}

                    {/* footer actions */}
                    <div className="flex gap-2 mt-5">
                        {step === "time" && (
                            <button
                                onClick={() => { setStep("cal"); setSelTime(null); }}
                                className="px-4 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-500 text-sm font-semibold transition-colors"
                            >
                                ←
                            </button>
                        )}
                        <button
                            disabled={step === "cal" ? !selDate : !selTime}
                            onClick={step === "cal" ? () => selDate && setStep("time") : handleConfirm}
                            className="flex-1 py-3 rounded-2xl text-sm font-bold text-white transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed hover:-translate-y-0.5"
                            style={{ background: accentColor }}
                        >
                            {step === "cal"
                                ? selDate ? `Continuar — ${selDate.getDate()} de ${MESES[selDate.getMonth()]}` : "Selecione uma data"
                                : selTime ? `Confirmar às ${selTime}` : "Selecione um horário"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}