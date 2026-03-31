"use client";

import { useState } from "react";

interface ConfirmacaoModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirmar: (dados: DadosConsulta) => void;
    numeroConsultas: number;
    valorTotal: number;
    cor1: string;
    cor2: string;
}

interface DadosConsulta {
    nome: string;
    telefone: string;
    modalidade: "presencial" | "online" | "misto";
    descricao: string;
}

export default function ConfirmacaoModal({
    isOpen,
    onClose,
    onConfirmar,
    numeroConsultas,
    valorTotal,
    cor1,
    cor2,
}: ConfirmacaoModalProps) {
    const [nome, setNome] = useState("");
    const [telefone, setTelefone] = useState("");
    const [modalidade, setModalidade] = useState<"presencial" | "online" | "misto">("online");
    const [descricao, setDescricao] = useState("");
    const [errors, setErrors] = useState<{ nome?: string; telefone?: string }>({});

    if (!isOpen) return null;

    const formatarTelefone = (value: string) => {
        const digits = value.replace(/\D/g, "").slice(0, 11);
        if (digits.length <= 2) return `(${digits}`;
        if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    };

    const validar = () => {
        const novosErros: { nome?: string; telefone?: string } = {};
        if (!nome.trim()) novosErros.nome = "Nome é obrigatório";
        const digits = telefone.replace(/\D/g, "");
        if (digits.length < 10) novosErros.telefone = "Telefone inválido";
        setErrors(novosErros);
        return Object.keys(novosErros).length === 0;
    };

    const handleConfirmar = () => {
        if (!validar()) return;
        onConfirmar({ nome, telefone, modalidade, descricao });
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
        >
            <div
                className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
                style={{ background: "#faf7f4" }}
            >
                {/* Barra top */}
                <div
                    className="h-2 w-full"
                    style={{ background: `linear-gradient(90deg, ${cor1}, ${cor2}, ${cor1})` }}
                />

                <div className="px-8 py-7 bg-white">

                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <p className="text-xs uppercase tracking-widest font-semibold mb-1 text-gray-400"
                                style={{ fontFamily: "'Georgia', serif" }}>
                                Confirmar Agendamento
                            </p>
                            <h2 className="text-2xl font-bold leading-tight text-gray-900"
                                style={{ fontFamily: "'Georgia', serif" }}>
                                Seus dados
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="cursor-pointer mt-1 text-stone-400 hover:text-stone-600 transition-colors text-xl leading-none"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Resumo */}
                    <div
                        className="flex items-center justify-between rounded-xl px-5 py-4 mb-6"
                        style={{ background: "#f5f5f5", border: "1px solid #e5e5e5" }}
                    >
                        <div className="text-center">
                            <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Consultas</p>
                            <p className="text-2xl font-bold text-gray-800"
                                style={{ fontFamily: "'Georgia', serif" }}>
                                {numeroConsultas}
                            </p>
                        </div>
                        <div className="h-10 w-px bg-gray-300" />
                        <div className="text-center">
                            <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Total</p>
                            <p className="text-2xl font-bold text-gray-800"
                                style={{ fontFamily: "'Georgia', serif" }}>
                                {valorTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                            </p>
                        </div>
                    </div>

                    {/* Campos */}
                    <div className="space-y-4 mb-5">

                        {/* Nome */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-gray-500">
                                Nome completo
                            </label>
                            <input
                                type="text"
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                                placeholder="Seu nome"
                                className="w-full rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none transition-all"
                                style={{
                                    background: "#fff",
                                    border: errors.nome ? "1.5px solid #e05c5c" : "1.5px solid #e5e5e5",
                                }}
                                onFocus={(e) => {
                                    e.target.style.border = `1.5px solid ${cor1}`;
                                    e.target.style.boxShadow = `0 0 0 3px ${cor1}22`;
                                }}
                                onBlur={(e) => {
                                    e.target.style.border = errors.nome ? "1.5px solid #e05c5c" : "1.5px solid #e5e5e5";
                                    e.target.style.boxShadow = "none";
                                }}
                            />
                            {errors.nome && (
                                <p className="text-xs mt-1" style={{ color: "#e05c5c" }}>{errors.nome}</p>
                            )}
                        </div>

                        {/* Telefone */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-gray-500">
                                Telefone / WhatsApp
                            </label>
                            <input
                                type="tel"
                                value={telefone}
                                onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
                                placeholder="(11) 99999-9999"
                                className="w-full rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none transition-all"
                                style={{
                                    background: "#fff",
                                    border: errors.telefone ? "1.5px solid #e05c5c" : "1.5px solid #e5e5e5",
                                }}
                                onFocus={(e) => {
                                    e.target.style.border = `1.5px solid ${cor1}`;
                                    e.target.style.boxShadow = `0 0 0 3px ${cor1}22`;
                                }}
                                onBlur={(e) => {
                                    e.target.style.border = errors.telefone ? "1.5px solid #e05c5c" : "1.5px solid #e5e5e5";
                                    e.target.style.boxShadow = "none";
                                }}
                            />
                            {errors.telefone && (
                                <p className="text-xs mt-1" style={{ color: "#e05c5c" }}>{errors.telefone}</p>
                            )}
                        </div>

                        {/* Modalidade */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-gray-500">
                                Modalidade
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                {(["presencial", "online", "misto"] as const).map((op) => (
                                    <button
                                        key={op}
                                        type="button"
                                        onClick={() => setModalidade(op)}
                                        className="cursor-pointer rounded-xl py-3 text-sm font-semibold capitalize transition-all"
                                        style={
                                            modalidade === op
                                                ? {
                                                    background: cor2,
                                                    color: "#1f1f1f",
                                                    border: `1.5px solid ${cor1}`,
                                                    boxShadow: `0 0 0 3px ${cor1}22`
                                                }
                                                : {
                                                    background: "#fff",
                                                    color: "#6b7280",
                                                    border: "1.5px solid #e5e5e5",
                                                }
                                        }
                                    >
                                        {op === "presencial" ? "🏥 Presencial" : op === "online" ? "💻 Online" : "🔄 Misto"}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Descrição */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-gray-500">
                                Descrição{" "}
                                <span className="text-gray-400 font-normal normal-case tracking-normal">
                                    (opcional)
                                </span>
                            </label>
                            <textarea
                                value={descricao}
                                onChange={(e) => setDescricao(e.target.value)}
                                placeholder="Descreva brevemente o motivo da consulta..."
                                rows={3}
                                maxLength={300}
                                className="w-full rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none transition-all resize-none"
                                style={{
                                    background: "#fff",
                                    border: "1.5px solid #e5e5e5",
                                }}
                                onFocus={(e) => {
                                    e.target.style.border = `1.5px solid ${cor1}`;
                                    e.target.style.boxShadow = `0 0 0 3px ${cor1}22`;
                                }}
                                onBlur={(e) => {
                                    e.target.style.border = "1.5px solid #e5e5e5";
                                    e.target.style.boxShadow = "none";
                                }}
                            />
                            <p className="text-right text-xs mt-1 text-gray-400">
                                {descricao.length}/300
                            </p>
                        </div>
                    </div>

                    {/* Botão Confirmar */}
                    <button
                        onClick={handleConfirmar}
                        className="cursor-pointer w-full py-3.5 rounded-xl text-sm font-bold uppercase tracking-widest transition-all active:scale-95"
                        style={{
                            background: `linear-gradient(135deg, ${cor1} 0%, ${cor1}cc 100%)`,
                            color: "#fff",
                            letterSpacing: "0.12em",
                            boxShadow: `0 4px 16px ${cor1}55`,
                            fontFamily: "'Georgia', serif",
                        }}
                    >
                        Confirmar Agendamento
                    </button>

                    <p className="text-center text-xs mt-4 text-gray-400">
                        Entraremos em contato para finalizar seu agendamento.
                    </p>
                </div>
            </div>
        </div>
    );
}