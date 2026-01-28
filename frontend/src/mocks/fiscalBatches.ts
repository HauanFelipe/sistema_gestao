import type { FiscalBatch } from "./types";

const now = new Date();
const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

export const initialFiscalBatches: FiscalBatch[] = [
  {
    id: "fb1",
    companyId: "c1",
    companyName: "Tech Solutions",
    competence: monthKey,
    type: "Entrada",
    quantity: 38,
    notes: "Notas de entrada do mes.",
    createdBy: "Usuario",
    createdAt: now.toISOString(),
  },
  {
    id: "fb2",
    companyId: "c1",
    companyName: "Tech Solutions",
    competence: monthKey,
    type: "Saida",
    quantity: 24,
    notes: "Notas de saida do mes.",
    createdBy: "Usuario",
    createdAt: now.toISOString(),
  },
  {
    id: "fb3",
    companyId: "c2",
    companyName: "Empresa ABC",
    competence: monthKey,
    type: "Entrada",
    quantity: 15,
    notes: "Importacoes registradas.",
    createdBy: "Usuario",
    createdAt: now.toISOString(),
  },
  {
    id: "fb4",
    companyId: "c2",
    companyName: "Empresa ABC",
    competence: monthKey,
    type: "Saida",
    quantity: 22,
    notes: "Faturamento mensal.",
    createdBy: "Usuario",
    createdAt: now.toISOString(),
  },
];
