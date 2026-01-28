import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import Badge from "../shared/Badge";
import Modal from "../shared/Modal";
import {
  createCalendarEvent,
  deleteCalendarEvent,
  listCalendarEvents,
  listCompanies,
  listUsers,
  updateCalendarEvent,
} from "../api";
import type { SystemUser } from "../api";
import type { CalendarEvent, CalendarEventType, Company } from "../mocks/types";

type EventForm = {
  type: CalendarEventType | "";
  companyId: string;
  date: string;
  time: string;
  location: string;
  responsible: string;
  notes: string;
};

const dayLabels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

export default function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [filterType, setFilterType] = useState<CalendarEventType | "">("");
  const [selected, setSelected] = useState<CalendarEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dayModalDate, setDayModalDate] = useState<string | null>(null);
  const [companyQuery, setCompanyQuery] = useState("");
  const [form, setForm] = useState<EventForm>({
    type: "",
    companyId: "",
    date: "",
    time: "",
    location: "",
    responsible: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof EventForm, string>>>({});

  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<SystemUser[]>([]);
  const companyDatalistId = "company-options-calendar";
  const responsibleDatalistId = "responsible-options-calendar";

  useEffect(() => {
    listCompanies().then(setCompanies).catch(() => setCompanies([]));
    listUsers().then(setUsers).catch(() => setUsers([]));
    listCalendarEvents().then(setEvents).catch(() => setEvents([]));
  }, []);

  const refresh = () => listCalendarEvents().then(setEvents).catch(() => setEvents([]));

  const resolveCompany = (value: string) => {
    const normalized = value.trim().toLowerCase();
    if (!normalized) return undefined;
    const exact = companies.find((company) => company.name.toLowerCase() === normalized);
    if (exact) return exact;
    const matches = companies.filter((company) => company.name.toLowerCase().includes(normalized));
    return matches.length === 1 ? matches[0] : undefined;
  };

  const monthKey = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}`;
  const visibleEvents = useMemo(() => {
    const filtered = filterType ? events.filter((event) => event.type === filterType) : events;
    return filtered.filter((event) => event.date.startsWith(monthKey));
  }, [events, filterType, monthKey]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    visibleEvents.forEach((event) => {
      const list = map.get(event.date) ?? [];
      list.push(event);
      map.set(event.date, list);
    });
    return map;
  }, [visibleEvents]);

  const days = useMemo(() => buildCalendarDays(currentMonth), [currentMonth]);

  const openNew = () => {
    setSelected(null);
    setCompanyQuery("");
    setForm({
      type: "",
      companyId: "",
      date: "",
      time: "",
      location: "",
      responsible: "",
      notes: "",
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const openNewForDate = (date: string) => {
    setSelected(null);
    setCompanyQuery("");
    setForm({
      type: "",
      companyId: "",
      date,
      time: "",
      location: "",
      responsible: "",
      notes: "",
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const openEdit = (event: CalendarEvent) => {
    setSelected(event);
    setDayModalDate(null);
    const selectedCompany = companies.find((company) => company.id === event.companyId);
    setCompanyQuery(selectedCompany?.name ?? "");
    setForm({
      type: event.type,
      companyId: event.companyId,
      date: event.date,
      time: event.time,
      location: event.location,
      responsible: event.responsible,
      notes: event.notes ?? "",
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const openDayModal = (date: string) => {
    setDayModalDate(date);
  };

  const validate = () => {
    const nextErrors: Partial<Record<keyof EventForm, string>> = {};
    if (!form.type) nextErrors.type = "Campo obrigatorio.";
    if (!form.companyId) nextErrors.companyId = "Campo obrigatorio.";
    if (!form.date) nextErrors.date = "Campo obrigatorio.";
    if (!form.time) nextErrors.time = "Campo obrigatorio.";
    if (!form.location.trim()) nextErrors.location = "Campo obrigatorio.";
    if (!form.responsible.trim()) nextErrors.responsible = "Campo obrigatorio.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const saveEvent = async () => {
    if (!validate()) return;
    if (selected) {
      await updateCalendarEvent(selected.id, {
        type: form.type as CalendarEventType,
        companyId: form.companyId,
        date: form.date,
        time: form.time,
        location: form.location,
        responsible: form.responsible,
        notes: form.notes,
      });
    } else {
      await createCalendarEvent({
        type: form.type as CalendarEventType,
        companyId: form.companyId,
        date: form.date,
        time: form.time,
        location: form.location,
        responsible: form.responsible,
        notes: form.notes,
      });
    }
    refresh();
    closeModal();
  };

  const removeEvent = async () => {
    if (!selected) return;
    await deleteCalendarEvent(selected.id);
    refresh();
    closeModal();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Calendario</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Visualize visitas e treinamentos por mes.
          </p>
        </div>
        <button
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 text-white px-4 py-3 font-semibold hover:bg-blue-700"
          onClick={openNew}
        >
          <Plus size={18} />
          Novo Evento
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
        <div className="flex items-center gap-2">
          <button
            className="h-10 w-10 rounded-xl border border-gray-200 dark:border-slate-800 flex items-center justify-center"
            onClick={() => setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
          >
            <ChevronLeft size={18} />
          </button>
          <div className="text-lg font-semibold">
            {currentMonth.toLocaleString("pt-BR", { month: "long", year: "numeric" })}
          </div>
          <button
            className="h-10 w-10 rounded-xl border border-gray-200 dark:border-slate-800 flex items-center justify-center"
            onClick={() => setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterType}
            onChange={(event) => setFilterType(event.target.value as CalendarEventType | "")}
            className="rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 text-sm"
          >
            <option value="">Todos os tipos</option>
            <option value="Visita">Visita</option>
            <option value="Treinamento">Treinamento</option>
          </select>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 dark:border-slate-900 bg-white/70 dark:bg-slate-950/60 backdrop-blur p-4">
        <div className="grid grid-cols-7 gap-2 text-xs text-gray-500 dark:text-slate-400">
          {dayLabels.map((day) => (
            <div key={day} className="text-center">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2 mt-2">
          {days.map((day) => {
            const dayEvents = eventsByDate.get(day.dateKey) ?? [];
            const visibleEvents = dayEvents.slice(0, 2);
            const remaining = dayEvents.length - visibleEvents.length;
            return (
              <div
                key={day.key}
                className={`min-h-[110px] rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-2 ${
                  day.inMonth ? "" : "opacity-40"
                }`}
                onClick={() => {
                  if (!day.inMonth) return;
                  openDayModal(day.dateKey);
                }}
                onDoubleClick={() => {
                  if (!day.inMonth) return;
                  openNewForDate(day.dateKey);
                }}
              >
              <div className="text-xs font-semibold">{day.label}</div>
                <div className="mt-2 space-y-2">
                  {visibleEvents.map((event) => (
                    <button
                      key={event.id}
                      className="w-full text-left"
                      onClick={(eventClick) => {
                        eventClick.stopPropagation();
                        openEdit(event);
                      }}
                    >
                      <div className="rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 px-2 py-1 text-[11px]">
                        <div className="flex items-center justify-between gap-2">
                          <Badge
                            label={event.type}
                            tone={event.type === "Visita" ? "green" : "blue"}
                            className="text-[10px] truncate"
                          />
                          <span className="text-[10px] text-gray-500 dark:text-slate-400 whitespace-nowrap">
                            {event.time}
                          </span>
                        </div>
                        <div className="mt-1 font-semibold truncate">{event.companyName}</div>
                      </div>
                    </button>
                  ))}
                  {remaining > 0 && (
                    <button
                      className="w-full text-left text-[11px] text-blue-500 hover:text-blue-600"
                      onClick={(eventClick) => {
                        eventClick.stopPropagation();
                        openDayModal(day.dateKey);
                      }}
                    >
                      +{remaining} atendimento(s)
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        title={selected ? "Editar evento" : "Novo evento"}
        onClose={closeModal}
        footer={
          <>
            {selected && (
              <button
                className="mr-auto inline-flex items-center gap-2 rounded-xl border border-red-500/30 text-red-500 px-4 py-2"
                onClick={removeEvent}
              >
                <Trash2 size={16} />
                Remover
              </button>
            )}
            <button
              className="rounded-xl border border-gray-200 dark:border-slate-800 px-4 py-2"
              onClick={closeModal}
            >
              Cancelar
            </button>
            <button className="rounded-xl bg-blue-600 text-white px-4 py-2 font-semibold" onClick={saveEvent}>
              Salvar
            </button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Tipo *" error={errors.type}>
            <select
              value={form.type}
              onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value as CalendarEventType }))}
              className={inputClass(!!errors.type)}
            >
              <option value="">Selecione...</option>
              <option value="Visita">Visita</option>
              <option value="Treinamento">Treinamento</option>
            </select>
          </Field>
          <Field label="Empresa *" error={errors.companyId}>
            <input
              list={companyDatalistId}
              value={companyQuery}
              onChange={(event) => {
                const value = event.target.value;
                setCompanyQuery(value);
                const match = companies.find(
                  (company) => company.name.toLowerCase() === value.trim().toLowerCase()
                );
                setForm((prev) => ({ ...prev, companyId: match ? match.id : "" }));
              }}
              onBlur={() => {
                const resolved = resolveCompany(companyQuery);
                setForm((prev) => ({ ...prev, companyId: resolved ? resolved.id : "" }));
                if (resolved) setCompanyQuery(resolved.name);
              }}
              className={inputClass(!!errors.companyId)}
              placeholder="Digite o nome da empresa..."
            />
            <datalist id={companyDatalistId}>
              {companies.map((company: Company) => (
                <option key={company.id} value={company.name} />
              ))}
            </datalist>
          </Field>
          <Field label="Data *" error={errors.date}>
            <input
              type="date"
              value={form.date}
              onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
              className={inputClass(!!errors.date)}
            />
          </Field>
          <Field label="Hora *" error={errors.time}>
            <input
              type="time"
              value={form.time}
              onChange={(event) => setForm((prev) => ({ ...prev, time: event.target.value }))}
              className={inputClass(!!errors.time)}
            />
          </Field>
          <Field label="Local *" error={errors.location}>
            <input
              value={form.location}
              onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))}
              className={inputClass(!!errors.location)}
            />
          </Field>
          <Field label="Responsavel *" error={errors.responsible}>
            <input
              list={responsibleDatalistId}
              value={form.responsible}
              onChange={(event) => setForm((prev) => ({ ...prev, responsible: event.target.value }))}
              className={inputClass(!!errors.responsible)}
            />
            <datalist id={responsibleDatalistId}>
              {users
                .filter((user) => user.active !== false)
                .map((user) => (
                  <option key={user.id} value={user.name} />
                ))}
            </datalist>
          </Field>
        </div>
        <Field label="Observacoes">
          <textarea
            value={form.notes}
            onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
            className={`${inputClass(false)} min-h-[90px]`}
          />
        </Field>
      </Modal>

      <Modal
        isOpen={!!dayModalDate}
        title={dayModalDate ? `Eventos - ${formatDateLabel(dayModalDate)}` : "Eventos"}
        onClose={() => setDayModalDate(null)}
        footer={
          <>
            <button
              className="rounded-xl border border-gray-200 dark:border-slate-800 px-4 py-2"
              onClick={() => setDayModalDate(null)}
            >
              Fechar
            </button>
            <button
              className="rounded-xl bg-blue-600 text-white px-4 py-2 font-semibold"
              onClick={() => {
                if (!dayModalDate) return;
                setDayModalDate(null);
                openNewForDate(dayModalDate);
              }}
            >
              Adicionar evento
            </button>
          </>
        }
      >
        <div className="space-y-3">
          {(dayModalDate ? eventsByDate.get(dayModalDate) ?? [] : [])
            .slice()
            .sort((a, b) => a.time.localeCompare(b.time))
            .map((event) => (
              <button
                key={event.id}
                className="w-full text-left rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 px-3 py-2"
                onClick={() => openEdit(event)}
              >
                <div className="flex items-center justify-between gap-2">
                  <Badge
                    label={event.type}
                    tone={event.type === "Visita" ? "green" : "blue"}
                    className="text-[10px]"
                  />
                  <span className="text-xs text-gray-500 dark:text-slate-400">{event.time}</span>
                </div>
                <div className="mt-1 text-sm font-semibold">{event.companyName}</div>
                <div className="text-xs text-gray-500 dark:text-slate-400">
                  {event.location} · {event.responsible}
                </div>
              </button>
            ))}
          {dayModalDate && (eventsByDate.get(dayModalDate) ?? []).length === 0 && (
            <div className="text-sm text-gray-500 dark:text-slate-400">
              Nenhum evento neste dia.
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

function buildCalendarDays(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const startWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = 42;
  const days: { key: string; label: string; inMonth: boolean; dateKey: string }[] = [];

  for (let i = 0; i < totalCells; i += 1) {
    const dayNumber = i - startWeekday + 1;
    const inMonth = dayNumber >= 1 && dayNumber <= daysInMonth;
    const dayDate = new Date(year, month, dayNumber);
    const dateKey = `${dayDate.getFullYear()}-${String(dayDate.getMonth() + 1).padStart(2, "0")}-${String(
      dayDate.getDate()
    ).padStart(2, "0")}`;
    days.push({
      key: `${dateKey}-${i}`,
      label: inMonth ? String(dayNumber) : "",
      inMonth,
      dateKey,
    });
  }
  return days;
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="text-sm">{label}</label>
      <div className="mt-1">{children}</div>
      {error && <div className="mt-1 text-xs text-red-500">{error}</div>}
    </div>
  );
}

function inputClass(hasError: boolean) {
  return [
    "w-full rounded-xl border bg-white dark:bg-slate-900 px-4 py-2 outline-none",
    hasError ? "border-red-500" : "border-gray-200 dark:border-slate-800",
  ].join(" ");
}

function formatDateLabel(value: string) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("pt-BR");
}
