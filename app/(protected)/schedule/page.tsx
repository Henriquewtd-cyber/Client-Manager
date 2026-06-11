"use client";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import isBetween from "dayjs/plugin/isBetween";
import { SessionSlot } from "@/app/types/appointment";

import {
  MonthView,
  WeekView,
  DayView,
  AgendaView,
} from "@/components/schedule/Views";

import { EventModal } from "@/components/schedule/Eventmodal";
import { EventFormModal, EventFormData } from "@/components/schedule/Eventformmodal";

const capitalize = (s: any) => s.charAt(0).toUpperCase() + s.slice(1);

type ViewType = "month" | "week" | "day" | "agenda";
type CalendarEvent = {
  id: string;
  start: Date;
  end: Date;
  [key: string]: any;
};

const VIEWS: ViewType[] = ["month", "week", "day", "agenda"];


dayjs.extend(isBetween);
dayjs.locale("pt-br");


const VIEW_LABELS: Record<ViewType, string> = {
  month: "Mês",
  week: "Semana",
  day: "Dia",
  agenda: "Agenda",
};

export default function CalendarComponent() {

  const makeSlot = (id: number): SessionSlot => ({ id, date: null, time: null });
  const [slots, setSlots] = useState<SessionSlot[]>([makeSlot(1)]);



  const [current, setCurrent] = useState(dayjs());
  const [view, setView] = useState<ViewType>("month");
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formStart, setFormStart] = useState<string | undefined>(undefined);
  const [horarios, setHorarios] = useState<Record<string, string[]>>({});

  // ── Data fetching ──────────────────────────────────────────────────────────
  function fetchEvents() {
    fetch("/api/schedule", { headers: { "Content-Type": "application/json" } })
      .then((r) => r.json())
      .then((data) =>
        setEvents(
          (data ?? []).map((e: any) => ({
            ...e,
            start: new Date(e.start),
            end: new Date(e.end),
          }))
        )
      )
      .catch(console.error);
  }

  async function TakeDates() {
    try {
      const res = await fetch("/api/new-appointment/session-dates", {
        method: "GET",
        headers: { "Content-type": "application/json" },
      });

      if (!res.ok) {
        console.error("Erro ao buscar datas:", res.statusText);
        return;
      }

      const data = await res.json();

      setHorarios(data.availableTimes);

    } catch (error) {
      console.error("Erro na requisição:", error);
    }

  }

  useEffect(() => {
    fetchEvents();
    TakeDates();
  }, []);


  // ── Handlers ───────────────────────────────────────────────────────────────
  async function handleDeleteEvent(id: string) {
    try {
      const res = await fetch("/api/schedule/", {
        method: "DELETE",
        body: JSON.stringify({ id }),
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Falha ao excluir");
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error(err);
    }
  }

  async function handleFormSubmit(data: EventFormData & { start: string; end: string }) {
    await fetch("/api/new-appointment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slots: [
          {
            id: 0,
            date: data.date,
            time: data.time,
          },
        ],
        "dados": data,
        "tipo": data.type
      }),
    });
    setIsFormOpen(false);
    fetchEvents();
  }

  function navigate(dir: "prev" | "next") {
    const unit = view === "day" ? "day" : view === "week" ? "week" : "month";
    setCurrent((c) => (dir === "prev" ? c.subtract(1, unit) : c.add(1, unit)));
  }

  function headerLabel() {
    if (view === "month") return capitalize(current.format("MMMM [de] YYYY"));
    if (view === "week") {
      const s = current.startOf("week");
      const e = current.endOf("week");
      return `${capitalize(s.format("D MMM"))} – ${capitalize(e.format("D MMM YYYY"))}`;
    }
    if (view === "day") return capitalize(current.format("dddd, D [de] MMMM [de] YYYY"));
    return capitalize(current.format("MMMM [de] YYYY"));
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="font-sans h-screen flex flex-col bg-slate-100 text-slate-900">

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between px-4 py-3 md:px-6 md:py-3.5 bg-white border-b border-slate-200 shadow-sm gap-3">
        {/* Ações e navegação */}
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <button
            onClick={() => {
              setFormStart(undefined);
              setIsFormOpen(true);
            }}
            className="cursor-pointer flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-semibold bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors w-full sm:w-auto"
          >
            <span className="text-base leading-none">+</span>
            Adicionar evento
          </button>

          <button
            onClick={() => setCurrent(dayjs())}
            className="cursor-pointer px-3 py-1.5 text-sm font-semibold bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Hoje
          </button>

          <button
            onClick={() => navigate("prev")}
            className="cursor-pointer px-2 py-1 text-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            ‹
          </button>

          <button
            onClick={() => navigate("next")}
            className="cursor-pointer px-2 py-1 text-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            ›
          </button>

          <span className="text-base font-bold text-slate-800 ml-1 truncate">
            {headerLabel()}
          </span>
        </div>

        {/* Seletor de visualização */}
        <div className="grid grid-cols-3 md:flex bg-slate-100 rounded-xl p-1 gap-1 w-full md:w-auto">
          {VIEWS.map((v: ViewType) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`cursor-pointer px-3 py-1.5 text-sm rounded-lg transition-all font-semibold ${view === v
                ? "bg-indigo-500 text-white shadow-md"
                : "text-slate-500 hover:text-slate-800"
                }`}
            >
              {VIEW_LABELS[v]}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar body */}
      <div className="flex-1 flex flex-col overflow-hidden mx-4 my-4 bg-white rounded-2xl border border-slate-200 shadow-md">
        {view === "month" && (
          <MonthView
            current={current}
            events={events}
            onEventClick={setSelectedEvent}
            onDayClick={(day: dayjs.Dayjs) => {
              setFormStart(day.toISOString());
              setIsFormOpen(true);
            }}
          />
        )}
        {view === "week" && (
          <WeekView current={current} events={events} onEventClick={setSelectedEvent} />
        )}
        {view === "day" && (
          <DayView current={current} events={events} onEventClick={setSelectedEvent} />
        )}
        {view === "agenda" && (
          <AgendaView current={current} events={events} onEventClick={setSelectedEvent} />
        )}
      </div>

      {/* Modals */}
      <EventModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onDelete={handleDeleteEvent}
      />
      <EventFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        defaultStart={formStart}
        onSubmit={handleFormSubmit}
        horarios={horarios}
        duration={60}
      />
    </div>
  );
}