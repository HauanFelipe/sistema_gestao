import { ArrowLeft, CheckCircle2, Pencil, RefreshCcw, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { routes } from "../app/routes";
import Badge from "../shared/Badge";
import EmptyState from "../shared/EmptyState";
import Modal from "../shared/Modal";
import { addWorkOrderHistory, getWorkOrderById, updateWorkOrder } from "../api";
import type { WorkOrder } from "../mocks/types";

export default function WorkOrderDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [order, setOrder] = useState<WorkOrder | undefined>();
  const [modal, setModal] = useState<"none" | "nao" | "reagendar">("none");
  const [reason, setReason] = useState("");
  const [newDate, setNewDate] = useState("");
  const [errors, setErrors] = useState<{ reason?: string; newDate?: string }>({});

  useEffect(() => {
    if (!id) return;
    getWorkOrderById(id)
      .then(setOrder)
      .catch(() => setOrder(undefined));
  }, [id]);

  const history = useMemo(() => order?.history ?? [], [order]);

  if (!order) {
    return (
      <EmptyState
        title="Ordem nao encontrada"
        description="Verifique o identificador informado."
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

  const refresh = () => {
    if (!id) return;
    getWorkOrderById(id)
      .then(setOrder)
      .catch(() => setOrder(undefined));
  };

  const handleComplete = async () => {
    if (!id) return;
    if (!window.confirm("Confirmar conclusao da OS?")) return;
    await updateWorkOrder(id, { status: "Concluida" });
    await addWorkOrderHistory(id, { title: "Concluida", description: "OS concluida pelo usuario." });
    refresh();
  };

  const handleNotDone = async () => {
    if (!id) return;
    if (!reason.trim()) {
      setErrors({ reason: "Informe o motivo." });
      return;
    }
    await updateWorkOrder(id, { status: "Nao realizada" });
    await addWorkOrderHistory(id, { title: "Nao realizada", description: reason.trim() });
    setModal("none");
    setReason("");
    setErrors({});
    refresh();
  };

  const handleReschedule = async () => {
    if (!id) return;
    if (!newDate) {
      setErrors({ newDate: "Informe a nova data." });
      return;
    }
    await updateWorkOrder(id, { status: "Reagendada", dueDate: newDate });
    await addWorkOrderHistory(id, { title: "Reagendada", description: `Nova data: ${newDate}` });
    setModal("none");
    setNewDate("");
    setErrors({});
    refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(routes.workOrdersPending)}
            className="h-10 w-10 rounded-xl border border-gray-200 dark:border-slate-800 flex items-center justify-center"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-semibold">OS #{order.number}</h1>
            <p className="text-sm text-gray-500 dark:text-slate-400">{order.companyName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-slate-800 px-4 py-2 text-sm"
            onClick={() => navigate(`/ordens-servico/${order.id}/editar`)}
          >
            <Pencil size={16} />
            Editar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-6">
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 dark:border-slate-900 bg-white/70 dark:bg-slate-950/60 backdrop-blur p-5">
            <div className="flex flex-wrap items-center gap-3">
              <Badge label={order.status} tone={statusTone(order.status)} />
              <Badge label={order.priority} tone={priorityTone(order.priority)} />
              <span className="text-sm text-gray-500 dark:text-slate-400">Prazo: {order.dueDate}</span>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Info label="Empresa" value={order.companyName} />
              <Info label="Tipo" value={order.type} />
              <Info label="Responsavel" value={order.responsible} />
              <Info label="Criada em" value={new Date(order.createdAt).toLocaleString()} />
              <Info label="Descricao" value={order.description || "Sem descricao"} full />
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 dark:border-slate-900 bg-white/70 dark:bg-slate-950/60 backdrop-blur p-5">
            <h2 className="text-lg font-semibold mb-4">Historico</h2>
            {history.length === 0 ? (
              <div className="text-sm text-gray-500 dark:text-slate-400">Sem registros.</div>
            ) : (
              <div className="space-y-4">
                {history.map((item) => (
                  <div key={item.id} className="flex items-start gap-3">
                    <div className="mt-2 h-2.5 w-2.5 rounded-full bg-blue-500" />
                    <div className="flex-1">
                      <div className="text-sm font-semibold">{item.title}</div>
                      {item.description && (
                        <div className="text-sm text-gray-500 dark:text-slate-400">{item.description}</div>
                      )}
                      <div className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                        {new Date(item.at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-200 dark:border-slate-900 bg-white/70 dark:bg-slate-950/60 backdrop-blur p-5 space-y-3">
            <h2 className="text-lg font-semibold">Acoes rapidas</h2>
            <button
              onClick={handleComplete}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 text-white px-4 py-3 font-semibold hover:bg-green-700"
            >
              <CheckCircle2 size={18} />
              Concluir
            </button>
            <button
              onClick={() => {
                setModal("nao");
                setErrors({});
              }}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-slate-800 px-4 py-3"
            >
              <XCircle size={18} />
              Nao realizada
            </button>
            <button
              onClick={() => {
                setModal("reagendar");
                setErrors({});
              }}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-slate-800 px-4 py-3"
            >
              <RefreshCcw size={18} />
              Reagendar
            </button>
          </div>

          <div className="rounded-2xl border border-gray-200 dark:border-slate-900 bg-white/70 dark:bg-slate-950/60 backdrop-blur p-5 space-y-2">
            <h3 className="font-semibold">Resumo</h3>
            <div className="text-sm text-gray-500 dark:text-slate-400">
              Responsavel: {order.responsible}
            </div>
            <div className="text-sm text-gray-500 dark:text-slate-400">Tipo: {order.type}</div>
            <div className="text-sm text-gray-500 dark:text-slate-400">Prazo: {order.dueDate}</div>
            <div className="text-sm text-gray-500 dark:text-slate-400">Prioridade: {order.priority}</div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={modal === "nao"}
        title="Marcar como nao realizada"
        onClose={() => setModal("none")}
        footer={
          <>
            <button
              className="rounded-xl border border-gray-200 dark:border-slate-800 px-4 py-2"
              onClick={() => setModal("none")}
            >
              Cancelar
            </button>
            <button
              className="rounded-xl bg-red-600 text-white px-4 py-2 font-semibold"
              onClick={handleNotDone}
            >
              Confirmar
            </button>
          </>
        }
      >
        <div>
          <label className="text-sm">Motivo *</label>
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            className={`mt-1 w-full rounded-xl border px-4 py-3 bg-white dark:bg-slate-900 ${
              errors.reason ? "border-red-500" : "border-gray-200 dark:border-slate-800"
            }`}
            rows={4}
          />
          {errors.reason && <div className="mt-1 text-xs text-red-500">{errors.reason}</div>}
        </div>
      </Modal>

      <Modal
        isOpen={modal === "reagendar"}
        title="Reagendar OS"
        onClose={() => setModal("none")}
        footer={
          <>
            <button
              className="rounded-xl border border-gray-200 dark:border-slate-800 px-4 py-2"
              onClick={() => setModal("none")}
            >
              Cancelar
            </button>
            <button
              className="rounded-xl bg-blue-600 text-white px-4 py-2 font-semibold"
              onClick={handleReschedule}
            >
              Reagendar
            </button>
          </>
        }
      >
        <div>
          <label className="text-sm">Nova data *</label>
          <input
            type="date"
            value={newDate}
            onChange={(event) => setNewDate(event.target.value)}
            className={`mt-1 w-full rounded-xl border px-4 py-3 bg-white dark:bg-slate-900 ${
              errors.newDate ? "border-red-500" : "border-gray-200 dark:border-slate-800"
            }`}
          />
          {errors.newDate && <div className="mt-1 text-xs text-red-500">{errors.newDate}</div>}
        </div>
      </Modal>
    </div>
  );
}

function Info({ label, value, full }: { label: string; value: string; full?: boolean }) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <div className="text-xs text-gray-500 dark:text-slate-400">{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}

function statusTone(status: WorkOrder["status"]) {
  if (status === "Concluida") return "green";
  if (status === "Em andamento") return "yellow";
  if (status === "Aberta") return "blue";
  if (status === "Reagendada") return "purple";
  if (status === "Nao realizada") return "red";
  return "gray";
}

function priorityTone(priority: WorkOrder["priority"]) {
  if (priority === "Alta") return "red";
  if (priority === "Media") return "yellow";
  return "gray";
}
