import { apiDelete, apiGet, apiPatch, apiPost } from "./client";
import type {
  CalendarEvent,
  CalendarEventType,
  Company,
  FiscalBatch,
  FiscalBatchType,
  FiscalFile,
  FiscalFileRun,
  WorkOrder,
  WorkOrderHistory,
  WorkOrderPriority,
  WorkOrderStatus,
} from "../mocks/types";

export type SystemUser = {
  id: string;
  name: string;
  role?: string;
  active?: boolean;
};

export type SystemLog = {
  id: string;
  type: string;
  message: string;
  createdAt: string;
};

type ApiCompany = Company;
type ApiWorkOrder = {
  id: string;
  number: string;
  companyId: string;
  type: string;
  responsible: string;
  dueDate: string;
  priority: WorkOrderPriority;
  status: string;
  description?: string;
  createdAt: string;
  company?: { id: string; name: string };
  history?: WorkOrderHistory[];
};

type ApiFiscalFile = {
  id: string;
  companyId: string;
  responsible?: string;
  observation?: string;
  dayOfMonth: number;
  nextGeneration: string;
  active: boolean;
  company?: { id: string; name: string };
};

type ApiFiscalFileRun = {
  id: string;
  companyId: string;
  competence: string;
  generatedAt: string;
  generatedBy: string;
  notes?: string;
  status: "Gerado" | "Falhou";
};

type ApiFiscalBatch = {
  id: string;
  companyId: string;
  competence: string;
  type: FiscalBatchType;
  quantity: number;
  notes?: string;
  launchDone: boolean;
  billingDone: boolean;
  createdBy?: string;
  createdAt: string;
  company?: { id: string; name: string };
};

type ApiCalendarEvent = {
  id: string;
  type: CalendarEventType;
  companyId: string;
  date: string;
  time: string;
  location: string;
  responsible: string;
  notes?: string;
  company?: { id: string; name: string };
};

const fromApiStatus = (value: string): WorkOrderStatus => {
  if (value === "Em_andamento") return "Em andamento";
  if (value === "Nao_realizada") return "Nao realizada";
  return value as WorkOrderStatus;
};

const toApiStatus = (value: WorkOrderStatus) => {
  if (value === "Em andamento") return "Em_andamento";
  if (value === "Nao realizada") return "Nao_realizada";
  return value;
};

const mapWorkOrder = (order: ApiWorkOrder): WorkOrder => ({
  id: order.id,
  number: order.number,
  companyId: order.companyId,
  companyName: order.company?.name ?? "Empresa",
  type: order.type,
  responsible: order.responsible,
  dueDate: order.dueDate,
  priority: order.priority,
  status: fromApiStatus(order.status),
  description: order.description,
  createdAt: order.createdAt,
  history: order.history ?? [],
});

const mapFiscalFile = (file: ApiFiscalFile): FiscalFile => ({
  id: file.id,
  companyId: file.companyId,
  companyName: file.company?.name ?? "Empresa",
  responsible: file.responsible ?? "",
  observation: file.observation,
  dayOfMonth: file.dayOfMonth,
  nextGeneration: file.nextGeneration,
  active: file.active,
});

const mapFiscalFileRun = (run: ApiFiscalFileRun, companyName: string): FiscalFileRun => ({
  id: run.id,
  companyId: run.companyId,
  companyName,
  competence: run.competence,
  generatedAt: run.generatedAt,
  generatedBy: run.generatedBy,
  notes: run.notes,
  status: run.status,
});

const mapFiscalBatch = (batch: ApiFiscalBatch): FiscalBatch => ({
  id: batch.id,
  companyId: batch.companyId,
  companyName: batch.company?.name ?? "Empresa",
  competence: batch.competence,
  type: batch.type,
  quantity: batch.quantity,
  notes: batch.notes,
  launchDone: batch.launchDone,
  billingDone: batch.billingDone,
  createdBy: batch.createdBy,
  createdAt: batch.createdAt,
});

const normalizeDate = (value: string) => (value.includes("T") ? value.split("T")[0] : value);

const mapCalendarEvent = (event: ApiCalendarEvent): CalendarEvent => ({
  id: event.id,
  type: event.type,
  companyId: event.companyId,
  companyName: event.company?.name ?? "Empresa",
  date: normalizeDate(event.date),
  time: event.time,
  location: event.location,
  responsible: event.responsible,
  notes: event.notes,
});

export const listCompanies = async () => apiGet<ApiCompany[]>("/companies");
export const listUsers = async () => apiGet<SystemUser[]>("/users");
export const getCompanyById = async (id: string) => apiGet<ApiCompany>(`/companies/${id}`);
export const createCompany = async (input: Partial<Company>) =>
  apiPost<ApiCompany>("/companies", input);
export const updateCompany = async (id: string, input: Partial<Company>) =>
  apiPatch<ApiCompany>(`/companies/${id}`, input);
export const deleteCompany = async (id: string) => apiDelete<void>(`/companies/${id}`);

export const listWorkOrders = async () =>
  apiGet<ApiWorkOrder[]>("/work-orders").then((rows) => rows.map(mapWorkOrder));
export const getWorkOrderById = async (id: string) =>
  apiGet<ApiWorkOrder>(`/work-orders/${id}`).then(mapWorkOrder);
export const createWorkOrder = async (input: {
  companyId: string;
  type: string;
  responsible: string;
  dueDate: string;
  priority: WorkOrderPriority;
  description?: string;
}) =>
  apiPost<ApiWorkOrder>("/work-orders", {
    ...input,
    status: toApiStatus("Aberta"),
  }).then(mapWorkOrder);
export const updateWorkOrder = async (id: string, input: Partial<WorkOrder>) =>
  apiPatch<ApiWorkOrder>(`/work-orders/${id}`, {
    ...input,
    status: input.status ? toApiStatus(input.status) : undefined,
  }).then(mapWorkOrder);
export const deleteWorkOrder = async (id: string) => apiDelete<void>(`/work-orders/${id}`);
export const addWorkOrderHistory = async (id: string, input: { title: string; description?: string }) =>
  apiPost<WorkOrderHistory>(`/work-orders/${id}/history`, input);

export const listFiscalFiles = async () =>
  apiGet<ApiFiscalFile[]>("/fiscal-files").then((rows) => rows.map(mapFiscalFile));
export const listFiscalFilesPending = async () =>
  apiGet<ApiFiscalFile[]>("/fiscal-files/pending").then((rows) => rows.map(mapFiscalFile));
export const updateFiscalFileConfig = async (id: string, input: { responsible?: string; observation?: string }) =>
  apiPatch<FiscalFile>(`/fiscal-files/${id}`, input);
export const markFiscalFileGenerated = async (
  id: string,
  input: { responsible?: string; notes?: string }
) => apiPost<FiscalFileRun>(`/fiscal-files/${id}/generate`, input);
export const listFiscalFileRuns = async () => apiGet<ApiFiscalFileRun[]>("/fiscal-files/runs");
export const listFiscalFileRunsByCompany = async (companyId: string, competence?: string) => {
  const query = competence ? `?competence=${competence}` : "";
  return apiGet<ApiFiscalFileRun[]>(`/fiscal-files/runs/${companyId}${query}`);
};

export const listFiscalBatches = async (companyId?: string, competence?: string) => {
  const params = new URLSearchParams();
  if (companyId) params.set("companyId", companyId);
  if (competence) params.set("competence", competence);
  const query = params.toString();
  return apiGet<ApiFiscalBatch[]>(`/fiscal-batches${query ? `?${query}` : ""}`).then((rows) =>
    rows.map(mapFiscalBatch)
  );
};
export const createFiscalBatch = async (input: {
  companyId: string;
  competence: string;
  type: FiscalBatchType;
  quantity: number;
  notes?: string;
  launchDone?: boolean;
  billingDone?: boolean;
  createdBy?: string;
}) => apiPost<ApiFiscalBatch>("/fiscal-batches", input).then(mapFiscalBatch);
export const updateFiscalBatch = async (id: string, input: Partial<FiscalBatch>) =>
  apiPatch<ApiFiscalBatch>(`/fiscal-batches/${id}`, input).then(mapFiscalBatch);

export const listCalendarEvents = async (companyId?: string, dateFrom?: string, dateTo?: string) => {
  const params = new URLSearchParams();
  if (companyId) params.set("companyId", companyId);
  if (dateFrom) params.set("dateFrom", dateFrom);
  if (dateTo) params.set("dateTo", dateTo);
  const query = params.toString();
  return apiGet<ApiCalendarEvent[]>(`/calendar${query ? `?${query}` : ""}`).then((rows) =>
    rows.map(mapCalendarEvent)
  );
};
export const createCalendarEvent = async (input: Omit<CalendarEvent, "id" | "companyName">) =>
  apiPost<ApiCalendarEvent>("/calendar", input).then(mapCalendarEvent);
export const updateCalendarEvent = async (
  id: string,
  input: Partial<Omit<CalendarEvent, "id" | "companyName">>
) => apiPatch<ApiCalendarEvent>(`/calendar/${id}`, input).then(mapCalendarEvent);
export const deleteCalendarEvent = async (id: string) => apiDelete<void>(`/calendar/${id}`);

export const listSystemLogs = async (limit = 6) =>
  apiGet<SystemLog[]>(`/system/logs?limit=${limit}`);

export const runMonthlyJobs = async () => apiPost<void>("/system/run-monthly", {});
