'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastContainer, useToast } from "@/components/toast";


interface Comprovante {
    id: string;
    nome: string;
    telefone: string;
    data: string;
    tipo: 'imagem' | 'pdf';
    url: string;
    status?: 'pendente' | 'aceito' | 'recusado';
}

const mockComprovantes: Comprovante[] = [ // remover depois
    {
        id: "1",
        nome: "João Silva",
        telefone: "11999999999",
        data: "2026-04-01T14:30:00",
        tipo: "imagem",
        url: "https://via.placeholder.com/300x400.png?text=Comprovante+1",
        status: "pendente",
    },
    {
        id: "2",
        nome: "Maria Oliveira",
        telefone: "11988888888",
        data: "2026-04-02T10:15:00",
        tipo: "pdf",
        url: "https://example.com/comprovante2.pdf",
        status: "aceito",
    },
    {
        id: "3",
        nome: "Carlos Souza",
        telefone: "11977777777",
        data: "2026-04-02T18:45:00",
        tipo: "imagem",
        url: "https://via.placeholder.com/300x400.png?text=Comprovante+3",
        status: "recusado",
    },
    {
        id: "4",
        nome: "Ana Costa",
        telefone: "11966666666",
        data: "2026-04-03T09:00:00",
        tipo: "pdf",
        url: "https://example.com/comprovante4.pdf",
        status: "pendente",
    },
];

export default function ComprovantesPage() {
    const [comprovantes, setComprovantes] = useState<Comprovante[]>([]);
    const [selectedComprovante, setSelectedComprovante] = useState<Comprovante | null>(null);
    const [filter, setFilter] = useState<'todos' | 'pendente' | 'aceito' | 'recusado'>('todos');
    const { toasts, addToast, removeToast } = useToast();

    async function getComprovantes() {
        try {
            const res = await fetch("/api/pending-itens", {
                method: "GET",
                headers: { "Content-type": "application/json" },
            });

            if (!res.ok) {
                console.error("Erro ao buscar comprovantes:", res.statusText);
                return;
            }

            const data = await res.json();

            setComprovantes(data.comprovantes || mockComprovantes);

        } catch (error) {
            console.error("Erro na requisição:", error);
        }

    }

    useEffect(() => {
        getComprovantes();
    }, []);

    async function handlePostSubmit() {
        try {

            const res = await fetch("/api/pending-itens", {
                method: "POST",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify(comprovantes),
            });

            if (!res.ok) {
                console.error("Erro ao enviar alterações:", res.statusText);
                addToast("Erro ao enviar alterações:", "error");
                return;
            }

            const data = await res.json();
            console.log("Alterações enviadas com sucesso:", data);
            addToast("Pendências atualizadas com sucesso! As alterações serão enviadas para os clientes", "success");

        } catch (error) {
            console.error("Erro na requisição:", error);
            addToast("Erro ao enviar alterações:", "error");
        }
    }

    const handleAceitar = (id: string) => {
        setComprovantes(prev =>
            prev.map(c => c.id === id ? { ...c, status: 'aceito' as const } : c)
        );

        setSelectedComprovante(null);
    };

    const handleRecusar = (id: string) => {
        setComprovantes(prev =>
            prev.map(c => c.id === id ? { ...c, status: 'recusado' as const } : c)
        );
        setSelectedComprovante(null);
    };

    const comprovantesFiltrados = comprovantes.filter(c =>
        filter === 'todos' ? true : c.status === filter
    );

    return (

        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 " >
            <ToastContainer toasts={toasts} removeToast={removeToast} />

            <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Karla:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,600;9..144,700&display=swap');
        
        * {
          box-sizing: border-box;
        }
        
        body {
          margin: 0;
          font-family: 'Karla', sans-serif;
        }
      `}</style>

            {/* Header */}
            <motion.header
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-md"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">

                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                        {/* Título */}
                        <div>
                            <h1
                                className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight"
                                style={{ fontFamily: "'Karla', sans-serif" }}
                            >
                                Comprovantes
                            </h1>

                            <p className="text-slate-600 text-sm sm:text-base mt-1">
                                {comprovantesFiltrados.length}{' '}
                                {comprovantesFiltrados.length === 1 ? 'item' : 'itens'}
                            </p>
                        </div>

                        {/* Filtros */}
                        <div className="flex flex-wrap gap-2">
                            {(['todos', 'pendente', 'aceito', 'recusado'] as const).map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`cursor-pointer px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                                        ${filter === f
                                            ? 'bg-indigo-600 text-white shadow-md'
                                            : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                                        }`}
                                >
                                    {f.charAt(0).toUpperCase() + f.slice(1)}
                                </button>
                            ))}
                        </div>
                        { /* Botão para mandar as alterações */}
                        <button
                            className="cursor-pointer bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors duration-200"
                            onClick={handlePostSubmit}
                        >
                            Enviar Alterações  ✓
                        </button>

                    </div>
                </div>
            </motion.header>

            {/* Lista de Comprovantes */}
            <main className="max-w-7xl mx-auto px-6 py-8" >
                <motion.div

                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {
                        comprovantesFiltrados.map((comprovante, index) => (
                            <motion.div
                                key={comprovante.id}

                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                transition={{
                                    duration: 0.3,
                                    ease: [0.22, 1, 0.36, 1],
                                    delay: index * 0.07
                                }}
                                whileHover={{ y: -4 }}
                                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer border border-slate-100"
                                onClick={() => setSelectedComprovante(comprovante)}
                            >
                                {/* Preview */}
                                < div className="h-48  relative overflow-hidden" >
                                    {
                                        comprovante.tipo === 'imagem' ? (
                                            <img
                                                src={comprovante.url}
                                                alt={comprovante.nome}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center" >
                                                <svg className="w-16 h-16 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                        )}

                                    {/* Badge de Status */}
                                    <div className="absolute top-3 right-3" >
                                        <span className={
                                            `px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${comprovante.status === 'aceito'
                                                ? 'bg-green-500/90 text-white'
                                                : comprovante.status === 'recusado'
                                                    ? 'bg-red-500/90 text-white'
                                                    : 'bg-amber-500/90 text-white'
                                            }`
                                        }>
                                            {
                                                comprovante.status === 'aceito' ? '✓ Aceito' :
                                                    comprovante.status === 'recusado' ? '✗ Recusado' : '⏱ Pendente'
                                            }
                                        </span>
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="p-5" >
                                    <h3 className="font-bold text-lg text-slate-900 mb-2" style={{ fontFamily: "'Fraunces', serif" }}>
                                        {comprovante.nome}
                                    </h3>
                                    < div className="space-y-1.5 text-sm text-slate-600" >
                                        <div className="flex items-center gap-2" >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                            < span > {comprovante.telefone} </span>
                                        </div>
                                        < div className="flex items-center gap-2" >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            < span > {new Date(comprovante.data).toLocaleDateString('pt-BR')} </span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                </motion.div>
            </main>

            {/* Modal de Visualização */}
            <AnimatePresence>
                {selectedComprovante && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
                        onClick={() => setSelectedComprovante(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header do Modal */}
                            < div className="p-6 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-blue-50" >
                                <div className="flex items-start justify-between" >
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-900 mb-2" style={{ fontFamily: "'Fraunces', serif" }}>
                                            {selectedComprovante.nome}
                                        </h2>
                                        < div className="flex gap-4 text-sm text-slate-600" >
                                            <span className="flex items-center gap-1.5" >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                </svg>
                                                {selectedComprovante.telefone}
                                            </span>
                                            < span className="flex items-center gap-1.5" >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                {new Date(selectedComprovante.data).toLocaleDateString('pt-BR')}
                                            </span>
                                        </div>
                                    </div>
                                    < button
                                        onClick={() => setSelectedComprovante(null)}
                                        className="cursor-pointer text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Conteúdo do Comprovante */}
                            <div className="p-6 max-h-[50vh] overflow-auto" >
                                {
                                    selectedComprovante.tipo === 'imagem' ? (
                                        <img
                                            src={selectedComprovante.url}
                                            alt={selectedComprovante.nome}
                                            className="w-full h-auto rounded-xl shadow-lg"
                                        />
                                    ) : (
                                        <iframe
                                            src={selectedComprovante.url}
                                            className="w-full h-[500px] rounded-xl border border-slate-200"
                                            title={`PDF: ${selectedComprovante.nome}`}
                                        />
                                    )}
                            </div>

                            {/* Ações */}
                            {
                                selectedComprovante.status === 'pendente' && (
                                    <div className="p-6 border-t border-slate-200 bg-slate-50 flex gap-4" >
                                        <button
                                            onClick={() => handleRecusar(selectedComprovante.id)}
                                            className="cursor-pointer flex-1 px-6 py-3.5 rounded-xl font-semibold bg-white text-red-600 border-2 border-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm hover:shadow-md"
                                        >
                                            ✗ Recusar
                                        </button>
                                        < button
                                            onClick={() => handleAceitar(selectedComprovante.id)
                                            }
                                            className="cursor-pointer flex-1 px-6 py-3.5 rounded-xl font-semibold bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg shadow-green-200 hover:shadow-xl"
                                        >
                                            ✓ Aceitar
                                        </button>
                                    </div>
                                )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}