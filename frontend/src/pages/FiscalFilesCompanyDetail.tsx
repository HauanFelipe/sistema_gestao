import { ArrowLeft } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { routes } from "../app/routes";
import EmptyState from "../shared/EmptyState";
import { listCompanies, listFiscalFileRunsByCompany } from "../api";
import type { Company, FiscalFileRun } from "../mocks/types";

export default function FiscalFilesCompanyDetail() {
  const navigate = useNavigate();
  const { companyId } = useParams();
  const [competence, setCompetence] = useState(currentMonth());
  const [company, setCompany] = useState<Company | undefined>();
  const [runs, setRuns] = useState<FiscalFileRun[]>([]);

  useEffect(() => {
    if (!companyId) return;
    listCompanies()
      .then((items) => {
        setCompany(items.find((item) => item.id === companyId));
      })
      .catch(() => setCompany(undefined));
    listFiscalFileRunsByCompany(companyId)
      .then(setRuns)
      .catch(() => setRuns([]));
  }, [companyId]);

  const rows = useMemo(() => {
    return runs
      .filter((run) => run.competence === competence)
      .sort((a, b) => b.generatedAt.localeCompare(a.generatedAt));
  }, [runs, competence]);

  if (!company) {
    return (
      <EmptyState
        title="Empresa nao encontrada"
        description="Volte para a lista de finalizados."
        action={
          <button
            className="rounded-xl border border-gray-200 dark:border-slate-800 px-5 py-3"
            onClick={() => navigate(routes.fiscalFilesFinished)}
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
            onClick={() => navigate(routes.fiscalFilesFinished)}
            className="h-10 w-10 rounded-xl border border-gray-200 dark:border-slate-800 flex items-center justify-center"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-semibold">{company.name}</h1>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              Arquivos fiscais finalizados por mes.
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

      {rows.length === 0 ? (
        <EmptyState title="Sem registros no mes" description="Nao ha arquivos gerados para este periodo." />
      ) : (
        <div className="rounded-2xl border border-gray-200 dark:border-slate-900 bg-white/70 dark:bg-slate-950/60 backdrop-blur overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50/80 dark:bg-slate-900/40">
                <tr className="text-left">
                  <th className="px-5 py-3 font-semibold">Competencia</th>
                  <th className="px-5 py-3 font-semibold">Gerado em</th>
                  <th className="px-5 py-3 font-semibold">Gerado por</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((run) => (
                  <tr key={run.id} className="border-t border-gray-200 dark:border-slate-900">
                    <td className="px-5 py-4">{run.competence}</td>
                    <td className="px-5 py-4">{new Date(run.generatedAt).toLocaleString()}</td>
                    <td className="px-5 py-4">{run.generatedBy}</td>
                    <td className="px-5 py-4">{run.status}</td>
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
