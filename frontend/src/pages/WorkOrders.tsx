import { useEffect, useMemo, useState } from "react";
import { Eye, Pencil, Plus, Search, Trash } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { routes } from "../app/routes";
import Badge from "../shared/Badge";
import EmptyState from "../shared/EmptyState";
import { deleteWorkOrder, listCompanies, listWorkOrders } from "../api";
import type { Company, WorkOrder, WorkOrderStatus } from "../mocks/types";

const statusTone: Record<WorkOrderStatus, "blue" | "yellow" | "green" | "red" | "gray" | "purple"> = {
  Aberta: "blue",
  "Em andamento": "yellow",
  Concluida: "green",
  "Nao realizada": "red",
  Reagendada: "purple",
  Cancelada: "gray",
};

const priorityTone: Record<WorkOrder["priority"], "gray" | "yellow" | "red"> = {
  Baixa: "gray",
  Media: "yellow",
  Alta: "red",
};

type Props = {
  view?: "pending" | "finished";
};

export default function WorkOrders({ view = "pending" }: Props) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [companyQuery, setCompanyQuery] = useState("");
  const [status, setStatus] = useState<WorkOrderStatus | "">(
    view === "finished" ? "Concluida" : ""
  );
  const [responsible, setResponsible] = useState("");
  const companyDatalistId = "company-options-work-orders";

  const [companies, setCompanies] = useState<Company[]>([]);
  const [rows, setRows] = useState<WorkOrder[]>([]);

  useEffect(() => {
    listCompanies().then(setCompanies).catch(() => setCompanies([]));
    listWorkOrders().then(setRows).catch(() => setRows([]));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const companyText = companyQuery.trim().toLowerCase();
    return rows.filter((order) => {
      const number = order.number ?? "";
      const companyName = order.companyName ?? "";
      const type = order.type ?? "";
      const responsibleName = order.responsible ?? "";
      const matchesQuery =
        !q ||
        number.toLowerCase().includes(q) ||
        companyName.toLowerCase().includes(q) ||
        type.toLowerCase().includes(q) ||
        responsibleName.toLowerCase().includes(q);
      const matchesCompany =
        (!companyId && !companyText) ||
        (companyId && order.companyId === companyId) ||
        (!companyId && companyText && companyName.toLowerCase().includes(companyText));
      const matchesStatus = !status || order.status === status;
      const matchesResponsible = !responsible || order.responsible === responsible;
      const matchesView =
        view === "finished" ? order.status === "Concluida" : order.status !== "Concluida";
      return matchesQuery && matchesCompany && matchesStatus && matchesResponsible && matchesView;
    });
  }, [rows, query, companyId, companyQuery, status, responsible, view]);

  const responsibles = useMemo(
    () => Array.from(new Set(rows.map((order) => order.responsible))).sort(),
    [rows]
  );

  const finishedByCompany = useMemo(() => {
    if (view !== "finished") return [];
    const map = new Map<string, { companyId: string; companyName: string; items: WorkOrder[] }>();
    filtered.forEach((order) => {
      const existing = map.get(order.companyId) ?? {
        companyId: order.companyId,
        companyName: order.companyName,
        items: [],
      };
      existing.items.push(order);
      map.set(order.companyId, existing);
    });
    return Array.from(map.values()).sort((a, b) => a.companyName.localeCompare(b.companyName));
  }, [filtered, view]);

  const handleCompanyFilter = (value: string) => {
    setCompanyQuery(value);
    const match = companies.find(
      (company) => company.name.toLowerCase() === value.trim().toLowerCase()
    );
    setCompanyId(match ? match.id : "");
  };

  const refresh = () => listWorkOrders().then(setRows).catch(() => setRows([]));

  const handleDelete = async (order: WorkOrder) => {
    if (!window.confirm("Tem certeza que deseja excluir esta OS?")) return;
    try {
      await deleteWorkOrder(order.id);
      refresh();
    } catch {
      alert("Nao foi possivel excluir a OS.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Ordens de Servico</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Controle e acompanhamento das OS do sistema.
          </p>
        </div>
        <button
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 text-white px-4 py-3 font-semibold hover:bg-blue-700"
          onClick={() => navigate(routes.workOrderNew)}
        >
          <Plus size={18} />
          Nova OS
        </button>
      </div>

      <div className="flex items-center gap-2">
        <NavLink
          to={routes.workOrdersPending}
          className={({ isActive }) =>
            `rounded-xl px-4 py-2 text-sm font-semibold ${
              isActive ? "bg-blue-600 text-white" : "border border-gray-200 dark:border-slate-800"
            }`
          }
        >
          Pendentes
        </NavLink>
        <NavLink
          to={routes.workOrdersFinished}
          className={({ isActive }) =>
            `rounded-xl px-4 py-2 text-sm font-semibold ${
              isActive ? "bg-blue-600 text-white" : "border border-gray-200 dark:border-slate-800"
            }`
          }
        >
          Finalizadas
        </NavLink>
      </div>

      <div className="rounded-2xl border border-gray-200 dark:border-slate-900 bg-white/70 dark:bg-slate-950/60 backdrop-blur p-4 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center">
            <Search size={18} />
          </div>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por numero, empresa, tipo ou responsavel..."
            className="w-full bg-transparent outline-none text-sm"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-gray-500 dark:text-slate-400">Empresa</label>
            <input
              list={companyDatalistId}
              value={companyQuery}
              onChange={(event) => handleCompanyFilter(event.target.value)}
              placeholder="Digite o nome da empresa..."
              className="mt-1 w-full rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 text-sm"
            />
            <datalist id={companyDatalistId}>
              {companies.map((company) => (
                <option key={company.id} value={company.name} />
              ))}
            </datalist>
          </div>
          <SelectField
            label="Status"
            value={status}
            onChange={(value) => setStatus(value as WorkOrderStatus | "")}
            options={[
              { id: "Aberta", name: "Aberta" },
              { id: "Em andamento", name: "Em andamento" },
              { id: "Concluida", name: "Concluida" },
              { id: "Nao realizada", name: "Nao realizada" },
              { id: "Reagendada", name: "Reagendada" },
              { id: "Cancelada", name: "Cancelada" },
            ]}
          />
          <SelectField
            label="Responsavel"
            value={responsible}
            onChange={setResponsible}
            options={responsibles.map((name) => ({ id: name, name }))}
          />
        </div>
      </div>

      {view === "finished" ? (
        finishedByCompany.length === 0 ? (
          <EmptyState
            title="Nenhuma OS finalizada"
            description="Conclua uma OS para aparecer aqui."
          />
        ) : (
          <div className="rounded-2xl border border-gray-200 dark:border-slate-900 bg-white/70 dark:bg-slate-950/60 backdrop-blur overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 dark:border-slate-900">
              <div className="text-sm text-gray-500 dark:text-slate-400">
                {finishedByCompany.length} empresa(s) encontrada(s)
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50/80 dark:bg-slate-900/40">
                  <tr className="text-left">
                    <th className="px-5 py-3 font-semibold">Empresa</th>
                    <th className="px-5 py-3 font-semibold">OS finalizadas</th>
                    <th className="px-5 py-3 font-semibold text-right">Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {finishedByCompany.map((company) => (
                    <tr
                      key={company.companyId}
                      className="border-t border-gray-200 dark:border-slate-900 hover:bg-gray-50 dark:hover:bg-slate-900/30"
                    >
                      <td className="px-5 py-4 font-semibold">{company.companyName}</td>
                      <td className="px-5 py-4 text-gray-500 dark:text-slate-400">
                        {company.items.length}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end">
                          <button
                            className="rounded-lg border border-gray-200 dark:border-slate-800 px-3 py-1 text-xs hover:bg-gray-100 dark:hover:bg-slate-800"
                            onClick={() =>
                              navigate(routes.workOrdersCompanyDetail.replace(":companyId", company.companyId))
                            }
                          >
                            Ver OS
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Nenhuma ordem encontrada"
          description="Tente ajustar os filtros ou crie uma nova OS."
          action={
            <button
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 text-white px-4 py-3 font-semibold hover:bg-blue-700"
              onClick={() => navigate(routes.workOrderNew)}
            >
              <Plus size={18} />
              Nova OS
            </button>
          }
        />
      ) : (
        <div className="rounded-2xl border border-gray-200 dark:border-slate-900 bg-white/70 dark:bg-slate-950/60 backdrop-blur overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200 dark:border-slate-900">
            <div className="text-sm text-gray-500 dark:text-slate-400">
              {filtered.length} ordem(ns) encontrada(s)
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50/80 dark:bg-slate-900/40">
                <tr className="text-left">
                  <th className="px-5 py-3 font-semibold">Nº OS</th>
                  <th className="px-5 py-3 font-semibold">Empresa</th>
                  <th className="px-5 py-3 font-semibold">Tipo</th>
                  <th className="px-5 py-3 font-semibold">Responsavel</th>
                  <th className="px-5 py-3 font-semibold">Prazo</th>
                  <th className="px-5 py-3 font-semibold">Prioridade</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold text-right">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => navigate(`/ordens-servico/${order.id}`)}
                    className="border-t border-gray-200 dark:border-slate-900 hover:bg-gray-50 dark:hover:bg-slate-900/30 cursor-pointer"
                  >
                    <td className="px-5 py-4 font-semibold">{order.number}</td>
                    <td className="px-5 py-4">{order.companyName}</td>
                    <td className="px-5 py-4">{order.type}</td>
                    <td className="px-5 py-4">{order.responsible}</td>
                    <td className="px-5 py-4">{order.dueDate}</td>
                    <td className="px-5 py-4">
                      <Badge label={order.priority} tone={priorityTone[order.priority]} />
                    </td>
                    <td className="px-5 py-4">
                      <Badge label={order.status} tone={statusTone[order.status]} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="h-9 w-9 rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-slate-800"
                          title="Visualizar"
                          onClick={(event) => {
                            event.stopPropagation();
                            navigate(`/ordens-servico/${order.id}`);
                          }}
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          className="h-9 w-9 rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-slate-800"
                          title="Editar"
                          onClick={(event) => {
                            event.stopPropagation();
                            navigate(`/ordens-servico/${order.id}/editar`);
                          }}
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          className="h-9 w-9 rounded-lg border border-red-200 dark:border-red-900 bg-white dark:bg-slate-900 flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600"
                          title="Excluir"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleDelete(order);
                          }}
                        >
                          <Trash size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

type SelectOption = Company | { id: string; name: string };

function SelectField({
  label,
  value,
  onChange,
  options,
  searchValue,
  onSearchChange,
  searchPlaceholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
}) {
  return (
    <div>
      <label className="text-xs text-gray-500 dark:text-slate-400">{label}</label>
      {typeof searchValue === "string" && onSearchChange && (
        <input
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={searchPlaceholder}
          className="mt-1 w-full rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 text-sm"
        />
      )}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 text-sm"
      >
        <option value="">Todos</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
    </div>
  );
}
