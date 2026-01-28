import { initialCalendarEvents } from "./calendarEvents";
import { initialCompanies } from "./companies";
import { initialFiscalBatches } from "./fiscalBatches";
import { initialFiscalFiles } from "./fiscalFiles";
import { initialFiscalFileRuns } from "./fiscalFileRuns";
import { initialWorkOrders } from "./workOrders";
import type {
  CalendarEvent,
  Company,
  FiscalBatch,
  FiscalBatchType,
  FiscalFile,
  FiscalFileRun,
  FiscalSummaryRow,
  WorkOrder,
  WorkOrderHistory,
  WorkOrderPriority,
} from "./types";

type Store = {
  companies: Company[];
  workOrders: WorkOrder[];
  fiscalFiles: FiscalFile[];
  fiscalFileRuns: FiscalFileRun[];
  calendarEvents: CalendarEvent[];
  fiscalBatches: FiscalBatch[];
};

type WorkOrderInput = {
  companyId: string;
  type: string;
  responsible: string;
  priority: WorkOrderPriority;
  dueDate: string;
  description?: string;
};

type CompanyInput = {
  name: string;
  cnpj: string;
  tipoContribuinte: string;
  ie: string;
  razaoSocial: string;
  cep: string;
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  nomeFantasia?: string;
  email?: string;
  phone?: string;
  contact?: string;
  contabilidadeNome?: string;
  contabilidadeEmail?: string;
  contabilidadeTelefone?: string;
  status?: Company["status"];
};

type WorkOrderUpdate = Partial<
  Pick<
    WorkOrder,
    "companyId" | "type" | "responsible" | "priority" | "dueDate" | "description" | "status"
  >
>;

type FiscalFileConfigInput = {
  id?: string;
  companyId: string;
  responsible?: string;
  observation?: string;
  dayOfMonth: number;
  active: boolean;
};

type CalendarEventInput = Omit<CalendarEvent, "id" | "companyName"> & {
  companyId: string;
};

type CalendarEventUpdate = Partial<Omit<CalendarEvent, "id" | "companyName">> & {
  companyId?: string;
};

type FiscalBatchInput = {
  companyId: string;
  competence: string;
  type: FiscalBatchType;
  quantity: number;
  notes?: string;
  launchDone?: boolean;
  billingDone?: boolean;
};

type FiscalBatchUpdate = Partial<Pick<FiscalBatch, "notes" | "quantity" | "launchDone" | "billingDone">>;

const STORAGE_KEY = "sg_mock_store_v1";

const pad = (value: number) => value.toString().padStart(2, "0");

const makeId = (prefix: string) => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
};

const defaultStore = (): Store => ({
  companies: initialCompanies,
  workOrders: initialWorkOrders,
  fiscalFiles: initialFiscalFiles,
  fiscalFileRuns: initialFiscalFileRuns,
  calendarEvents: initialCalendarEvents,
  fiscalBatches: initialFiscalBatches,
});

const normalizeStore = (input: Partial<Store>): Store => ({
  companies: input.companies && input.companies.length ? input.companies : initialCompanies,
  workOrders: input.workOrders && input.workOrders.length ? input.workOrders : initialWorkOrders,
  fiscalFiles: input.fiscalFiles && input.fiscalFiles.length ? input.fiscalFiles : initialFiscalFiles,
  fiscalFileRuns:
    input.fiscalFileRuns && input.fiscalFileRuns.length ? input.fiscalFileRuns : initialFiscalFileRuns,
  calendarEvents: input.calendarEvents && input.calendarEvents.length ? input.calendarEvents : initialCalendarEvents,
  fiscalBatches: input.fiscalBatches && input.fiscalBatches.length ? input.fiscalBatches : initialFiscalBatches,
});

const readStore = (): Store => {
  if (typeof window === "undefined") {
    return defaultStore();
  }
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const init = defaultStore();
    writeStore(init);
    return init;
  }
  try {
    const parsed = JSON.parse(raw) as Partial<Store>;
    const normalized = normalizeStore(parsed);
    writeStore(normalized);
    return normalized;
  } catch {
    const init = defaultStore();
    writeStore(init);
    return init;
  }
};

const writeStore = (store: Store) => {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
};

const getCompanyName = (companyId: string, companies: Company[]) =>
  companies.find((company) => company.id === companyId)?.name ?? "Empresa";

const computeNextGeneration = (dayOfMonth: number) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const candidate = new Date(year, month, dayOfMonth);
  const useDate = candidate >= now ? candidate : new Date(year, month + 1, dayOfMonth);
  return `${useDate.getFullYear()}-${pad(useDate.getMonth() + 1)}-${pad(useDate.getDate())}`;
};

const currentMonthStart = () => {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`;
};

const nextMonthStart = () => {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return `${next.getFullYear()}-${pad(next.getMonth() + 1)}-${pad(next.getDate())}`;
};

const syncMonthlyFiscalFiles = (store: Store) => {
  const monthStart = currentMonthStart();
  const next = [...store.fiscalFiles];
  let changed = false;

  store.companies.forEach((company) => {
    if (!company.generatesFiscalFiles) return;
    const index = next.findIndex((item) => item.companyId === company.id);
    if (index === -1) {
      next.push({
        id: makeId("ff"),
        companyId: company.id,
        companyName: company.name,
        responsible: "",
        dayOfMonth: 1,
        nextGeneration: monthStart,
        active: true,
      });
      changed = true;
      return;
    }
    const current = next[index];
    const updated = {
      ...current,
      companyName: company.name,
      dayOfMonth: 1,
      nextGeneration: monthStart,
      active: true,
    };
    if (
      updated.companyName !== current.companyName ||
      updated.dayOfMonth !== current.dayOfMonth ||
      updated.nextGeneration !== current.nextGeneration ||
      updated.active !== current.active
    ) {
      next[index] = updated;
      changed = true;
    }
  });

  return { items: next, changed };
};

const mergeFiscalBatches = (batches: FiscalBatch[]) => {
  const map = new Map<string, FiscalBatch>();
  let changed = false;

  batches.forEach((batch) => {
    const key = `${batch.companyId}|${batch.competence}|${batch.type}`;
    const existing = map.get(key);
    if (!existing) {
      map.set(key, batch);
      return;
    }
    changed = true;
    const isNewer = batch.createdAt > existing.createdAt;
    const mergedNotes = batch.notes
      ? existing.notes
        ? `${existing.notes} | ${batch.notes}`
        : batch.notes
      : existing.notes;
    map.set(key, {
      ...existing,
      quantity: existing.quantity + batch.quantity,
      notes: mergedNotes,
      launchDone: existing.launchDone || batch.launchDone,
      billingDone: existing.billingDone || batch.billingDone,
      createdAt: isNewer ? batch.createdAt : existing.createdAt,
      createdBy: isNewer ? batch.createdBy : existing.createdBy,
    });
  });

  return { batches: Array.from(map.values()), changed };
};

export const listCompanies = (): Company[] => readStore().companies;

export const getCompanyById = (id: string): Company | undefined =>
  readStore().companies.find((company) => company.id === id);

export const createCompany = (input: CompanyInput): Company => {
  const store = readStore();
  const company: Company = {
    id: makeId("c"),
    status: input.status ?? "Ativa",
    ...input,
  };
  store.companies = [company, ...store.companies];
  writeStore(store);
  return company;
};

export const updateCompany = (id: string, patch: Partial<CompanyInput>): Company | undefined => {
  const store = readStore();
  const index = store.companies.findIndex((company) => company.id === id);
  if (index === -1) {
    return undefined;
  }
  const updated: Company = {
    ...store.companies[index],
    ...patch,
  };
  store.companies[index] = updated;
  writeStore(store);
  return updated;
};

export const deleteCompany = (id: string): void => {
  const store = readStore();
  store.companies = store.companies.filter((company) => company.id !== id);
  writeStore(store);
};

export const listWorkOrders = (): WorkOrder[] => {
  const store = readStore();
  return [...store.workOrders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
};

export const getWorkOrderById = (id: string): WorkOrder | undefined =>
  readStore().workOrders.find((order) => order.id === id);

export const createWorkOrder = (input: WorkOrderInput): WorkOrder => {
  const store = readStore();
  const nextNumber =
    store.workOrders.reduce((max, order) => Math.max(max, Number(order.number)), 1000) + 1;
  const now = new Date().toISOString();
  const companyName = getCompanyName(input.companyId, store.companies);
  const newOrder: WorkOrder = {
    id: makeId("wo"),
    number: String(nextNumber),
    companyId: input.companyId,
    companyName,
    type: input.type,
    responsible: input.responsible,
    dueDate: input.dueDate,
    priority: input.priority,
    status: "Aberta",
    description: input.description,
    createdAt: now,
    history: [
      {
        id: makeId("h"),
        title: "OS criada",
        description: "Criada via painel.",
        at: now,
      },
    ],
  };
  store.workOrders = [newOrder, ...store.workOrders];
  writeStore(store);
  return newOrder;
};

export const updateWorkOrder = (id: string, patch: WorkOrderUpdate): WorkOrder | undefined => {
  const store = readStore();
  const index = store.workOrders.findIndex((order) => order.id === id);
  if (index === -1) {
    return undefined;
  }
  const nextCompanyId = patch.companyId ?? store.workOrders[index].companyId;
  const updated = {
    ...store.workOrders[index],
    ...patch,
    companyId: nextCompanyId,
    companyName: getCompanyName(nextCompanyId, store.companies),
  };
  store.workOrders[index] = updated;
  writeStore(store);
  return updated;
};

export const deleteWorkOrder = (id: string): void => {
  const store = readStore();
  store.workOrders = store.workOrders.filter((order) => order.id !== id);
  writeStore(store);
};

export const addWorkOrderHistory = (
  workOrderId: string,
  entry: Omit<WorkOrderHistory, "id" | "at">
): WorkOrder | undefined => {
  const store = readStore();
  const index = store.workOrders.findIndex((order) => order.id === workOrderId);
  if (index === -1) {
    return undefined;
  }
  const now = new Date().toISOString();
  const historyEntry: WorkOrderHistory = {
    id: makeId("h"),
    at: now,
    ...entry,
  };
  store.workOrders[index] = {
    ...store.workOrders[index],
    history: [historyEntry, ...store.workOrders[index].history],
  };
  writeStore(store);
  return store.workOrders[index];
};

export const listFiscalFiles = (): FiscalFile[] => {
  const store = readStore();
  const synced = syncMonthlyFiscalFiles(store);
  if (synced.changed) {
    store.fiscalFiles = synced.items;
    writeStore(store);
  }
  if (store.fiscalFiles.length === 0 && store.companies.length > 0) {
    const sampleCompany = store.companies[0];
    store.fiscalFiles = [
      {
        id: makeId("ff"),
        companyId: sampleCompany.id,
        companyName: sampleCompany.name,
        responsible: "",
        dayOfMonth: 1,
        nextGeneration: currentMonthStart(),
        active: true,
      },
    ];
    writeStore(store);
  }
  return [...store.fiscalFiles].sort((a, b) => a.companyName.localeCompare(b.companyName));
};

export const listFiscalFileRuns = (): FiscalFileRun[] => {
  const store = readStore();
  return [...store.fiscalFileRuns].sort((a, b) => b.generatedAt.localeCompare(a.generatedAt));
};

export const markFiscalFileGenerated = (
  id: string,
  generatedBy: string,
  notes?: string
): FiscalFileRun | undefined => {
  const store = readStore();
  const index = store.fiscalFiles.findIndex((file) => file.id === id);
  if (index === -1) return undefined;
  const file = store.fiscalFiles[index];
  const now = new Date().toISOString();
  const competence = file.nextGeneration.slice(0, 7);
  const already = store.fiscalFileRuns.some(
    (run) => run.companyId === file.companyId && run.competence === competence
  );
  if (already) {
    return undefined;
  }
  const run: FiscalFileRun = {
    id: makeId("ffr"),
    companyId: file.companyId,
    companyName: file.companyName,
    competence,
    generatedAt: now,
    generatedBy,
    notes,
    status: "Gerado",
  };
  store.fiscalFileRuns = [run, ...store.fiscalFileRuns];
  store.fiscalFiles[index] = {
    ...file,
    responsible: generatedBy,
    nextGeneration: currentMonthStart(),
    active: true,
  };
  writeStore(store);
  return run;
};

export const updateFiscalFileConfig = (input: FiscalFileConfigInput): FiscalFile => {
  const store = readStore();
  const nextGeneration = computeNextGeneration(input.dayOfMonth);
  if (input.id) {
    const index = store.fiscalFiles.findIndex((file) => file.id === input.id);
    if (index !== -1) {
      const updated: FiscalFile = {
        ...store.fiscalFiles[index],
        ...input,
        responsible: input.responsible ?? store.fiscalFiles[index].responsible,
        observation: input.observation ?? store.fiscalFiles[index].observation,
        companyName: getCompanyName(input.companyId, store.companies),
        nextGeneration,
      };
      store.fiscalFiles[index] = updated;
      writeStore(store);
      return updated;
    }
  }
  const created: FiscalFile = {
    id: makeId("ff"),
    companyId: input.companyId,
    companyName: getCompanyName(input.companyId, store.companies),
    responsible: input.responsible ?? "",
    observation: input.observation,
    dayOfMonth: input.dayOfMonth,
    nextGeneration,
    active: input.active,
  };
  store.fiscalFiles = [created, ...store.fiscalFiles];
  writeStore(store);
  return created;
};

export const listCalendarEvents = (): CalendarEvent[] => {
  const store = readStore();
  return [...store.calendarEvents].sort((a, b) =>
    `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)
  );
};

export const createCalendarEvent = (input: CalendarEventInput): CalendarEvent => {
  const store = readStore();
  const event: CalendarEvent = {
    id: makeId("ev"),
    ...input,
    companyName: getCompanyName(input.companyId, store.companies),
  };
  store.calendarEvents = [event, ...store.calendarEvents];
  writeStore(store);
  return event;
};

export const updateCalendarEvent = (id: string, patch: CalendarEventUpdate): CalendarEvent | undefined => {
  const store = readStore();
  const index = store.calendarEvents.findIndex((event) => event.id === id);
  if (index === -1) {
    return undefined;
  }
  const companyId = patch.companyId ?? store.calendarEvents[index].companyId;
  const updated: CalendarEvent = {
    ...store.calendarEvents[index],
    ...patch,
    companyId,
    companyName: getCompanyName(companyId, store.companies),
  };
  store.calendarEvents[index] = updated;
  writeStore(store);
  return updated;
};

export const deleteCalendarEvent = (id: string): void => {
  const store = readStore();
  store.calendarEvents = store.calendarEvents.filter((event) => event.id !== id);
  writeStore(store);
};

export const listFiscalBatches = (): FiscalBatch[] => {
  const store = readStore();
  const merged = mergeFiscalBatches(store.fiscalBatches);
  if (merged.changed) {
    store.fiscalBatches = merged.batches;
    writeStore(store);
  }
  return [...store.fiscalBatches].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
};

export const createFiscalBatch = (input: FiscalBatchInput): FiscalBatch => {
  const store = readStore();
  const now = new Date().toISOString();
  const existingIndex = store.fiscalBatches.findIndex(
    (batch) =>
      batch.companyId === input.companyId &&
      batch.competence === input.competence &&
      batch.type === input.type
  );
  if (existingIndex !== -1) {
    const current = store.fiscalBatches[existingIndex];
    const mergedNotes = input.notes
      ? current.notes
        ? `${current.notes} | ${input.notes}`
        : input.notes
      : current.notes;
    const merged: FiscalBatch = {
      ...current,
      quantity: current.quantity + input.quantity,
      notes: mergedNotes,
      launchDone: input.launchDone ?? false,
      billingDone: input.billingDone ?? false,
      createdAt: now,
    };
    store.fiscalBatches[existingIndex] = merged;
    writeStore(store);
    return merged;
  }
  const batch: FiscalBatch = {
    id: makeId("fb"),
    companyId: input.companyId,
    companyName: getCompanyName(input.companyId, store.companies),
    competence: input.competence,
    type: input.type,
    quantity: input.quantity,
    notes: input.notes,
    launchDone: input.launchDone ?? false,
    billingDone: input.billingDone ?? false,
    createdBy: "Usuario",
    createdAt: now,
  };
  store.fiscalBatches = [batch, ...store.fiscalBatches];
  writeStore(store);
  return batch;
};

export const updateFiscalBatch = (id: string, patch: FiscalBatchUpdate): FiscalBatch | undefined => {
  const store = readStore();
  const index = store.fiscalBatches.findIndex((batch) => batch.id === id);
  if (index === -1) {
    return undefined;
  }
  const current = store.fiscalBatches[index];
  const nextLaunchDone = patch.launchDone ?? current.launchDone;
  const nextBillingDone = patch.billingDone ?? current.billingDone;
  const safeBillingDone = nextLaunchDone ? nextBillingDone : false;
  const updated = {
    ...current,
    ...patch,
    launchDone: nextLaunchDone,
    billingDone: safeBillingDone,
  };
  store.fiscalBatches[index] = updated;
  writeStore(store);
  return updated;
};

export const getFiscalSummaryByMonth = (competence: string): FiscalSummaryRow[] => {
  const batches = listFiscalBatches().filter((batch) => batch.competence === competence);
  const map = new Map<string, FiscalSummaryRow>();
  batches.forEach((batch) => {
    const existing = map.get(batch.companyId) ?? {
      companyId: batch.companyId,
      companyName: batch.companyName,
      entrada: 0,
      saida: 0,
      total: 0,
    };
    if (batch.type === "Entrada") {
      existing.entrada += batch.quantity;
    } else {
      existing.saida += batch.quantity;
    }
    existing.total = existing.entrada + existing.saida;
    map.set(batch.companyId, existing);
  });
  return Array.from(map.values()).sort((a, b) => a.companyName.localeCompare(b.companyName));
};

export type { WorkOrderPriority, WorkOrderStatus } from "./types";
