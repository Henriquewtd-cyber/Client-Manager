"use client";

import { useState } from "react";
import { Category, CATEGORY_CONFIG, Financa } from "./Others";



const ICONS = ["🏠", "🛒", "🍽️", "🚗", "✈️", "💊", "📱", "🎓", "💼", "💰", "🎁", "⚡", "💧", "📺", "🐾", "🏋️"];

// ─── AddModal ─────────────────────────────────────────────────────────────────

export function AddModal({
    open, onClose, onAdd, saving,
}: {
    open: boolean;
    onClose: () => void;
    onAdd: (data: Omit<Financa, "id">) => Promise<void>;
    saving: boolean;
}) {
    const [type, setType] = useState<Category>("expense");
    const [label, setLabel] = useState("");
    const [amount, setAmount] = useState("");
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
    const [icon, setIcon] = useState("🛒");
    const [error, setError] = useState("");

    async function handleSubmit() {
        setError("");
        const n = Math.round(parseFloat(amount.replace(",", ".")) * 100);
        if (!label.trim()) { setError("Informe uma descrição."); return; }
        if (isNaN(n) || n <= 0) { setError("Informe um valor válido."); return; }
        try {
            await onAdd({ nome: label.trim(), tipo: type, emoji: icon, data: new Date(date + "T12:00:00").toISOString(), valor: n });
            setLabel(""); setAmount(""); setDate(new Date().toISOString().slice(0, 10)); setIcon("🛒");
        } catch {
            setError("Não foi possível salvar. Tente novamente.");
        }
    }

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md mx-4 p-6" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-base font-bold text-slate-800 tracking-tight">Nova Transação</h2>
                    <button onClick={onClose} className="cursor-pointer text-slate-300 hover:text-slate-500 transition-colors text-xl leading-none">✕</button>
                </div>

                {/* Type */}
                <div className="flex gap-2 mb-4">
                    {Object.entries(CATEGORY_CONFIG).map(([t, c]) => {
                        const typeKey = t as Category;
                        return (
                            <button key={typeKey} onClick={() => setType(typeKey)}
                                className={`cursor-pointer flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${type === typeKey ? `${c.bg} ${c.color} ${c.border}` : "bg-slate-50 text-slate-400 border-slate-100"}`}
                            >
                                {c.icon} {c.label}
                            </button>
                        );
                    })}
                </div>

                {/* Icon */}
                <div className="mb-4">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Ícone</label>
                    <div className="flex flex-wrap gap-2">
                        {ICONS.map((i) => (
                            <button key={i} onClick={() => setIcon(i)}
                                className={`cursor-pointer w-8 h-8 rounded-lg text-base transition-all ${icon === i ? "bg-slate-800 scale-110" : "bg-slate-50 hover:bg-slate-100"}`}
                            >{i}</button>
                        ))}
                    </div>
                </div>

                {/* Label */}
                <div className="mb-3">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Descrição</label>
                    <input
                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                        placeholder="Ex: Aluguel, Salário..."
                        value={label} onChange={(e) => setLabel(e.target.value)}
                    />
                </div>

                {/* Amount + Date */}
                <div className="flex gap-3 mb-2">
                    <div className="flex-1">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Valor (R$)</label>
                        <input
                            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                            placeholder="0,00" value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Data</label>
                        <input
                            type="date"
                            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                            value={date} onChange={(e) => setDate(e.target.value)}
                        />
                    </div>
                </div>

                {error && <p className="text-xs text-rose-500 mt-1 mb-2">{error}</p>}

                <button
                    onClick={handleSubmit} disabled={saving}
                    className="cursor-pointer w-full mt-3 bg-slate-800 hover:bg-slate-700 active:scale-[0.98] disabled:opacity-50 text-white font-semibold rounded-xl py-3 text-sm transition-all flex items-center justify-center gap-2"
                >
                    {saving
                        ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Salvando…</>
                        : "Adicionar"}
                </button>
            </div>
        </div>
    );
}