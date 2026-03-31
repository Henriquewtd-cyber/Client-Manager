import { useState } from "react";
import { SessionSlot } from "@/app/types/appointment";
import { usePortalDropdown } from "@/app/hooks/UseDropdownPortal";
import { fmtFull, fmtShort } from "@/app/lib/DateHelpers";
import { DropdownPortal } from "@/components/session/DropdownPortal";
import { MiniCalendar } from "@/components/session/MiniCalendar";

export function SessionCard({ slot, index, accentColor, duration, onUpdate, onRemove, canRemove, horarios }: {
    slot: SessionSlot;
    index: number;
    accentColor: string;
    duration: number;
    onUpdate: (p: Partial<SessionSlot>) => void;
    onRemove: () => void;
    canRemove: boolean;
    horarios: Record<string, string[]>;
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
                                className="cursor-pointer w-6 h-6 rounded-full bg-gray-100 hover:bg-red-50 text-gray-300 hover:text-red-400 flex items-center justify-center text-[10px] transition-colors">✕</button>
                        )}
                    </div>

                    {/* pickers */}
                    <div className="flex gap-2">
                        {/* DATE */}
                        <button
                            onClick={e => { time.close(); cal.toggle(e.currentTarget); }}
                            className="cursor-pointer flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all"
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
                            className="cursor-pointer flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all"
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
                    <div
                        className="bg-white rounded-2xl border border-gray-100 p-3"
                        style={{ width: 200, boxShadow: "0 20px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)" }}
                    >
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2.5 px-1">
                            {duration} min · horário
                        </p>

                        {/* 1 — Nenhum dia selecionado */}
                        {!slot.date ? (
                            <div className="flex flex-col items-center gap-1.5 py-4 text-center">
                                <span className="text-2xl">📅</span>
                                <p className="text-[11px] font-semibold text-gray-500">Escolha o dia primeiro</p>
                                <p className="text-[10px] text-gray-400">Selecione uma data para ver os horários disponíveis</p>
                            </div>

                            /* 2 — Dia selecionado, mas sem horários */
                        ) : !horarios?.[slot.date.toISOString().split("T")[0]]?.length ? (
                            <div className="flex flex-col items-center gap-1.5 py-4 text-center">
                                <span className="text-2xl">🚫</span>
                                <p className="text-[11px] font-semibold text-gray-500">Sem horários disponíveis</p>
                                <p className="text-[10px] text-gray-400">Nenhum horário livre neste dia</p>
                            </div>

                            /* 3 — Normal */
                        ) : (
                            <div className="grid grid-cols-3 gap-1 max-h-56 overflow-y-auto">
                                {horarios[slot.date.toISOString().split("T")[0]].map(h => (
                                    <button
                                        key={h}
                                        onClick={() => { onUpdate({ time: h }); time.close(); }}
                                        className="cursor-pointer py-2 rounded-xl text-[11px] font-bold transition-all hover:scale-105"
                                        style={slot.time === h
                                            ? { background: accentColor, color: "white" }
                                            : { background: "#f9fafb", color: "#374151" }}
                                    >
                                        {h}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </DropdownPortal>
            )}
        </div>
    );
}