import { useState } from "react";
import dayjs from "dayjs";

function ModalRow({ icon, label, value }: { icon: string; label: string; value?: string }) {
    if (!value) return null;
    return (
        <div className="flex gap-3">
            <span className="text-base mt-0.5">{icon}</span>
            <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">{label}</div>
                <div className="text-sm font-medium text-slate-800 mt-0.5">{value}</div>
            </div>
        </div>
    );
}

export function EventModal({
    event,
    onClose,
    onDelete,
}: {
    event: any;
    onClose: () => void;
    onDelete?: (id: string) => void;
}) {
    const [confirmDelete, setConfirmDelete] = useState(false);

    if (!event) return null;

    const handleDelete = () => {
        onDelete?.(event.id);
        onClose();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl w-full max-w-md mx-4 shadow-2xl overflow-hidden"
            >
                <div className="h-1.5 w-full" style={{ background: event.color }} />
                <div className="p-6">
                    <div className="flex justify-between items-start mb-5">
                        <h2 className="text-xl font-bold text-slate-900 leading-snug">{event.title}</h2>
                        <button
                            onClick={onClose}
                            className="cursor-pointer text-slate-400 hover:text-slate-600 text-2xl leading-none ml-4"
                        >
                            ✕
                        </button>
                    </div>
                    <div className="space-y-3">
                        <ModalRow icon="👤" label="Cliente" value={event.nomeCliente} />
                        <ModalRow icon="📞" label="Telefone" value={event.telefone} />
                        <ModalRow icon="🕐" label="Início" value={dayjs(event.start).format("DD/MM/YYYY [às] HH:mm")} />
                        <ModalRow icon="🕔" label="Fim" value={dayjs(event.end).format("DD/MM/YYYY [às] HH:mm")} />
                        {event.description && <ModalRow icon="📝" label="Descrição" value={event.description} />}
                    </div>
                    <div className="mt-5 flex items-center justify-between gap-3">
                        <span
                            className="inline-block px-3 py-1 rounded-full text-xs font-bold"
                            style={{ background: `${event.color}22`, color: event.color }}
                        >
                            {event.status}
                        </span>

                        {onDelete && (
                            confirmDelete ? (
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-slate-500">Confirmar exclusão?</span>
                                    <button
                                        onClick={handleDelete}
                                        className="cursor-pointer px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors"
                                    >
                                        Excluir
                                    </button>
                                    <button
                                        onClick={() => setConfirmDelete(false)}
                                        className="cursor-pointer px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setConfirmDelete(true)}
                                    className="cursor-pointer flex items-center gap-1.5 px-3 py-1 rounded-lg text-red-500 hover:bg-red-50 text-xs font-semibold transition-colors"
                                >
                                    🗑 Excluir evento
                                </button>
                            )
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}