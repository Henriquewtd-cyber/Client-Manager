

export type CalendarEvent = {
    id: string;
    title: string;
    nomeCliente: string;
    telefone: string;
    start: Date;
    end: Date;
    description?: string;
    color: string;
    status: "confirmado" | "pendente";
};


type EventModalProps = {
    isOpen: boolean;
    onClose: () => void;
    event: CalendarEvent | null;
};

export function EventModal({ isOpen, onClose, event }: EventModalProps) {
    if (!isOpen || !event) return null;

    const statusColor =
        event.status === "confirmado"
            ? "bg-green-100 text-green-700"
            : "bg-yellow-100 text-yellow-700";

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 relative animate-fadeIn">

                {/* Botão fechar */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-lg"
                >
                    ✕
                </button>

                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                    <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: event.color }}
                    />
                    <h2 className="text-xl font-semibold text-gray-800">
                        {event.title}
                    </h2>
                </div>

                {/* Informações */}
                <div className="space-y-3 text-sm text-gray-600">
                    <div>
                        <span className="font-medium text-gray-800">Cliente:</span>{" "}
                        {event.nomeCliente}
                    </div>

                    <div>
                        <span className="font-medium text-gray-800">Telefone:</span>{" "}
                        {event.telefone}
                    </div>

                    <div>
                        <span className="font-medium text-gray-800">Data:</span>{" "}
                        {event.start.toLocaleDateString("pt-BR")}
                    </div>

                    <div>
                        <span className="font-medium text-gray-800">Horário:</span>{" "}
                        {event.start.toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                        })}{" "}
                        -{" "}
                        {event.end.toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </div>

                    {event.description && (
                        <div>
                            <span className="font-medium text-gray-800">Descrição:</span>
                            <p className="mt-1 text-gray-500">{event.description}</p>
                        </div>
                    )}

                    <div className="pt-2">
                        <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}
                        >
                            {event.status === "confirmado"
                                ? "Confirmado"
                                : "Pendente"}
                        </span>
                    </div>
                </div>

            </div>
        </div >
    );
}