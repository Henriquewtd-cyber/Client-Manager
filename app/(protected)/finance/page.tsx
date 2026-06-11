"use client";

import { useState, useEffect, useCallback } from "react";
import { AddModal } from "@/components/finances/Addmodal";
import { CATEGORY_CONFIG, Financa, fmt, PeriodFilter, PERIOD_LABELS, Category } from "@/components/finances/Others";
import { SummaryCard, LoadingToast, TransactionRow } from "@/components/finances/Others";


// ─── Helpers ─────────────────────────────────────────────────────────────────



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



// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FinancesPage() {
  const [financas, setFinancas] = useState<Financa[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<Category | "all">("all");
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("month");

  // Delay
  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

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

      await sleep(500); // delay
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
  const totalOut = totalExpense + totalPurchase;

  const income = totalIncome;
  const out = totalOut;
  const balance = income - out;

  const expensePct = income > 0
    ? Math.min((totalExpense / income) * 100, 100)
    : 0;

  const purchasePct = income > 0
    ? Math.min((totalPurchase / income) * 100, 100)
    : 0;

  const usedPct = Math.min(expensePct + purchasePct, 100);
  const freePct = Math.max(100 - usedPct, 0);

  const isNegative = balance < 0;

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
    <div className="min-h-screen bg-slate-50 font-sans max-w-5xl:">
      {fetchLoading && <LoadingToast />}

      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-800">
              Balanço
            </h1>
            <p className="text-xs text-slate-400">
              {periodSubtitle(periodFilter)}
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Refresh */}
            <button
              onClick={load}
              disabled={fetchLoading}
              title="Atualizar"
              className="cursor-pointer p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-40"
            >
              <svg
                className={`w-4 h-4 ${fetchLoading ? "animate-spin" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>

            {/* Add */}
            <button
              onClick={() => setModalOpen(true)}
              className="cursor-pointer flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 active:scale-[0.97] text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all shadow-sm"
            >
              <span className="text-base leading-none">+</span>
              Adicionar
            </button>
          </div>
        </div>

        {/* Period pills */}
        <div className="max-w-5xl mx-auto px-4 pb-3">
          <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
            {(Object.keys(PERIOD_LABELS) as PeriodFilter[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriodFilter(p)}
                className={`cursor-pointer whitespace-nowrap px-3 py-1 rounded-lg text-xs font-semibold transition-all ${periodFilter === p
                  ? "bg-slate-800 text-white"
                  : "bg-slate-100 text-slate-400 hover:text-slate-600"
                  }`}
              >
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6 pb-24 overflow-y-hidden">
        {/* Error banner */}
        {fetchError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl px-4 py-3 text-sm flex items-center justify-between gap-3">
            <span>{fetchError}</span>

            <button
              onClick={load}
              className="cursor-pointer underline text-xs shrink-0"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* Summary */}
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 transition-opacity duration-200 ${fetchLoading ? "opacity-50" : ""
            }`}
        >
          <SummaryCard
            label="Receitas"
            value={totalIncome}
            type="income"
          />

          <SummaryCard
            label="Saldo"
            value={balance}
            type="balance"
          />

          <SummaryCard
            label="Gastos fixos"
            value={totalExpense}
            type="expense"
            percent={expensePct}
          />

          <SummaryCard
            label="Compras"
            value={totalPurchase}
            type="purchase"
            percent={purchasePct}
          />
        </div>

        {/* Gauge */}
        <div
          className={`bg-white rounded-2xl border p-5 shadow-sm transition-all duration-300 ${isNegative
            ? "border-rose-200 bg-rose-50/30"
            : "border-slate-100"
            }`}
        >
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                Saúde Financeira
              </span>

              <h3
                className={`mt-2 text-2xl font-bold ${isNegative
                  ? "text-rose-600"
                  : "text-slate-800"
                  }`}
              >
                {fmt(balance)}
              </h3>

              <p className="text-xs text-slate-400 mt-1">
                {isNegative
                  ? "Déficit financeiro"
                  : "Saldo disponível"}
              </p>
            </div>

            <div className="text-right text-xs">
              <div className="text-slate-400">Receitas</div>
              <div className="font-bold text-emerald-600">
                {fmt(income)}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Saídas</span>
              <span className="font-semibold text-slate-700">
                {fmt(out)}
              </span>
            </div>

            <div className="w-full h-3 rounded-full overflow-hidden bg-slate-100 flex">
              <div
                className="bg-rose-400 transition-all duration-700"
                style={{ width: `${expensePct}%` }}
              />

              <div
                className="bg-amber-400 transition-all duration-700"
                style={{ width: `${purchasePct}%` }}
              />

              <div
                className={`transition-all duration-700 ${isNegative
                  ? "bg-rose-200"
                  : "bg-emerald-300"
                  }`}
                style={{ width: `${freePct}%` }}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mt-4">
            <span className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
              Gastos
            </span>

            <span className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              Compras
            </span>

            <span className="flex items-center gap-1.5 text-xs text-slate-500">
              <span
                className={`w-2.5 h-2.5 rounded-full ${isNegative
                  ? "bg-rose-200"
                  : "bg-emerald-300"
                  }`}
              />
              {isNegative ? "Déficit" : "Disponível"}
            </span>
          </div>
        </div>

        {/* Transactions */}
        <div
          className={`mb-32 min-h-30 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-opacity duration-200 ${fetchLoading ? "opacity-50" : ""
            }`}
        >
          <div className="flex overflow-hidden border-b border-slate-50 px-4 pt-4 gap-1 ">
            {(["all", "income", "expense", "purchase"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setCategoryFilter(f)}
                className={`cursor-pointer whitespace-nowrap pb-3 px-3 text-xs font-semibold transition-all border-b-2 -mb-px ${categoryFilter === f
                  ? "border-slate-800 text-slate-800"
                  : "border-transparent text-slate-400 hover:text-slate-600"
                  }`}
              >
                {f === "all" ? "Todos" : CATEGORY_CONFIG[f].label}
              </button>
            ))}

            <span className="ml-auto self-center pb-3 text-xs text-slate-300 tabular-nums whitespace-nowrap">
              {visible.length} item{visible.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="px-4">
            {visible.length === 0 ? (
              <div className="py-12 text-center text-slate-300 text-sm">
                Nenhuma transação{" "}
                {periodFilter !== "all" &&
                  `— ${PERIOD_LABELS[periodFilter].toLowerCase()}`}
              </div>
            ) : (
              visible.map((tx) => (
                <TransactionRow
                  key={tx.id}
                  tx={tx}
                  onDelete={handleDelete}
                  deleting={deletingId === tx.id}
                />
              ))
            )}
          </div>
        </div>
      </main>

      <AddModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={handleAdd}
        saving={saving}
      />
    </div>
  );
}