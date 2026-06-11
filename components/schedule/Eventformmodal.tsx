import { useState, useEffect } from "react";
import { X, User, Phone, AlignLeft, Tag, Palette } from "lucide-react";
import { SessionSlot } from "@/app/types/appointment";
import { SessionCard } from "@/components/session/SessionCard";

type EventType = "client" | "meu";
type EventStatus = "pendente" | "confirmado" | "cancelado" | "concluido";

export interface EventFormData {
    title: string;
    nomeCliente: string;
    telefone: string;
    date: Date | null;
    time: string | null;
    description: string;
    color: string;
    status: EventStatus;
    type: EventType;
}

interface EventFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: EventFormData & { start: string; end: string }) => void;
    initialData?: Partial<EventFormData>;
    defaultStart?: string;
    horarios: Record<string, string[]>;
    duration?: number;
}

const EMPTY_FORM: EventFormData = {
    title: "",
    nomeCliente: "",
    telefone: "",
    date: null,
    time: null,
    description: "",
    color: "#6366f1",
    status: "pendente",
    type: "client",
};

const COLOR_OPTIONS = [
    { value: "#6366f1", label: "Índigo" },
    { value: "#0ea5e9", label: "Azul" },
    { value: "#10b981", label: "Verde" },
    { value: "#f59e0b", label: "Âmbar" },
    { value: "#f43f5e", label: "Rosa" },
    { value: "#8b5cf6", label: "Violeta" },
    { value: "#64748b", label: "Cinza" },
];

const STATUS_OPTIONS: { value: EventStatus; label: string }[] = [
    { value: "pendente", label: "Pendente" },
    { value: "confirmado", label: "Confirmado" },
    { value: "cancelado", label: "Cancelado" },
    { value: "concluido", label: "Concluído" },
];

function inputCls(hasError: boolean) {
    return [
        "w-full px-3 py-2 text-sm text-slate-800 bg-slate-50 border rounded-lg outline-none",
        "placeholder:text-slate-400 transition-colors",
        "focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100",
        hasError ? "border-red-400 bg-red-50" : "border-slate-200",
    ].join(" ");
}

function Field({
    label,
    icon,
    error,
    children,
}: {
    label: string;
    icon?: React.ReactNode;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1.5">
                {icon}
                {label}
            </label>
            {children}
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
}

function formatPhone(value: string): string {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return digits.length ? `(${digits}` : "";
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10)
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function EventFormModal({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    defaultStart,
    horarios,
    duration = 60,
}: EventFormModalProps) {
    const [form, setForm] = useState<EventFormData>(EMPTY_FORM);
    const [slot, setSlot] = useState<SessionSlot>({ id: 0, date: null, time: null });
    const [errors, setErrors] = useState<Partial<Record<keyof EventFormData, string>>>({});

    useEffect(() => {
        if (isOpen) {
            setErrors({});
            const initDate = initialData?.date ?? (defaultStart ? new Date(defaultStart) : null);
            const initTime = initialData?.time ?? null;
            setSlot({ id: 0, date: initDate, time: initTime });
            setForm({ ...EMPTY_FORM, ...initialData, date: initDate, time: initTime });
        }
    }, [isOpen, initialData, defaultStart]);

    if (!isOpen) return null;

    const isClient = form.type === "client";

    function set<K extends keyof EventFormData>(key: K, value: EventFormData[K]) {
        setForm((prev) => ({ ...prev, [key]: value }));
        if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
    }

    function validate(): boolean {
        const next: typeof errors = {};
        if (!form.title.trim()) next.title = "Título é obrigatório.";
        if (isClient) {
            if (!form.nomeCliente.trim()) next.nomeCliente = "Nome do cliente é obrigatório.";
            if (!form.telefone.trim()) next.telefone = "Telefone é obrigatório.";
        }
        if (!form.date) next.date = "Data é obrigatória.";
        if (!form.time) next.time = "Horário é obrigatório.";
        setErrors(next);
        return Object.keys(next).length === 0;
    }

    function handleSubmit() {
        if (!validate()) return;
        const [hours, minutes] = (form.time ?? "00:00").split(":").map(Number);
        const start = new Date(form.date!);
        start.setHours(hours, minutes, 0, 0);
        const end = new Date(start);
        end.setMinutes(end.getMinutes() + duration);
        onSubmit({ ...form, start: start.toISOString(), end: end.toISOString() });
    }

    const statusColor: Record<EventStatus, string> = {
        pendente: "bg-amber-100 text-amber-700 ring-amber-300",
        confirmado: "bg-emerald-100 text-emerald-700 ring-emerald-300",
        cancelado: "bg-red-100 text-red-700 ring-red-300",
        concluido: "bg-slate-100 text-slate-600 ring-slate-300",
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Formulário de evento"
        >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-800">
                            {initialData ? "Editar evento" : "Novo evento"}
                        </h2>
                        <p className="text-sm text-slate-500 mt-0.5">
                            {isClient ? "Agendamento de cliente" : "Agenda pessoal"}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                        aria-label="Fechar"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-5">

                    {/* Type toggle */}
                    <div className="flex rounded-xl bg-slate-100 p-1 gap-1">
                        {(["client", "meu"] as EventType[]).map((t) => (
                            <button
                                key={t}
                                onClick={() => set("type", t)}
                                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-150 ${form.type === t
                                    ? "bg-white text-slate-800 shadow-sm"
                                    : "text-slate-500 hover:text-slate-700"
                                    }`}
                            >
                                {t === "client" ? "👤 Cliente" : "📅 Pessoal"}
                            </button>
                        ))}
                    </div>

                    {/* Title */}
                    <Field label="Título" icon={<Tag size={15} />} error={errors.title}>
                        <input
                            type="text"
                            placeholder={isClient ? "Ex: Consulta inicial" : "Ex: Reunião com sócio"}
                            value={form.title}
                            onChange={(e) => set("title", e.target.value)}
                            className={inputCls(!!errors.title)}
                        />
                    </Field>

                    {/* Client fields */}
                    {isClient && (
                        <div className="space-y-4 rounded-xl bg-indigo-50/60 border border-indigo-100 p-4">
                            <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                                Dados do cliente
                            </p>
                            <Field label="Nome do cliente" icon={<User size={15} />} error={errors.nomeCliente}>
                                <input
                                    type="text"
                                    placeholder="Nome completo"
                                    value={form.nomeCliente}
                                    onChange={(e) => set("nomeCliente", e.target.value)}
                                    className={inputCls(!!errors.nomeCliente)}
                                />
                            </Field>
                            <Field label="Telefone" icon={<Phone size={15} />} error={errors.telefone}>
                                <input
                                    type="tel"
                                    placeholder="(11) 99999-9999"
                                    value={form.telefone}
                                    onChange={(e) => set("telefone", formatPhone(e.target.value))}
                                    className={inputCls(!!errors.telefone)}
                                    maxLength={15}
                                />
                            </Field>
                        </div>
                    )}

                    {/* Date & time via SessionCard */}
                    <div>
                        <p className="text-xs font-medium text-slate-500 mb-2">Data e horário</p>
                        <div className="relative">
                            <SessionCard
                                slot={slot}
                                index={0}
                                accentColor={form.color}
                                duration={duration}
                                horarios={horarios}
                                canRemove={false}
                                onRemove={() => { }}
                                onUpdate={(patch) => {
                                    const next = { ...slot, ...patch };
                                    setSlot(next);
                                    if (patch.date !== undefined) set("date", next.date);
                                    if (patch.time !== undefined) set("time", next.time);
                                }}
                            />
                        </div>
                        {(errors.date || errors.time) && (
                            <p className="mt-1 text-xs text-red-500">{errors.date ?? errors.time}</p>
                        )}
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-2">Status</label>
                        <div className="flex flex-wrap gap-2">
                            {STATUS_OPTIONS.map((s) => (
                                <button
                                    key={s.value}
                                    onClick={() => set("status", s.value)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium ring-1 transition-all duration-100 ${form.status === s.value
                                        ? statusColor[s.value] + " ring-2"
                                        : "bg-white text-slate-500 ring-slate-200 hover:ring-slate-300"
                                        }`}
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Color */}
                    <div>
                        <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-2">
                            <Palette size={13} /> Cor
                        </label>
                        <div className="flex gap-2 flex-wrap">
                            {COLOR_OPTIONS.map((c) => (
                                <button
                                    key={c.value}
                                    onClick={() => set("color", c.value)}
                                    title={c.label}
                                    style={{ backgroundColor: c.value }}
                                    className={`w-7 h-7 rounded-full transition-all duration-100 ${form.color === c.value
                                        ? "ring-2 ring-offset-2 ring-slate-400 scale-110"
                                        : "hover:scale-105"
                                        }`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Notes */}
                    <Field label="Observações" icon={<AlignLeft size={15} />}>
                        <textarea
                            placeholder="Detalhes adicionais (opcional)"
                            value={form.description}
                            onChange={(e) => set("description", e.target.value)}
                            rows={3}
                            className={inputCls(false) + " resize-none"}
                        />
                    </Field>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        style={{ backgroundColor: form.color }}
                        className="px-5 py-2 text-sm font-medium text-white rounded-lg shadow-sm hover:opacity-90 active:scale-95 transition-all"
                    >
                        {initialData ? "Salvar alterações" : "Criar evento"}
                    </button>
                </div>
            </div>
        </div>
    );
}