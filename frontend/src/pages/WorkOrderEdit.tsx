import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { routes } from "../app/routes";
import EmptyState from "../shared/EmptyState";
import { getWorkOrderById, listCompanies, listUsers, updateWorkOrder } from "../api";
import type { Company, WorkOrder } from "../mocks/types";
import WorkOrderForm, { type WorkOrderFormValues } from "./WorkOrderForm";
import type { SystemUser } from "../api";

export default function WorkOrderEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [order, setOrder] = useState<WorkOrder | undefined>();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([getWorkOrderById(id), listCompanies(), listUsers()])
      .then(([orderData, companyData, userData]) => {
        setOrder(orderData);
        setCompanies(companyData);
        setUsers(userData);
      })
      .catch(() => setOrder(undefined))
      .finally(() => setLoaded(true));
  }, [id]);

  if (!loaded) {
    return (
      <div className="text-sm text-gray-500 dark:text-slate-400">Carregando...</div>
    );
  }

  if (!order) {
    return (
      <EmptyState
        title="Ordem nao encontrada"
        description="Volte para a lista e selecione uma OS valida."
        action={
          <button
            className="rounded-xl border border-gray-200 dark:border-slate-800 px-5 py-3"
            onClick={() => navigate(routes.workOrdersPending)}
          >
            Voltar para lista
          </button>
        }
      />
    );
  }

  const handleSubmit = async (values: WorkOrderFormValues) => {
    await updateWorkOrder(order.id, {
      companyId: values.companyId,
      type: values.type,
      responsible: values.responsible,
      priority: values.priority as WorkOrder["priority"],
      dueDate: values.dueDate,
      description: values.description,
    });
    navigate(`/ordens-servico/${order.id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(routes.workOrdersPending)}
          className="h-10 w-10 rounded-xl border border-gray-200 dark:border-slate-800 flex items-center justify-center"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-semibold">Editar OS #{order.number}</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Atualize as informacoes da ordem de servico.
          </p>
        </div>
      </div>

      <WorkOrderForm
        companies={companies}
        users={users}
        submitLabel="Salvar alteracoes"
        initialValues={{
          companyId: order.companyId,
          type: order.type,
          responsible: order.responsible,
          priority: order.priority,
          dueDate: order.dueDate,
          description: order.description ?? "",
        }}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/ordens-servico/${order.id}`)}
      />
    </div>
  );
}
