import { ArrowLeft, Eye, Pencil, Trash } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

export default function WorkOrdersCompanyDetail() {
  const navigate = useNavigate();
  const { companyId } = useParams();
  const [company, setCompany] = useState<Company | undefined>();
  const [rows, setRows] = useState<WorkOrder[]>([]);
  const [monthFilter, setMonthFilter] = useState(currentMonth());

  useEffect(() => {
    if (!companyId) return;
    listCompanies()
      .then((items) => setCompany(items.find((item) => item.id === companyId)))
      .catch(() => setCompany(undefined));
  }, [companyId]);

  const refresh = () =>
    listWorkOrders()
      .then((items) => setRows(items))
      .catch(() => setRows([]));

  useEffect(() => {
    refresh();
  }, []);

  const finished = useMemo(() => {
    if (!companyId) return [];
    return rows.filter((order) => {
      if (order.companyId !== companyId || order.status !== "Concluida") return false;
      if (!monthFilter) return true;
      return order.dueDate?.startsWith(monthFilter);
    });
  }, [rows, companyId, monthFilter]);

  const handleDelete = async (order: WorkOrder) => {
    if (!window.confirm("Tem certeza que deseja excluir esta OS?")) return;
    try {
      await deleteWorkOrder(order.id);
      refresh();
    } catch {
      alert("Nao foi possivel excluir a OS.");
    }
  };

  if (!company) {
    return (
      <EmptyState
        title="Empresa nao encontrada"
        description="Volte para a lista de finalizadas."
        action={
          <button
            className="rounded-xl border border-gray-200 dark:border-slate-800 px-5 py-3"
            onClick={() => navigate(routes.workOrdersFinished)}
          >
            Voltar
          </button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(routes.workOrdersFinished)}
          className="h-10 w-10 rounded-xl border border-gray-200 dark:border-slate-800 flex items-center justify-center"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-semibold">{company.name}</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">OS finalizadas desta empresa.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr] gap-3">
        <div className="rounded-2xl border border-gray-200 dark:border-slate-900 bg-white/70 dark:bg-slate-950/60 backdrop-blur px-4 py-3">
          <div className="flex items-center gap-2">
            <input
              type="month"
              value={monthFilter}
              onChange={(event) => setMonthFilter(event.target.value)}
              className="w-full bg-transparent outline-none text-sm"
            />
          </div>
        </div>
      </div>

      {finished.length === 0 ? (
        <EmptyState
          title="Sem OS finalizadas"
          description="Finalize uma OS para aparecer aqui."
        />
      ) : (
        <div className="rounded-2xl border border-gray-200 dark:border-slate-900 bg-white/70 dark:bg-slate-950/60 backdrop-blur overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200 dark:border-slate-900">
            <div className="text-sm text-gray-500 dark:text-slate-400">
              {finished.length} OS finalizada(s)
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50/80 dark:bg-slate-900/40">
                <tr className="text-left">
                  <th className="px-5 py-3 font-semibold">NÂº OS</th>
                  <th className="px-5 py-3 font-semibold">Tipo</th>
                  <th className="px-5 py-3 font-semibold">Responsavel</th>
                  <th className="px-5 py-3 font-semibold">Prazo</th>
                  <th className="px-5 py-3 font-semibold">Prioridade</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold text-right">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {finished.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => navigate(`/ordens-servico/${order.id}`)}
                    className="border-t border-gray-200 dark:border-slate-900 hover:bg-gray-50 dark:hover:bg-slate-900/30 cursor-pointer"
                  >
                    <td className="px-5 py-4 font-semibold">{order.number}</td>
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

function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}
