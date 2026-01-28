import { useEffect, useMemo, useState } from "react";
import StatCard from "../shared/StatCard";
import { Calendar, ClipboardList, AlertCircle, Activity } from "lucide-react";
import { listCalendarEvents, listSystemLogs, listWorkOrders, runMonthlyJobs } from "../api";
import type { CalendarEvent, WorkOrder } from "../mocks/types";
import type { SystemLog } from "../api";

type RecentActivity = {
  id: string;
  dotClass: string;
  title: string;
  time: string;
};

type NextEvent = {
  id: string;
  tag: "Visita" | "Treinamento";
  company: string;
  responsible: string;
  when: string;
};

const tagStyle = (tag: NextEvent["tag"]) =>
  tag === "Visita"
    ? "bg-green-500/15 text-green-400 border-green-500/20"
    : "bg-blue-500/15 text-blue-400 border-blue-500/20";

export default function Dashboard() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);

  useEffect(() => {
    listWorkOrders().then(setWorkOrders).catch(() => setWorkOrders([]));
    listCalendarEvents().then(setEvents).catch(() => setEvents([]));
    listSystemLogs().then(setSystemLogs).catch(() => setSystemLogs([]));
  }, []);

  const handleRunMonthly = async () => {
    try {
      await runMonthlyJobs();
      const logs = await listSystemLogs();
      setSystemLogs(logs);
    } catch {
      alert("Nao foi possivel gerar os chamados do mes.");
    }
  };

  const now = new Date();
  const todayKey = toDateKey(now);

  const osHoje = useMemo(
    () => workOrders.filter((order) => toDateKey(new Date(order.dueDate)) === todayKey).length,
    [workOrders, todayKey]
  );
  const osAtrasadas = useMemo(
    () =>
      workOrders.filter((order) => {
        const due = new Date(order.dueDate);
        return due < startOfDay(now) && !["Concluida", "Cancelada"].includes(order.status);
      }).length,
    [workOrders, now]
  );
  const proximosEventos = useMemo(
    () =>
      events.filter((event) => {
        const eventDate = parseEventDate(event);
        return eventDate >= now;
      }).length,
    [events, now]
  );
  const atividadesHoje = useMemo(() => {
    const eventsToday = events.filter((event) => event.date === todayKey).length;
    const ordersToday = workOrders.filter((order) => toDateKey(new Date(order.createdAt)) === todayKey)
      .length;
    return eventsToday + ordersToday;
  }, [events, workOrders, todayKey]);

  const recentActivities = useMemo<RecentActivity[]>(() => {
    const items: { id: string; title: string; at: Date; dotClass: string }[] = [];
    workOrders.forEach((order) => {
      items.push({
        id: `wo-${order.id}`,
        title: `OS #${order.number} criada - ${order.companyName}`,
        at: new Date(order.createdAt),
        dotClass: "bg-blue-500",
      });
    });
    events.forEach((event) => {
      items.push({
        id: `ev-${event.id}`,
        title: `${event.type} agendada - ${event.companyName}`,
        at: parseEventDate(event),
        dotClass: event.type === "Visita" ? "bg-green-500" : "bg-blue-500",
      });
    });
    return items
      .sort((a, b) => b.at.getTime() - a.at.getTime())
      .slice(0, 4)
      .map((item) => ({
        id: item.id,
        title: item.title,
        time: timeAgo(item.at, now),
        dotClass: item.dotClass,
      }));
  }, [events, workOrders, now]);

  const nextEvents = useMemo<NextEvent[]>(() => {
    return events
      .map((event) => {
        const whenDate = parseEventDate(event);
        return {
          id: event.id,
          tag: event.type,
          company: event.companyName,
          responsible: event.responsible,
          when: formatWhenLabel(whenDate),
          whenDate,
        };
      })
      .filter((event) => event.whenDate >= now)
      .sort((a, b) => a.whenDate.getTime() - b.whenDate.getTime())
      .slice(0, 3)
      .map(({ whenDate, ...rest }) => rest);
  }, [events, now]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="OS de Hoje" value={osHoje} icon={<ClipboardList size={20} />} />
        <StatCard title="OS Atrasadas" value={osAtrasadas} icon={<AlertCircle size={20} />} />
        <StatCard title="Proximos Eventos" value={proximosEventos} icon={<Calendar size={20} />} />
        <StatCard title="Atividades Hoje" value={atividadesHoje} icon={<Activity size={20} />} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-gray-200 dark:border-slate-900 bg-white/70 dark:bg-slate-950/60 backdrop-blur p-5">
          <h2 className="text-lg font-semibold mb-4">Atividades Recentes</h2>

          <div className="space-y-4">
            {recentActivities.length === 0 && (
              <div className="text-sm text-gray-500 dark:text-slate-400">Sem atividades recentes.</div>
            )}
            {recentActivities.map((a) => (
              <div key={a.id} className="flex items-start gap-3">
                <div className={`mt-2 h-2.5 w-2.5 rounded-full ${a.dotClass}`} />
                <div className="flex-1">
                  <div className="text-sm">{a.title}</div>
                  <div className="text-xs text-gray-500 dark:text-slate-400 mt-1">{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 dark:border-slate-900 bg-white/70 dark:bg-slate-950/60 backdrop-blur p-5">
          <h2 className="text-lg font-semibold mb-4">Proximos Eventos</h2>

          <div className="space-y-3">
            {nextEvents.length === 0 && (
              <div className="text-sm text-gray-500 dark:text-slate-400">Sem eventos futuros.</div>
            )}
            {nextEvents.map((e) => (
              <div
                key={e.id}
                className="rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className={`text-xs px-2 py-1 rounded-lg border ${tagStyle(e.tag)}`}>{e.tag}</span>
                  <span className="text-xs text-gray-500 dark:text-slate-400">{e.when}</span>
                </div>

                <div className="mt-3 font-semibold">{e.company}</div>
                <div className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                  Responsavel: {e.responsible}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 dark:border-slate-900 bg-white/70 dark:bg-slate-950/60 backdrop-blur p-5">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="text-lg font-semibold">Logs do Sistema</h2>
          <button
            className="rounded-xl border border-gray-200 dark:border-slate-800 px-3 py-2 text-xs font-semibold hover:bg-gray-100 dark:hover:bg-slate-800"
            onClick={handleRunMonthly}
          >
            Gerar agora
          </button>
        </div>
        {systemLogs.length === 0 ? (
          <div className="text-sm text-gray-500 dark:text-slate-400">Sem logs recentes.</div>
        ) : (
          <div className="space-y-3">
            {systemLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-3">
                <div className="mt-1.5 h-2.5 w-2.5 rounded-full bg-blue-500" />
                <div className="flex-1">
                  <div className="text-sm">{log.message}</div>
                  <div className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                    {new Date(log.createdAt).toLocaleString("pt-BR")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseEventDate(event: CalendarEvent) {
  const time = event.time ? `${event.time}:00` : "00:00:00";
  return new Date(`${event.date}T${time}`);
}

function timeAgo(date: Date, now: Date) {
  const diff = Math.max(0, now.getTime() - date.getTime());
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "agora";
  if (minutes < 60) return `${minutes}min atras`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h atras`;
  const days = Math.floor(hours / 24);
  return `${days}d atras`;
}

function formatWhenLabel(date: Date) {
  const today = startOfDay(new Date());
  const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  if (date >= today && date < new Date(today.getTime() + 86400000)) {
    return `Hoje - ${date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
  }
  if (date >= tomorrow && date < new Date(tomorrow.getTime() + 86400000)) {
    return `Amanha - ${date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
  }
  return `${date.toLocaleDateString("pt-BR")} - ${date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}
