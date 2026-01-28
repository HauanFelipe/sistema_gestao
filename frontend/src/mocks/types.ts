export type CompanyStatus = "Ativa" | "Inativa";

export type Company = {
  id: string;
  name: string;
  cnpj?: string;
  contact?: string;
  phone?: string;
  generatesFiscalFiles?: boolean;
  generatesFiscalProduction?: boolean;
  tipoContribuinte?: string;
  ie?: string;
  razaoSocial?: string;
  cep?: string;
  rua?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  nomeFantasia?: string;
  email?: string;
  contabilidadeNome?: string;
  contabilidadeEmail?: string;
  contabilidadeTelefone?: string;
  status: CompanyStatus;
};

export type WorkOrderStatus =
  | "Aberta"
  | "Em andamento"
  | "Concluida"
  | "Nao realizada"
  | "Reagendada"
  | "Cancelada";

export type WorkOrderPriority = "Baixa" | "Media" | "Alta";

export type WorkOrderHistory = {
  id: string;
  title: string;
  description?: string;
  at: string;
};

export type WorkOrder = {
  id: string;
  number: string;
  companyId: string;
  companyName: string;
  type: string;
  responsible: string;
  dueDate: string;
  priority: WorkOrderPriority;
  status: WorkOrderStatus;
  description?: string;
  createdAt: string;
  history: WorkOrderHistory[];
};

export type FiscalFile = {
  id: string;
  companyId: string;
  companyName: string;
  responsible: string;
  observation?: string;
  dayOfMonth: number;
  nextGeneration: string;
  active: boolean;
};

export type FiscalFileRun = {
  id: string;
  companyId: string;
  companyName: string;
  competence: string;
  generatedAt: string;
  generatedBy: string;
  notes?: string;
  status: "Gerado" | "Falhou";
};

export type CalendarEventType = "Visita" | "Treinamento";

export type CalendarEvent = {
  id: string;
  type: CalendarEventType;
  companyId: string;
  companyName: string;
  date: string;
  time: string;
  location: string;
  responsible: string;
  notes?: string;
};

export type FiscalBatchType = "Entrada" | "Saida";

export type FiscalBatch = {
  id: string;
  companyId: string;
  companyName: string;
  competence: string;
  type: FiscalBatchType;
  quantity: number;
  notes?: string;
  launchDone?: boolean;
  billingDone?: boolean;
  createdBy?: string;
  createdAt: string;
};

export type FiscalSummaryRow = {
  companyId: string;
  companyName: string;
  entrada: number;
  saida: number;
  total: number;
};
