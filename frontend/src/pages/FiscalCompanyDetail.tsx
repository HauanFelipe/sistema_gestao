import { ArrowLeft } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { routes } from "../app/routes";
import EmptyState from "../shared/EmptyState";
import { listCompanies, listFiscalBatches } from "../api";
import type { Company, FiscalBatch } from "../mocks/types";
import StatCard from "../shared/StatCard";
import { ArrowDownCircle, ArrowUpCircle, ClipboardList } from "lucide-react";

export default function FiscalCompanyDetail() {
  const navigate = useNavigate();
  const { companyId } = useParams();
  const [competence, setCompetence] = useState(currentMonth());
  const [company, setCompany] = useState<Company | undefined>();
  const [batches, setBatches] = useState<FiscalBatch[]>([]);

  useEffect(() => {
    if (!companyId) return;
    listCompanies()
      .then((items) => setCompany(items.find((item) => item.id === companyId)))
      .catch(() => setCompany(undefined));
  }, [companyId]);

  useEffect(() => {
    if (!companyId) return;
    listFiscalBatches(companyId, competence)
      .then(setBatches)
      .catch(() => setBatches([]));
  }, [companyId, competence]);

  const rows = useMemo(() => {
    return batches
      .filter((batch) => batch.launchDone && batch.billingDone)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [batches]);
  const totals = useMemo(() => {
    const entrada = rows.filter((batch) => batch.type === "Entrada").reduce((acc, batch) => acc + batch.quantity, 0);
    const saida = rows.filter((batch) => batch.type === "Saida").reduce((acc, batch) => acc + batch.quantity, 0);
    return {
      entrada,
      saida,
      total: entrada + saida,
    };
  }, [rows]);

  if (!company) {
    return (
      <EmptyState
        title="Empresa nao encontrada"
        description="Volte para a lista de finalizados."
        action={
          <button
            className="rounded-xl border border-gray-200 dark:border-slate-800 px-5 py-3"
            onClick={() => navigate(routes.fiscalFinished)}
          >
            Voltar
          </button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(routes.fiscalFinished)}
            className="h-10 w-10 rounded-xl border border-gray-200 dark:border-slate-800 flex items-center justify-center"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-semibold">{company.name}</h1>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              Lancamentos finalizados por mes.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-3">
        <div className="rounded-2xl border border-gray-200 dark:border-slate-900 bg-white/70 dark:bg-slate-950/60 backdrop-blur px-4 py-3">
          <div className="flex items-center gap-2">
            <input
              type="month"
              value={competence}
              onChange={(event) => setCompetence(event.target.value)}
              className="w-full bg-transparent outline-none text-sm"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Total Entradas" value={totals.entrada} icon={<ArrowDownCircle size={20} />} />
        <StatCard title="Total Saidas" value={totals.saida} icon={<ArrowUpCircle size={20} />} />
        <StatCard title="Total Geral" value={totals.total} icon={<ClipboardList size={20} />} />
      </div>

      {rows.length === 0 ? (
        <EmptyState title="Sem lancamentos no mes" description="Nao ha registros finalizados para este periodo." />
      ) : (
        <div className="rounded-2xl border border-gray-200 dark:border-slate-900 bg-white/70 dark:bg-slate-950/60 backdrop-blur overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50/80 dark:bg-slate-900/40">
                <tr className="text-left">
                  <th className="px-5 py-3 font-semibold">Competencia</th>
                  <th className="px-5 py-3 font-semibold">Tipo</th>
                  <th className="px-5 py-3 font-semibold">Quantidade</th>
                  <th className="px-5 py-3 font-semibold">Registrado em</th>
                  <th className="px-5 py-3 font-semibold">Registrado por</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((batch) => (
                  <tr key={batch.id} className="border-t border-gray-200 dark:border-slate-900">
                    <td className="px-5 py-4 text-gray-500 dark:text-slate-400">{batch.competence}</td>
                    <td className="px-5 py-4">{batch.type}</td>
                    <td className="px-5 py-4">{batch.quantity}</td>
                    <td className="px-5 py-4">{new Date(batch.createdAt).toLocaleString()}</td>
                    <td className="px-5 py-4">{batch.createdBy ?? "Usuario"}</td>
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
