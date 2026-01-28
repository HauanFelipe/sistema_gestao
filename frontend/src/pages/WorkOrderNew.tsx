import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { routes } from "../app/routes";
import { createWorkOrder, listCompanies, listUsers } from "../api";
import WorkOrderForm, { type WorkOrderFormValues } from "./WorkOrderForm";
import type { Company } from "../mocks/types";
import type { SystemUser } from "../api";

export default function WorkOrderNew() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<SystemUser[]>([]);

  useEffect(() => {
    listCompanies().then(setCompanies).catch(() => setCompanies([]));
    listUsers().then(setUsers).catch(() => setUsers([]));
  }, []);

  const handleSubmit = async (values: WorkOrderFormValues) => {
    await createWorkOrder({
      companyId: values.companyId,
      type: values.type,
      responsible: values.responsible,
      priority: values.priority as Exclude<WorkOrderFormValues["priority"], "">,
      dueDate: values.dueDate,
      description: values.description,
    });
    navigate(routes.workOrdersPending);
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
          <h1 className="text-2xl font-semibold">Nova Ordem de Servico</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Preencha os dados obrigatorios para criar a OS.
          </p>
        </div>
      </div>

      <WorkOrderForm
        companies={companies}
        users={users}
        submitLabel="Salvar OS"
        onSubmit={handleSubmit}
        onCancel={() => navigate(routes.workOrdersPending)}
      />
    </div>
  );
}
