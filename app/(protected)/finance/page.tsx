"use client";

import { useState, useEffect, useCallback } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

type Category = "income" | "expense" | "purchase";
type PeriodFilter = "day" | "week" | "month" | "all";

interface Financa {
  id: string;
  nome: string;
  tipo: string;
  emoji: string;
  data: string;
  valor: number; // stored as int (centavos)
}

// ─── Config ──────────────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<
  Category,
  { label: string; color: string; bg: string; border: string; icon: string }
> = {
  income: { label: "Receita", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", icon: "↑" },
  expense: { label: "Gasto", color: "text-rose-500", bg: "bg-rose-50", border: "border-rose-200", icon: "↓" },
  purchase: { label: "Compra", color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-200", icon: "◈" },
};

const PERIOD_LABELS: Record<PeriodFilter, string> = {
  day: "Hoje", week: "Semana", month: "Mês", all: "Tudo",
};

const ICONS = ["🏠", "🛒", "🍽️", "🚗", "✈️", "💊", "📱", "🎓", "💼", "💰", "🎁", "⚡", "💧", "📺", "🐾", "🏋️"];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(centavos: number) {
  return (centavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function isInPeriod(dateStr: string, period: PeriodFilter): boolean {
  if (period === "all") return true;
  const date = new Date(dateStr);
  const now = new Date();
  if (period === "day") return date.toDateString() === now.toDateString();
  if (period === "week") {
    const w = new Date(now);
    w.setDate(now.getDate() - 7);

    return (
      date >= w &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  }
  if (period === "month") return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  return true;
}

function periodSubtitle(period: PeriodFilter): string {
  if (period === "day") return new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "long" });
  if (period === "week") return "Últimos 7 dias";
  if (period === "month") return new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  return "Todas as transações";
}

// ─── API ─────────────────────────────────────────────────────────────────────

async function apiGet(): Promise<Financa[]> {
  const res = await fetch("/api/finances");
  if (!res.ok) throw new Error("Erro ao buscar finanças");
  const { financas } = await res.json();
  return financas;
}

async function apiCreate(data: Omit<Financa, "id">): Promise<Financa> {
  const res = await fetch("/api/finances", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Erro ao criar");
  return res.json();
}

async function apiDelete(id: string): Promise<void> {
  const res = await fetch("/api/finances/", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
  if (!res.ok) throw new Error("Erro ao deletar");
}

// ─── Loading Spinner ──────────────────────────────────────────────────────────

function LoadingToast() {
  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <div className="bg-white border border-slate-100 shadow-lg rounded-2xl px-5 py-3 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
        <span className="w-4 h-4 border-2 border-slate-200 border-t-slate-700 rounded-full animate-spin flex-shrink-0" />
        <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Atualizando…</span>
      </div>
    </div>
  );
}

// ─── SummaryCard ─────────────────────────────────────────────────────────────

function SummaryCard({
  label, value, type, percent,
}: {
  label: string; value: number; type: Category | "balance"; percent?: number;
}) {
  const configs = {
    income: { accent: "bg-emerald-500", text: "text-emerald-600", light: "bg-emerald-50", symbol: "+" },
    expense: { accent: "bg-rose-400", text: "text-rose-500", light: "bg-rose-50", symbol: "−" },
    purchase: { accent: "bg-amber-400", text: "text-amber-500", light: "bg-amber-50", symbol: "◈" },
    balance: { accent: "bg-slate-800", text: "text-slate-800", light: "bg-slate-50", symbol: "=" },
  };
  const c = configs[type];
  return (
    <div className={`rounded-2xl border border-slate-100 ${c.light} p-5 flex flex-col gap-3 shadow-sm`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-widest text-slate-400 uppercase">{label}</span>
        <span className={`text-lg font-bold ${c.text} opacity-40`}>{c.symbol}</span>
      </div>
      <span className={`text-2xl font-bold tracking-tight ${c.text}`}>{fmt(value)}</span>
      {percent !== undefined && (
        <div className="w-full h-1 bg-white rounded-full overflow-hidden">
          <div className={`h-full ${c.accent} rounded-full transition-all duration-500`} style={{ width: `${Math.min(percent, 100)}%` }} />
        </div>
      )}
    </div>
  );
}

// ─── TransactionRow ───────────────────────────────────────────────────────────

function TransactionRow({ tx, onDelete, deleting }: { tx: Financa; onDelete: (id: string) => void; deleting?: boolean }) {
  const type = tx.tipo as Category;
  const cfg = CATEGORY_CONFIG[type] ?? CATEGORY_CONFIG.expense;
  return (
    <div className={`flex items-center gap-3 py-3 border-b border-slate-50 group transition-opacity ${deleting ? "opacity-40 pointer-events-none" : ""}`}>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base ${cfg.bg} border ${cfg.border} flex-shrink-0`}>
        {tx.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-700 truncate">{tx.nome}</p>
        <p className="text-xs text-slate-400">
          {new Date(tx.data).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span className={`text-sm font-semibold ${cfg.color}`}>
          {type === "income" ? "+" : "−"} {fmt(tx.valor)}
        </span>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
          {cfg.label}
        </span>
        <button
          onClick={() => onDelete(tx.id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-rose-400 text-xs px-1"
        >
          {deleting ? "…" : "✕"}
        </button>
      </div>
    </div>
  );
}

// ─── AddModal ─────────────────────────────────────────────────────────────────

function AddModal({
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
          <button onClick={onClose} className="text-slate-300 hover:text-slate-500 transition-colors text-xl leading-none">✕</button>
        </div>

        {/* Type */}
        <div className="flex gap-2 mb-4">
          {(Object.keys(CATEGORY_CONFIG) as Category[]).map((t) => {
            const c = CATEGORY_CONFIG[t];
            return (
              <button key={t} onClick={() => setType(t)}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${type === t ? `${c.bg} ${c.color} ${c.border}` : "bg-slate-50 text-slate-400 border-slate-100"}`}
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
                className={`w-8 h-8 rounded-lg text-base transition-all ${icon === i ? "bg-slate-800 scale-110" : "bg-slate-50 hover:bg-slate-100"}`}
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
          className="w-full mt-3 bg-slate-800 hover:bg-slate-700 active:scale-[0.98] disabled:opacity-50 text-white font-semibold rounded-xl py-3 text-sm transition-all flex items-center justify-center gap-2"
        >
          {saving
            ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Salvando…</>
            : "Adicionar"}
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Page() {
  const [financas, setFinancas] = useState<Financa[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<Category | "all">("all");
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("month");

  // Fetch
  const load = useCallback(async () => {
    setFetchLoading(true);
    setFetchError("");
    try {
      setFinancas(await apiGet());
    } catch {
      setFetchError("Não foi possível carregar as finanças.");
    } finally {
      setFetchLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Add
  async function handleAdd(data: Omit<Financa, "id">) {
    setSaving(true);
    try {
      const created = await apiCreate(data);
      setFinancas((prev) => [created, ...prev]);
      setModalOpen(false);

      await load(); // refresh to get correct order and totals
    } finally {
      setSaving(false);
    }
  }

  // Delete
  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await apiDelete(id);
      setFinancas((prev) => prev.filter((f) => f.id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  // ── Derived totals ──
  const periodSlice = financas.filter((f) => isInPeriod(f.data, periodFilter));
  const totalIncome = periodSlice.filter((f) => f.tipo === "income").reduce((s, f) => s + f.valor, 0);
  const totalExpense = periodSlice.filter((f) => f.tipo === "expense").reduce((s, f) => s + f.valor, 0);
  const totalPurchase = periodSlice.filter((f) => f.tipo === "purchase").reduce((s, f) => s + f.valor, 0);
  const balance = totalIncome - totalExpense - totalPurchase;
  const totalOut = totalExpense + totalPurchase;
  const expensePct = totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 0;
  const purchasePct = totalIncome > 0 ? (totalPurchase / totalIncome) * 100 : 0;
  const gaugeExpense = totalIncome > 0 ? Math.min((totalExpense / totalIncome) * 100, 100) : 0;
  const gaugePurchase = totalIncome > 0 ? Math.min((totalPurchase / totalIncome) * 100, 100 - gaugeExpense) : 0;

  const visible = periodSlice
    .filter((f) => categoryFilter === "all" || f.tipo === categoryFilter)
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

  // ── First load: full skeleton ──
  if (fetchLoading && financas.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans flex flex-col items-center justify-center gap-6 px-4">
        <div className="flex flex-col items-center gap-3">
          <span className="w-10 h-10 border-4 border-slate-200 border-t-slate-700 rounded-full animate-spin" />
          <span className="text-sm font-semibold text-slate-400">Carregando finanças…</span>
        </div>
        {/* Skeleton cards */}
        <div className="w-full max-w-2xl grid grid-cols-2 gap-3 animate-pulse">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 rounded-2xl bg-slate-100" />)}
        </div>
      </div>
    );
  }

  // ── Empty state ──
  if (!fetchLoading && financas.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Nenhuma transação encontrada</h1>
          <p className="text-sm text-slate-400 mb-6">Adicione sua primeira transação para começar a acompanhar suas finanças.</p>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 active:scale-[0.97] text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all shadow-sm"
          >
            <span className="text-base leading-none">+</span> Adicionar Transação
          </button>
        </div>
        <AddModal open={modalOpen} onClose={() => setModalOpen(false)} onAdd={handleAdd} saving={saving} />
      </div>
    );
  }

  // ── Main view ──
  return (
    <div className="min-h-screen bg-slate-50 font-sans">

      {/* Loading toast (subsequent refreshes) */}
      {fetchLoading && <LoadingToast />}

      {/* ── Header ── */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-800">Balanço</h1>
            <p className="text-xs text-slate-400">{periodSubtitle(periodFilter)}</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Refresh */}
            <button
              onClick={load} disabled={fetchLoading} title="Atualizar"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-40"
            >
              <svg className={`w-4 h-4 ${fetchLoading ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            {/* Add */}
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 active:scale-[0.97] text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all shadow-sm"
            >
              <span className="text-base leading-none">+</span> Adicionar
            </button>
          </div>
        </div>

        {/* Period pills */}
        <div className="max-w-2xl mx-auto px-4 pb-3 flex gap-1.5">
          {(Object.keys(PERIOD_LABELS) as PeriodFilter[]).map((p) => (
            <button key={p} onClick={() => setPeriodFilter(p)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${periodFilter === p ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-400 hover:text-slate-600"
                }`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">

        {/* Error banner */}
        {fetchError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl px-4 py-3 text-sm flex items-center justify-between">
            {fetchError}
            <button onClick={load} className="underline text-xs ml-3 flex-shrink-0">Tentar novamente</button>
          </div>
        )}

        {/* Summary */}
        <div className={`grid grid-cols-2 gap-3 transition-opacity duration-200 ${fetchLoading ? "opacity-50" : ""}`}>
          <SummaryCard label="Receitas" value={totalIncome} type="income" />
          <SummaryCard label="Saldo" value={balance} type="balance" />
          <SummaryCard label="Gastos fixos" value={totalExpense} type="expense" percent={expensePct} />
          <SummaryCard label="Compras" value={totalPurchase} type="purchase" percent={purchasePct} />
        </div>

        {/* Gauge bar */}
        <div className={`bg-white rounded-2xl border border-slate-100 p-5 shadow-sm transition-opacity duration-200 ${fetchLoading ? "opacity-50" : ""}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Saídas vs. Receita</span>
            <span className="text-xs font-bold text-slate-500">{fmt(totalOut)} / {fmt(totalIncome)}</span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
            <div className="h-full bg-rose-400 rounded-l-full transition-all duration-700" style={{ width: `${gaugeExpense}%` }} />
            <div className="h-full bg-amber-400 transition-all duration-700" style={{ width: `${gaugePurchase}%` }} />
          </div>
          <div className="flex gap-4 mt-2.5">
            {([["bg-rose-400", "Gastos"], ["bg-amber-400", "Compras"], ["bg-slate-100", "Livre"]] as [string, string][]).map(([bg, lbl]) => (
              <span key={lbl} className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className={`w-2.5 h-2.5 rounded-sm ${bg} inline-block`} /> {lbl}
              </span>
            ))}
          </div>
        </div>

        {/* Transaction list */}
        <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-opacity duration-200 ${fetchLoading ? "opacity-50" : ""}`}>
          {/* Category tabs */}
          <div className="flex border-b border-slate-50 px-4 pt-4 gap-1">
            {(["all", "income", "expense", "purchase"] as const).map((f) => (
              <button key={f} onClick={() => setCategoryFilter(f)}
                className={`pb-3 px-3 text-xs font-semibold transition-all border-b-2 -mb-px ${categoryFilter === f ? "border-slate-800 text-slate-800" : "border-transparent text-slate-400 hover:text-slate-600"
                  }`}
              >
                {f === "all" ? "Todos" : CATEGORY_CONFIG[f].label}
              </button>
            ))}
            <span className="ml-auto self-center pb-3 text-xs text-slate-300 tabular-nums">
              {visible.length} item{visible.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="px-4">
            {visible.length === 0 ? (
              <div className="py-12 text-center text-slate-300 text-sm">
                Nenhuma transação {periodFilter !== "all" && `— ${PERIOD_LABELS[periodFilter].toLowerCase()}`}
              </div>
            ) : (
              visible.map((tx) => (
                <TransactionRow key={tx.id} tx={tx} onDelete={handleDelete} deleting={deletingId === tx.id} />
              ))
            )}
          </div>
        </div>
      </main>

      <AddModal open={modalOpen} onClose={() => setModalOpen(false)} onAdd={handleAdd} saving={saving} />
    </div>
  );
}