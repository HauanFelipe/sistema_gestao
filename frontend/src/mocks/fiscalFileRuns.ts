import type { FiscalFileRun } from "./types";

export const initialFiscalFileRuns: FiscalFileRun[] = [
  {
    id: "fr1",
    companyId: "c1",
    companyName: "Tech Solutions",
    competence: "2026-01",
    generatedAt: "2026-01-10T09:15:00.000Z",
    generatedBy: "Usuario",
    status: "Gerado",
  },
  {
    id: "fr2",
    companyId: "c2",
    companyName: "Empresa ABC",
    competence: "2026-01",
    generatedAt: "2026-01-20T10:05:00.000Z",
    generatedBy: "Usuario",
    status: "Gerado",
  },
  {
    id: "fr3",
    companyId: "c3",
    companyName: "Contabilidade XYZ",
    competence: "2025-12",
    generatedAt: "2025-12-15T08:45:00.000Z",
    generatedBy: "Usuario",
    status: "Falhou",
  },
];
