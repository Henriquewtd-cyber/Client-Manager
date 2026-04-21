"use client";

import { useState } from "react";
import Link from "next/link";
import { FaUserCircle, FaWhatsapp } from "react-icons/fa";

// ── Dados dos serviços ──────────────────────────────────────────────────────

const SERVICES = [
  {
    id: "analise-perfil",
    label: "Análise de Perfil",
    desc: "Mapeamento profundo de padrões comportamentais e potencialidades pessoais.",
    duration: 60,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
        <path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    color: "#0ea5e9",
    tag: "Autoconhecimento",
  },
  {
    id: "reuniao-cliente",
    label: "Reunião de Cliente",
    desc: "Alinhamento de expectativas, apresentação de resultados e próximos passos.",
    duration: 45,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
        <path d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    color: "#8b5cf6",
    tag: "Negócios",
  },
  {
    id: "sessao-estrategica",
    label: "Sessão Estratégica",
    desc: "Planejamento de alto impacto, definição de metas e plano de execução.",
    duration: 90,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
        <path d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    color: "#f97316",
    tag: "Estratégia",
  },
  {
    id: "terapia",
    label: "Terapia",
    desc: "Espaço seguro e acolhedor para reflexão, escuta ativa e cuidado emocional.",
    duration: 50,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
        <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    color: "#10b981",
    tag: "Saúde Mental",
  },
  {
    id: "aula-teclado",
    label: "Aula de Teclado",
    desc: "Desenvolvimento musical técnico e expressivo, do básico ao avançado.",
    duration: 60,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
        <path d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    color: "#ec4899",
    tag: "Música",
  },
  {
    id: "desenv-pessoal",
    label: "Desenv. Pessoal",
    desc: "Evolução contínua de hábitos, mentalidade, foco e propósito de vida.",
    duration: 75,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
        <path d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    color: "#f59e0b",
    tag: "Crescimento",
  },
] as const;

type ServiceId = typeof SERVICES[number]["id"];

// ── Componente principal ─────────────────────────────────────────────────────

export default function AgendamentoPage() {
  const [activeModal, setActiveModal] = useState<ServiceId | null>(null);

  const activeService = SERVICES.find(s => s.id === activeModal);

  const MESES_SHORT = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

  return (
    <>
      {/* ── Font import ──────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Instrument+Sans:wght@400;500;600&display=swap');
        body { font-family: 'Instrument Sans', sans-serif; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fadeUp 0.45s ease both; }
      `}</style>

      <main className="min-h-screen bg-linear-to-tr from-white to-blue-50 select-none">

        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="max-w-5xl mx-auto px-5 sm:px-8 pt-16 pb-12">
          {/* ── Icons ─────────────────────────────────────────────── */}

          <a //Whatsapp floating button
            href="https://wa.me/5511999999999"
            target="_blank"
            className="fixed bottom-22 right-6 z-10 bg-green-500 w-14 h-14 rounded-full flex items-center justify-center text-white text-2xl shadow-lg"
          >
            <FaWhatsapp size={40} />
          </a>

          <Link href="http://localhost:3000/login"><div  //Login floating button
            className="fixed bottom-6 right-6 z-10 bg-black w-14 h-14 rounded-full flex items-center justify-center text-white text-2xl shadow-lg"
          >
            <FaUserCircle className="w-14 h-14" />

          </div>
          </Link>

          {/* eyebrow */}
          <div className="flex items-center gap-2.5 mb-6">
            <span className="block w-7 h-px bg-gray-300" />
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400">
              Agendamento Online
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <h1
                className="text-5xl sm:text-6xl font-extrabold text-gray-900 leading-none tracking-tight"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                Agende sua
                <br />
                <span className="relative">
                  sessão
                  {/* underline decoration */}
                  <svg className="absolute -bottom-1 left-0 w-full" height="6" viewBox="0 0 100 6" preserveAspectRatio="none">
                    <path d="M0 5 Q25 1 50 4 Q75 7 100 3" stroke="#0ea5e9" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                  </svg>
                </span>
              </h1>
              <p className="mt-5 text-gray-400 text-base max-w-sm leading-relaxed">
                Escolha o serviço que melhor atende você e selecione data e horário com facilidade.
              </p>
            </div>


          </div>
        </section>

        {/* ── Divider ──────────────────────────────────────────── */}
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <div className="h-px bg-gray-100" />
        </div>

        {/* ── Cards grid ───────────────────────────────────────── */}
        <section className="max-w-5xl mx-auto px-5 sm:px-8 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SERVICES.map((svc, i) => {
              return (
                <div
                  key={svc.id}
                  className="fade-up group relative bg-white border border-gray-100 rounded-3xl p-5 hover:border-gray-200 hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 overflow-hidden"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  {/* subtle top accent */}
                  <div
                    className="absolute top-0 left-6 h-0.75 w-10 rounded-b-full transition-all duration-300 group-hover:w-16"
                    style={{ background: svc.color }}
                  />

                  {/* icon + tag */}
                  <div className="flex items-center justify-between mb-4 mt-1">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
                      style={{ background: svc.color + "15", color: svc.color }}
                    >
                      {svc.icon}
                    </div>
                    <span
                      className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                      style={{ background: svc.color + "12", color: svc.color }}
                    >
                      {svc.tag}
                    </span>
                  </div>

                  {/* title + desc */}
                  <h2 className="text-[15px] font-bold text-gray-900 leading-snug mb-1.5" style={{ fontFamily: "'Syne',sans-serif" }}>
                    {svc.label}
                  </h2>
                  <p className="text-xs text-gray-400 leading-relaxed mb-4">{svc.desc}</p>

                  {/* duration pill */}
                  <div className="flex items-center gap-1.5 mb-4">
                    <svg className="w-3 h-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-[11px] text-gray-400 font-medium">{svc.duration} min</span>
                  </div>

                  {/* CTA / booked state */}
                  {(
                    <Link
                      href={`/new-appointment/session/${svc.id}`}
                      className="w-full py-3 rounded-2xl text-sm font-bold text-white transition-all duration-150 hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0"
                    >
                      <button
                        onClick={() => { }}
                        className="w-full py-3 rounded-2xl text-sm font-bold text-white transition-all duration-150 hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                        style={{ background: svc.color }}
                      >
                        Agendar sessão
                      </button>
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Footer note ──────────────────────────────────────── */}
        <p className="text-center text-[11px] text-gray-300 pb-10">
          Horários no fuso de Brasília · BRT (UTC-3)
        </p>
      </main>
    </>
  );
}
