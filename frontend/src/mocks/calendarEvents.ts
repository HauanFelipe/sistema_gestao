import type { CalendarEvent } from "./types";

const today = new Date();
const pad = (value: number) => value.toString().padStart(2, "0");
const dateKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const initialCalendarEvents: CalendarEvent[] = [
  {
    id: "ev1",
    type: "Visita",
    companyId: "c1",
    companyName: "Tech Solutions",
    date: dateKey(today),
    time: "14:00",
    location: "Sede cliente",
    responsible: "Ana Ribeiro",
    notes: "Validar novas regras de operacao.",
  },
  {
    id: "ev2",
    type: "Treinamento",
    companyId: "c2",
    companyName: "Empresa ABC",
    date: dateKey(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3)),
    time: "09:00",
    location: "Online",
    responsible: "Paulo Mendes",
    notes: "Treinamento da equipe fiscal.",
  },
  {
    id: "ev3",
    type: "Visita",
    companyId: "c4",
    companyName: "Digital Corp",
    date: dateKey(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5)),
    time: "10:30",
    location: "Filial Centro",
    responsible: "Luciana Pires",
    notes: "Acompanhamento de producao fiscal.",
  },
];
