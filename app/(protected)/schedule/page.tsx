"use client";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(isBetween);
dayjs.locale("pt-br");

const capitalize = (s: any) => s.charAt(0).toUpperCase() + s.slice(1);
const VIEWS = ["month", "week", "day", "agenda"];
const WEEKDAYS_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

function getDaysInMonth(date: any) {
  const start = dayjs(date).startOf("month").startOf("week");
  const end = dayjs(date).endOf("month").endOf("week");
  const days = [];
  let curr = start;
  while (curr.isBefore(end) || curr.isSame(end, "day")) {
    days.push(curr);
    curr = curr.add(1, "day");
  }
  return days;
}

function getDaysInWeek(date: any) {
  const start = dayjs(date).startOf("week");
  return Array.from({ length: 7 }, (_, i) => start.add(i, "day"));
}

function getEventsForDay(events: any[], date: any) {
  return events.filter((e) => {
    const start = dayjs(e.start);
    const end = dayjs(e.end);
    return (
      dayjs(date).isSame(start, "day") ||
      dayjs(date).isBetween(start, end, "day", "[]")
    );
  });
}

function getEventsForHour(events: any, date: any, hour: any) {
  return events.filter((e: any) => {
    const start = dayjs(e.start);
    return dayjs(date).isSame(start, "day") && start.hour() === hour;
  });
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function EventModal({ event, onClose }: any) {
  if (!event) return null;
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
              className="text-slate-400 hover:text-slate-600 text-2xl leading-none ml-4"
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
          <div className="mt-5">
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-bold"
              style={{ background: `${event.color}22`, color: event.color }}
            >
              {event.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModalRow({ icon, label, value }: any) {
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

// ─── Event Pill ───────────────────────────────────────────────────────────────
function EventPill({ event, onClick, compact = false }: any) {
  return (
    <div
      onClick={(e) => { e.stopPropagation(); onClick(event); }}
      title={`${event.title} — ${event.nomeCliente}`}
      className={`rounded-md font-semibold cursor-pointer truncate transition-all duration-150 hover:-translate-y-px mb-0.5 text-white ${compact ? "text-[11px] px-1.5 py-0.5" : "text-xs px-2 py-1"
        }`}
      style={{ background: event.color }}
    >
      {compact ? event.title : `${dayjs(event.start).format("HH:mm")} ${event.title}`}
    </div>
  );
}

// ─── Month View ───────────────────────────────────────────────────────────────
function MonthView({ current, events, onEventClick, onDayClick }: any) {
  const days = getDaysInMonth(current);
  const today = dayjs();

  return (
    <div className="flex flex-col flex-1">
      <div className="grid grid-cols-7 border-b border-slate-200">
        {WEEKDAYS_SHORT.map((d, i) => (
          <div
            key={d}
            className={`text-center py-2.5 text-xs font-bold uppercase tracking-wider ${i === 0 || i === 6 ? "text-slate-400" : "text-slate-500"
              }`}
          >
            {d}
          </div>
        ))}
      </div>

      <div
        className="flex-1 grid grid-cols-7 border-l border-slate-200"
        style={{ gridTemplateRows: `repeat(${days.length / 7}, minmax(90px, 1fr))` }}
      >
        {days.map((day, idx) => {
          const isCurrentMonth = day.month() === dayjs(current).month();
          const isToday = day.isSame(today, "day");
          const isWeekend = day.day() === 0 || day.day() === 6;
          const dayEvents = getEventsForDay(events, day);
          const MAX_VISIBLE = 3;

          return (
            <div
              key={idx}
              onClick={() => onDayClick(day)}
              className={`border-r border-b border-slate-200 p-1.5 cursor-pointer transition-colors hover:bg-slate-50 ${isWeekend && isCurrentMonth
                ? "bg-slate-50"
                : isCurrentMonth
                  ? "bg-white"
                  : "bg-slate-100"
                }`}
            >
              <div className="flex justify-start mb-1">
                <div
                  className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-semibold ${isToday ? "bg-indigo-500 text-white font-bold" : isCurrentMonth ? "text-slate-800" : "text-slate-300"
                    }`}
                >
                  {day.date()}
                </div>
              </div>
              {dayEvents.slice(0, MAX_VISIBLE).map((ev: any) => (
                <EventPill key={ev.id} event={ev} onClick={onEventClick} compact />
              ))}
              {dayEvents.length > MAX_VISIBLE && (
                <div className="text-[11px] text-indigo-500 font-semibold pl-1">
                  +{dayEvents.length - MAX_VISIBLE} mais
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Week View ────────────────────────────────────────────────────────────────
function WeekView({ current, events, onEventClick }: any) {
  const days = getDaysInWeek(current);
  const today = dayjs();

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="grid border-b-2 border-slate-200" style={{ gridTemplateColumns: "56px repeat(7,1fr)" }}>
        <div />
        {days.map((day, i) => {
          const isToday = day.isSame(today, "day");
          return (
            <div key={i} className="text-center py-2.5">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                {WEEKDAYS_SHORT[day.day()]}
              </div>
              <div
                className={`inline-flex items-center justify-center w-8 h-8 rounded-full mt-1 text-[15px] font-bold ${isToday ? "bg-indigo-500 text-white" : "text-slate-800"
                  }`}
              >
                {day.date()}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto">
        {HOURS.map((hour) => (
          <div key={hour} className="grid min-h-[60px]" style={{ gridTemplateColumns: "56px repeat(7,1fr)" }}>
            <div className="text-[11px] text-slate-400 font-semibold text-right pr-2.5 pt-1 border-r border-slate-200">
              {hour === 0 ? "" : `${String(hour).padStart(2, "0")}:00`}
            </div>
            {days.map((day, di) => {
              const isWeekend = day.day() === 0 || day.day() === 6;
              const hourEvents = getEventsForHour(events, day, hour);
              return (
                <div
                  key={di}
                  className={`border-r border-b border-slate-100 p-0.5 min-h-[60px] ${isWeekend ? "bg-slate-50" : "bg-white"
                    }`}
                >
                  {hourEvents.map((ev: any) => (
                    <EventPill key={ev.id} event={ev} onClick={onEventClick} />
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Day View ─────────────────────────────────────────────────────────────────
function DayView({ current, events, onEventClick }: any) {
  const isToday = dayjs(current).isSame(dayjs(), "day");

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3 border-b-2 border-slate-200">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${isToday ? "bg-indigo-500 text-white" : "bg-slate-100 text-slate-800"
            }`}
        >
          {dayjs(current).date()}
        </div>
        <div>
          <div className="font-bold text-base text-slate-900">
            {capitalize(dayjs(current).format("dddd"))}
          </div>
          <div className="text-sm text-slate-400">
            {capitalize(dayjs(current).format("MMMM [de] YYYY"))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {HOURS.map((hour) => {
          const hourEvents = getEventsForHour(events, current, hour);
          return (
            <div key={hour} className="flex border-b border-slate-100 min-h-[64px]">
              <div className="w-16 shrink-0 text-xs text-slate-400 font-semibold text-right pr-3 pt-1.5 border-r border-slate-200">
                {`${String(hour).padStart(2, "0")}:00`}
              </div>
              <div className="flex-1 px-3 py-1 space-y-1">
                {hourEvents.map((ev: any) => (
                  <div
                    key={ev.id}
                    onClick={() => onEventClick(ev)}
                    className="rounded-lg px-3 py-2 cursor-pointer text-white"
                    style={{ background: ev.color }}
                  >
                    <div className="font-bold text-sm">{ev.title}</div>
                    <div className="text-xs opacity-90">
                      {ev.nomeCliente} · {dayjs(ev.start).format("HH:mm")} – {dayjs(ev.end).format("HH:mm")}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Agenda View ──────────────────────────────────────────────────────────────
function AgendaView({ current, events, onEventClick }: any) {
  const start = dayjs(current).startOf("month");
  const end = dayjs(current).endOf("month");

  const filtered = events
    .filter((e: any) => {
      const s = dayjs(e.start);
      return s.isAfter(start.subtract(1, "day")) && s.isBefore(end.add(1, "day"));
    })
    .sort((a: any, b: any) => dayjs(a.start).diff(dayjs(b.start)));

  const grouped = {} as any;
  filtered.forEach((ev: any) => {
    const key = dayjs(ev.start).format("YYYY-MM-DD");
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(ev);
  });

  if (Object.keys(grouped).length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
        Nenhum evento este mês.
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-7">
      {Object.entries(grouped).map(([dateKey, dayEvents]: any[]) => (
        <div key={dateKey}>
          <div className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-2.5">
            {capitalize(dayjs(dateKey).format("dddd, D [de] MMMM"))}
          </div>
          <div className="space-y-2.5">
            {dayEvents.map((ev: any) => (
              <div
                key={ev.id}
                onClick={() => onEventClick(ev)}
                className="flex gap-3 cursor-pointer group"
              >
                <div className="w-1 rounded-full shrink-0" style={{ background: ev.color }} />
                <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 group-hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-center">
                    <div className="font-bold text-slate-900 text-sm">{ev.title}</div>
                    <div className="text-xs text-slate-400 font-semibold">
                      {dayjs(ev.start).format("HH:mm")} – {dayjs(ev.end).format("HH:mm")}
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    👤 {ev.nomeCliente}
                    {ev.telefone && <span> · 📞 {ev.telefone}</span>}
                  </div>
                  <div className="mt-2">
                    <span
                      className="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
                      style={{ background: `${ev.color}22`, color: ev.color }}
                    >
                      {ev.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function CalendarComponent() {
  const [current, setCurrent] = useState(dayjs());
  const [view, setView] = useState("month");
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    fetch("/api/schedule", { headers: { "Content-type": "application/json" } })
      .then((r) => r.json())
      .then((data) => {
        const formatted = (data ?? []).map((e: any) => ({
          ...e,
          start: new Date(e.start),
          end: new Date(e.end),
        }));
        setEvents(formatted);
      })
      .catch(console.error);
  }, []);

  function navigate(dir: any) {
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

  const viewLabels = { month: "Mês", week: "Semana", day: "Dia", agenda: "Agenda" } as any;

  return (
    <div className="font-sans h-screen flex flex-col bg-slate-100 text-slate-900">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-3.5 bg-white border-b border-slate-200 shadow-sm flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrent(dayjs())}
            className="px-3 py-1.5 text-sm font-semibold bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Hoje
          </button>
          <button
            onClick={() => navigate("prev")}
            className="px-2 py-1 text-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            ‹
          </button>
          <button
            onClick={() => navigate("next")}
            className="px-2 py-1 text-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            ›
          </button>
          <span className="text-base font-bold text-slate-800 ml-1">{headerLabel()}</span>
        </div>

        <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
          {VIEWS.map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-all font-semibold ${view === v
                ? "bg-indigo-500 text-white shadow-md"
                : "text-slate-500 hover:text-slate-800"
                }`}
            >
              {viewLabels[v]}
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
            onDayClick={(day: any) => { setCurrent(day); setView("day"); }}
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

      <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </div>
  );
}