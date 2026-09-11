"use client";

import type { EventClickArg } from "@fullcalendar/core";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";

const calendarPlugins = [dayGridPlugin];

// Definimos los props exactos que necesitamos pasarle desde ClasesView
type CalendarWrapperProps = {
  events: Array<{
    id: string;
    title: string;
    start: string;
    end: string;
    backgroundColor: string;
    borderColor: string;
  }>;
  onEventClick: (info: EventClickArg) => void;
};

export default function CalendarWrapper({ events, onEventClick }: CalendarWrapperProps) {
  return (
    <div className="likeashh-calendar">
      <FullCalendar
      plugins={calendarPlugins}
      initialView="dayGridMonth"
      locale="es"
      height="auto"
      firstDay={1}
      fixedWeekCount={false}
      showNonCurrentDates={false}
      dayMaxEventRows={2}
      headerToolbar={{
        left: "title",
        center: "",
        right: "today prev,next",
      }}
      buttonText={{ today: "Hoy" }}
      eventTimeFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }}
      eventDisplay="block"
      events={events}
      eventClick={onEventClick}
      />
    </div>
  );
}
