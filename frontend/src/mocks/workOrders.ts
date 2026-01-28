import type { WorkOrder } from "./types";

const today = new Date();
const addDays = (days: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

export const initialWorkOrders: WorkOrder[] = [
  {
    id: "wo1",
    number: "1001",
    companyId: "c1",
    companyName: "Tech Solutions",
    type: "Suporte",
    responsible: "Ana Ribeiro",
    dueDate: addDays(2),
    priority: "Alta",
    status: "Em andamento",
    description: "Ajustes no cadastro e revisao de parametros fiscais.",
    createdAt: new Date(today.getTime() - 1000 * 60 * 60 * 24).toISOString(),
    history: [
      {
        id: "h1",
        title: "OS criada",
        description: "Criada via painel de operacoes.",
        at: new Date(today.getTime() - 1000 * 60 * 60 * 24).toISOString(),
      },
      {
        id: "h2",
        title: "Em andamento",
        description: "Equipe iniciou o atendimento.",
        at: new Date(today.getTime() - 1000 * 60 * 60 * 12).toISOString(),
      },
    ],
  },
  {
    id: "wo2",
    number: "1002",
    companyId: "c2",
    companyName: "Empresa ABC",
    type: "Visita",
    responsible: "Paulo Mendes",
    dueDate: addDays(5),
    priority: "Media",
    status: "Aberta",
    description: "Visita tecnica para conferencia de processos.",
    createdAt: new Date(today.getTime() - 1000 * 60 * 60 * 6).toISOString(),
    history: [
      {
        id: "h3",
        title: "OS criada",
        description: "Criada pelo time fiscal.",
        at: new Date(today.getTime() - 1000 * 60 * 60 * 6).toISOString(),
      },
    ],
  },
  {
    id: "wo3",
    number: "1003",
    companyId: "c4",
    companyName: "Digital Corp",
    type: "Treinamento",
    responsible: "Luciana Pires",
    dueDate: addDays(1),
    priority: "Baixa",
    status: "Reagendada",
    description: "Treinamento do modulo de faturamento.",
    createdAt: new Date(today.getTime() - 1000 * 60 * 60 * 48).toISOString(),
    history: [
      {
        id: "h4",
        title: "OS criada",
        description: "Solicitada pelo cliente.",
        at: new Date(today.getTime() - 1000 * 60 * 60 * 48).toISOString(),
      },
      {
        id: "h5",
        title: "Reagendada",
        description: "Reagendada para nova data.",
        at: new Date(today.getTime() - 1000 * 60 * 60 * 30).toISOString(),
      },
    ],
  },
];
