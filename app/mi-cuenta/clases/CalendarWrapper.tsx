"use client";

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
  onEventClick: (info: any) => void;
};

export default function CalendarWrapper({ events, onEventClick }: CalendarWrapperProps) {
  return (
    <FullCalendar
      plugins={calendarPlugins}
      initialView="dayGridMonth"
      locale="es"
      height="auto"
      events={events}
      eventClick={onEventClick}
    />
  );
}