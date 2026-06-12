
// ─── Types ───────────────────────────────────────────────────────────────────

export type Category = "income" | "expense" | "purchase";
export type PeriodFilter = "day" | "week" | "month" | "all";

export interface Financa {
    id: string;
    nome: string;
    tipo: string;
    emoji: string;
    data: string;
    valor: number; // stored as int (centavos)
}

// ─── Config ──────────────────────────────────────────────────────────────────

export const CATEGORY_CONFIG: Record<
    Category,
    { label: string; color: string; bg: string; border: string; icon: string }
> = {
    income: { label: "Receita", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", icon: "↑" },
    expense: { label: "Gasto", color: "text-rose-500", bg: "bg-rose-50", border: "border-rose-200", icon: "↓" },
    purchase: { label: "Compra", color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-200", icon: "◈" },
};

export const PERIOD_LABELS: Record<PeriodFilter, string> = {
    day: "Hoje", week: "Semana", month: "Mês", all: "Tudo",
};

export function fmt(centavos: number) {
    return (centavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// ─── Loading Spinner ──────────────────────────────────────────────────────────

export function LoadingToast() {
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

export function SummaryCard({
    label,
    value,
    type,
    percent,
}: {
    label: string;
    value: number;
    type: Category | "balance";
    percent?: number;
}) {
    const configs = {
        income: {
            accent: "bg-emerald-500",
            text: "text-emerald-600",
            light: "bg-emerald-50",
            symbol: "+",
        },
        expense: {
            accent: "bg-rose-400",
            text: "text-rose-500",
            light: "bg-rose-50",
            symbol: "−",
        },
        purchase: {
            accent: "bg-amber-400",
            text: "text-amber-500",
            light: "bg-amber-50",
            symbol: "◈",
        },
        balance: {
            accent: "bg-slate-800",
            text: "text-slate-800",
            light: "bg-slate-50",
            symbol: "=",
        },
    };

    const c = configs[type];

    return (
        <div
            className={`
                w-full
                rounded-xl md:rounded-2xl
                border border-slate-100
                ${c.light}
                p-4 md:p-5
                flex flex-col gap-2 md:gap-3
                shadow-sm
                min-w-0
            `}
        >
            <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] md:text-xs font-semibold tracking-wider md:tracking-widest text-slate-400 uppercase truncate">
                    {label}
                </span>

                <span
                    className={`text-base md:text-lg font-bold ${c.text} opacity-40 shrink-0`}
                >
                    {c.symbol}
                </span>
            </div>

            <span
                className={`
                    text-lg sm:text-xl md:text-2xl
                    font-bold tracking-tight
                    ${c.text}
                    break-words
                `}
            >
                {fmt(value)}
            </span>

            {percent !== undefined && (
                <div className="w-full h-1.5 md:h-1 bg-white rounded-full overflow-hidden">
                    <div
                        className={`h-full ${c.accent} rounded-full transition-all duration-500`}
                        style={{ width: `${Math.min(percent, 100)}%` }}
                    />
                </div>
            )}
        </div>
    );
}

// ─── TransactionRow ───────────────────────────────────────────────────────────

export function TransactionRow({ tx, onDelete, deleting }: { tx: Financa; onDelete: (id: string) => void; deleting?: boolean }) {
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
                    className="cursor-pointer text-slate-500 hover:text-rose-400 text-xs px-1"
                >
                    {deleting ? "…" : "✕"}
                </button>
            </div>
        </div>
    );
}