"use client";

import { Calendar, dayjsLocalizer, View, DateRange } from "react-big-calendar";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./calendar-theme.css";

import { EventModal } from "@/components/Modal";
import { useEffect, useState } from "react";
import { pegarTodosEventos } from "@/app/services/user.service";


dayjs.locale("pt-br");


const localizer = dayjsLocalizer(dayjs);

export type CalendarEvent = {
  id: string;
  title: string;
  nomeCliente: string;
  telefone: string;
  start: Date;
  end: Date;
  description?: string;
  color: string;
  status: string;
};

const messages = {
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
};

const formats = {
  dayRangeHeaderFormat: ({ start, end }: any) => {
    const startDate = dayjs(start);
    const endDate = dayjs(end);

    const month = startDate.format("MMMM");
    const capitalizedMonth =
      month.charAt(0).toUpperCase() + month.slice(1);

    return `${capitalizedMonth} ${startDate.format("D")}-${endDate.format("D")}`;
  },
  monthHeaderFormat: (date: Date) =>
    dayjs(date)
      .format("MMMM")
      .replace(/^\w/, (c) => c.toUpperCase()),

  weekdayFormat: (date: Date) =>
    dayjs(date)
      .format("ddd")
      .replace(/^\w/, (c) => c.toUpperCase()),

  dayHeaderFormat: (date: Date) =>
    dayjs(date)
      .format("dddd, DD [de] MMMM")
      .replace(/^\w/, (c) => c.toUpperCase()),

  dayFormat: (date: Date) =>
    dayjs(date)
      .format("ddd")
      .replace(/^\w/, (c) => c.toUpperCase()),
};

export default function CalendarComponent() {

  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [events, setEvents] = useState<CalendarEvent[]>([]);

  function handleOpen(event: CalendarEvent) {
    setSelectedEvent(event);
    setIsModalOpen(true);
  }

  function handleClose() {
    setIsModalOpen(false);
    setSelectedEvent(null);
  }

  async function fetchEvents(): Promise<CalendarEvent[]> {
    try {
      const res = await fetch("/api/schedule", {
        method: "GET",
        headers: { "Content-type": "application/json" },
      });


      if (!res.ok) {
        console.error("Erro ao buscar eventos:", res.statusText);
        return [];
      }

      const data = await res.json();
      console.log("Resposta da API:", data);
      return data ?? [];
    } catch (error) {
      console.error("Erro ao buscar eventos:", error);
      return [];
    }
  }

  useEffect(() => {
    fetchEvents().then(fetchedEvents => {
      console.log("Eventos buscados:", fetchedEvents);
      const formattedEvents = fetchedEvents.map((event) => ({
        id: event.id,
        title: event.title,
        nomeCliente: event.nomeCliente,
        telefone: event.telefone,
        description: event.description ?? undefined,
        status: event.status,
        start: new Date(event.start),
        end: new Date(event.end),
        color: event.color,
      }));
      setEvents(formattedEvents);
    });
  }, []);

  return (
    <div className="h-[80vh] bg-white p-6 rounded-xl shadow-sm">
      <EventModal isOpen={isModalOpen} onClose={handleClose} event={selectedEvent} />
      <Calendar
        localizer={localizer}
        events={events}
        messages={messages}
        formats={formats}
        startAccessor="start"
        endAccessor="end"

        onSelectEvent={(event) => {
          handleOpen(event)
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
      />
    </div>
  );
}