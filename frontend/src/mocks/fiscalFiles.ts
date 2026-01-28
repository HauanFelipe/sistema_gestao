import type { FiscalFile } from "./types";

export const initialFiscalFiles: FiscalFile[] = [
  {
    id: "ff1",
    companyId: "c1",
    companyName: "Tech Solutions",
    responsible: "Rafael Souza",
    dayOfMonth: 10,
    nextGeneration: "2026-02-10",
    active: true,
  },
  {
    id: "ff2",
    companyId: "c2",
    companyName: "Empresa ABC",
    responsible: "Marina Silva",
    dayOfMonth: 20,
    nextGeneration: "2026-02-20",
    active: true,
  },
  {
    id: "ff3",
    companyId: "c3",
    companyName: "Contabilidade XYZ",
    responsible: "Guilherme Dias",
    dayOfMonth: 15,
    nextGeneration: "2026-02-15",
    active: false,
  },
  {
    id: "ff4",
    companyId: "c5",
    companyName: "Prime Contabilidade",
    responsible: "",
    dayOfMonth: 1,
    nextGeneration: "2026-01-01",
    active: true,
  },
];
