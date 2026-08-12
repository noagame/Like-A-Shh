"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type WeeklySignup = { week: string; total: number };
type TopEvento = { title: string; total_registered: number };
type TopAccion = { action: string; total: number };

function formatWeek(iso: string) {
  return new Date(iso).toLocaleDateString("es-CL", { day: "2-digit", month: "short" });
}

export default function DashboardCharts({
  weeklySignups,
  topEventos,
  topAcciones,
}: {
  weeklySignups: WeeklySignup[];
  topEventos: TopEvento[];
  topAcciones: TopAccion[];
}) {
  const signupsData = weeklySignups.map((row) => ({
    semana: formatWeek(row.week),
    usuarios: row.total,
  }));

  const eventosData = topEventos.map((row) => ({
    evento: row.title.length > 18 ? row.title.slice(0, 18) + "…" : row.title,
    inscritos: row.total_registered,
  }));

  const accionesData = topAcciones.map((row) => ({
    accion: row.action,
    total: row.total,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white/5 border border-white/10 rounded-lg p-5 min-h-[320px]">
        <h2 className="text-sm text-white/60 mb-4">Usuarios nuevos por semana</h2>
        {signupsData.length === 0 ? (
          <p className="text-white/40 text-sm">Todavía no hay suficientes datos.</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={signupsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" />
              <XAxis dataKey="semana" stroke="#ffffff60" fontSize={12} />
              <YAxis stroke="#ffffff60" fontSize={12} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: "#111", border: "1px solid #ffffff20" }}
                labelStyle={{ color: "#fff" }}
              />
              <Line type="monotone" dataKey="usuarios" stroke="#D4AF37" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="bg-white/5 border border-white/10 rounded-lg p-5 min-h-[320px]">
        <h2 className="text-sm text-white/60 mb-4">Clases con más inscritos</h2>
        {eventosData.length === 0 ? (
          <p className="text-white/40 text-sm">Todavía no hay inscripciones registradas.</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={eventosData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" />
              <XAxis dataKey="evento" stroke="#ffffff60" fontSize={11} />
              <YAxis stroke="#ffffff60" fontSize={12} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: "#111", border: "1px solid #ffffff20" }}
                labelStyle={{ color: "#fff" }}
              />
              <Bar dataKey="inscritos" fill="#D4AF37" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="bg-white/5 border border-white/10 rounded-lg p-5 lg:col-span-2 min-h-[320px]">
        <h2 className="text-sm text-white/60 mb-4">Interacciones más frecuentes (últimos 30 días)</h2>
        {accionesData.length === 0 ? (
          <p className="text-white/40 text-sm">
            Todavía no hay datos de interacción — revisa que el tracking (Fase 5) esté instrumentado en los botones.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={accionesData} layout="vertical" margin={{ left: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" />
              <XAxis type="number" stroke="#ffffff60" fontSize={12} allowDecimals={false} />
              <YAxis type="category" dataKey="accion" stroke="#ffffff60" fontSize={11} width={140} />
              <Tooltip
                contentStyle={{ background: "#111", border: "1px solid #ffffff20" }}
                labelStyle={{ color: "#fff" }}
              />
              <Bar dataKey="total" fill="#D4AF37" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}