"use client";

import { Calendar, dayjsLocalizer, View } from "react-big-calendar";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./calendar-theme.css";

import { useState } from "react";


dayjs.locale("pt-br");


const localizer = dayjsLocalizer(dayjs);

type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description: string;
  clientId: string;
  status: "confirmado" | "pendente";
  color: string
};


const events: CalendarEvent[] = [
  {
    id: "1",
    title: "Reunião Cliente",
    start: new Date(2026, 1, 19, 14, 0),
    end: new Date(2026, 1, 19, 15, 0),
    description: "Discussão sobre contrato",
    clientId: "abc123",
    status: "confirmado",
    color: "#34d399", // verde
  },
];

export default function CalendarComponent() {

  const [view, setView] = useState<View>("month");

  return (
    <div className="h-[80vh] bg-white p-6 rounded-xl shadow-sm">
      <Calendar
        localizer={localizer}
        events={events}
        view={view}
        onView={(v) => setView(v)}
        onSelectEvent={() => setView("agenda")}
        messages={{
          today: "Hoje",
          previous: "Anterior",
          next: "Próximo",
          month: "Mês",
          week: "Semana",
          day: "Dia",
          agenda: "Agenda",
          date: "Data",
          time: "Hora",
          event: "Evento",
          noEventsInRange: "Nenhum evento neste período"
        }}
        dayPropGetter={(date) => {
          const day = dayjs(date).day(); // 0 = domingo | 6 = sábado

          if (day === 0 || day === 6) {
            return {
              style: {
                backgroundColor: "#f8fafc", // leve cinza
              },
            };
          }

          return {};
        }}
        formats={{
          monthHeaderFormat: (date) =>
            dayjs(date)
              .format("MMMM")
              .replace(/^\w/, (c) => c.toUpperCase()),

          weekdayFormat: (date) =>
            dayjs(date)
              .format("ddd")
              .replace(/^\w/, (c) => c.toUpperCase()),

          dayHeaderFormat: (date) =>
            dayjs(date)
              .format("dddd, DD [de] MMMM")
              .replace(/^\w/, (c) => c.toUpperCase()),

          dayFormat: (date) =>
            dayjs(date)
              .format("ddd")
              .replace(/^\w/, (c) => c.toUpperCase()),
        }}
        eventPropGetter={(event) => {
          return {
            style: {
              backgroundColor: event.color,
              borderRadius: "6px",
              border: "none",
              color: "white",
            },
          }
        }}
        startAccessor="start"
        endAccessor="end"
      />
    </div>
  );
}