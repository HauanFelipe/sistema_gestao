import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Pencil, CheckCircle2 } from "lucide-react";
import Badge from "../shared/Badge";
import EmptyState from "../shared/EmptyState";
import Modal from "../shared/Modal";
import { routes } from "../app/routes";
import {
  listCompanies,
  listFiscalFileRuns,
  listFiscalFiles,
  markFiscalFileGenerated,
  updateFiscalFileConfig,
} from "../api";
import type { Company, FiscalFile, FiscalFileRun } from "../mocks/types";
import { NavLink, useNavigate } from "react-router-dom";
import { getAuthUser } from "../app/auth";


//ARQUIVOS FISCAIS


type ConfigForm = {
  companyId: string;
  responsible: string;
  observation: string;
};

type Props = {
  view?: "pending" | "finished";
};

export default function FiscalFiles({ view = "pending" }: Props) {
  const navigate = useNavigate();
  const [items, setItems] = useState<FiscalFile[]>([]);
  const [runs, setRuns] = useState<FiscalFileRun[]>([]);
  const [editing, setEditing] = useState<FiscalFile | null>(null);
  const [companyQuery, setCompanyQuery] = useState("");
  const [finishedQuery, setFinishedQuery] = useState("");
  const [form, setForm] = useState<ConfigForm>({
    companyId: "",
    responsible: "",
    observation: "",
  });
  const [errors, setErrors] = useState<{ companyId?: string }>({});

  const [companies, setCompanies] = useState<Company[]>([]);
  const currentCompetence = new Date().toISOString().slice(0, 7);
  const pendingItems = useMemo(() => {
    return items.filter((item) => {
      if (!item.active) return false;
      const hasRun = runs.some(
        (run) => run.companyId === item.companyId && run.competence === currentCompetence
      );
      return !hasRun;
    });
  }, [items, runs, currentCompetence]);
  const companyDatalistId = "company-options-fiscal-files";
  const companyChoices = companies;

  useEffect(() => {
    listCompanies().then(setCompanies).catch(() => setCompanies([]));
    listFiscalFiles().then(setItems).catch(() => setItems([]));
    listFiscalFileRuns().then(setRuns).catch(() => setRuns([]));
  }, []);

  const refresh = () => {
    listFiscalFiles().then(setItems).catch(() => setItems([]));
    listFiscalFileRuns().then(setRuns).catch(() => setRuns([]));
  };

  const openEdit = (item: FiscalFile) => {
    setEditing(item);
    setCompanyQuery(item.companyName);
    setForm({
      companyId: item.companyId,
      responsible: item.responsible ?? "",
      observation: item.observation ?? "",
    });
    setErrors({});
  };

  const closeModal = () => {
    setEditing(null);
  };

  const validate = () => {
    const nextErrors: typeof errors = {};
    if (!form.companyId) nextErrors.companyId = "Selecione a empresa.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const saveConfig = async () => {
    if (!validate()) return;
    if (!editing) return;
    await updateFiscalFileConfig(editing.id, {
      responsible: form.responsible.trim() || editing?.responsible || "",
      observation: form.observation.trim() || editing?.observation,
    });
    refresh();
    closeModal();
  };

  const resolveCompany = (value: string) => {
    const normalized = value.trim().toLowerCase();
    if (!normalized) return undefined;
    const exact = companies.find((company) => company.name.toLowerCase() === normalized);
    if (exact) return exact;
    const matches = companies.filter((company) => company.name.toLowerCase().includes(normalized));
    return matches.length === 1 ? matches[0] : undefined;
  };

  const handleCompanyInput = (value: string) => {
    setCompanyQuery(value);
    const match = companies.find(
      (company) => company.name.toLowerCase() === value.trim().toLowerCase()
    );
    setForm((prev) => ({ ...prev, companyId: match ? match.id : "" }));
  };

  const handleCompanyBlur = () => {
    const resolved = resolveCompany(companyQuery);
    setForm((prev) => ({ ...prev, companyId: resolved ? resolved.id : "" }));
    if (resolved) {
      setCompanyQuery(resolved.name);
    }
  };

  const markGenerated = async (item: FiscalFile) => {
    const user = getAuthUser();
    const responsible = item.responsible?.trim() || user?.name || "Usuario";
    await markFiscalFileGenerated(item.id, { responsible, notes: item.observation });
    refresh();
  };

  const runsByCompany = useMemo(() => {
    const map = new Map<string, FiscalFileRun[]>();
    runs.forEach((run) => {
      const companyName =
        companies.find((company) => company.id === run.companyId)?.name || "Empresa";
      const list = map.get(companyName) ?? [];
      list.push({ ...run, companyName });
      map.set(companyName, list);
    });
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([companyName, items]) => ({
        companyName,
        items: items.sort((a, b) => b.generatedAt.localeCompare(a.generatedAt)),
      }));
  }, [runs]);
  const filteredRunsByCompany = useMemo(() => {
    const q = finishedQuery.trim().toLowerCase();
    if (!q) return runsByCompany;
    return runsByCompany.filter((group) => group.companyName.toLowerCase().includes(q));
  }, [runsByCompany, finishedQuery]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Arquivos Fiscais</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Configure a geracao mensal de arquivos por empresa.
          </p>
        </div>
        {view === "pending" && <div />}
      </div>

      <div className="flex items-center gap-2">
        <NavLink
          to={routes.fiscalFilesPending}
          className={({ isActive }) =>
            `rounded-xl px-4 py-2 text-sm font-semibold ${
              isActive ? "bg-blue-600 text-white" : "border border-gray-200 dark:border-slate-800"
            }`
          }
        >
          Pendentes
        </NavLink>
        <NavLink
          to={routes.fiscalFilesFinished}
          className={({ isActive }) =>
            `rounded-xl px-4 py-2 text-sm font-semibold ${
              isActive ? "bg-blue-600 text-white" : "border border-gray-200 dark:border-slate-800"
            }`
          }
        >
          Finalizados
        </NavLink>
      </div>

      {view === "pending" ? (
        pendingItems.length === 0 ? (
        <EmptyState
          title="Nenhuma configuracao encontrada"
          description="Marque as empresas que geram arquivos fiscais no cadastro."
        />
      ) : (
        <div className="rounded-2xl border border-gray-200 dark:border-slate-900 bg-white/70 dark:bg-slate-950/60 backdrop-blur overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50/80 dark:bg-slate-900/40">
                <tr className="text-left">
                  <th className="px-5 py-3 font-semibold">Empresa</th>
                  <th className="px-5 py-3 font-semibold">Responsavel</th>
                  <th className="px-5 py-3 font-semibold">Proxima geracao</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold text-right">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {pendingItems.map((item) => (
                  <tr
                    key={item.id}
                    className="border-t border-gray-200 dark:border-slate-900 hover:bg-gray-50 dark:hover:bg-slate-900/30"
                  >
                    <td className="px-5 py-4 font-semibold">
                      {item.companyName ||
                        companies.find((company) => company.id === item.companyId)?.name ||
                        "-"}
                    </td>
                    <td className="px-5 py-4">{item.responsible?.trim() ? item.responsible : "-"}</td>
                    <td className="px-5 py-4">{item.nextGeneration}</td>
                    <td className="px-5 py-4">
                      <Badge label={item.active ? "Ativo" : "Inativo"} tone={item.active ? "green" : "gray"} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="h-9 w-9 rounded-lg border border-green-200 dark:border-green-900 bg-white dark:bg-slate-900 flex items-center justify-center hover:bg-green-50 dark:hover:bg-green-950/40 text-green-600"
                          title="Gerado"
                          onClick={() => markGenerated(item)}
                        >
                          <CheckCircle2 size={18} />
                        </button>
                        <button
                          className="h-9 w-9 rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-slate-800"
                          title="Editar"
                          onClick={() => openEdit(item)}
                        >
                          <Pencil size={18} />
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
      ) : runs.length === 0 ? (
        <EmptyState
          title="Nenhum arquivo finalizado"
          description="Os arquivos finalizados aparecerao aqui."
        />
      ) : (
        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-200 dark:border-slate-900 bg-white/70 dark:bg-slate-950/60 backdrop-blur px-4 py-3">
            <input
              value={finishedQuery}
              onChange={(event) => setFinishedQuery(event.target.value)}
              placeholder="Buscar empresa..."
              className="w-full bg-transparent outline-none text-sm"
            />
          </div>
          <div className="rounded-2xl border border-gray-200 dark:border-slate-900 bg-white/70 dark:bg-slate-950/60 backdrop-blur overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 dark:border-slate-900">
              <div className="text-sm text-gray-500 dark:text-slate-400">
                {filteredRunsByCompany.length} empresa(s) encontrada(s)
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50/80 dark:bg-slate-900/40">
                  <tr className="text-left">
                    <th className="px-5 py-3 font-semibold">Empresa</th>
                    <th className="px-5 py-3 font-semibold">Arquivos</th>
                    <th className="px-5 py-3 font-semibold text-right">Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRunsByCompany.map((group) => (
                    <tr
                      key={group.companyName}
                      className="border-t border-gray-200 dark:border-slate-900 hover:bg-gray-50 dark:hover:bg-slate-900/30"
                    >
                      <td className="px-5 py-4 font-semibold">{group.companyName}</td>
                      <td className="px-5 py-4 text-gray-500 dark:text-slate-400">
                        {group.items.length} arquivo(s)
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end">
                          <button
                            className="rounded-lg border border-gray-200 dark:border-slate-800 px-3 py-1 text-xs hover:bg-gray-100 dark:hover:bg-slate-800"
                            onClick={() =>
                              navigate(
                                routes.fiscalFilesCompanyDetail.replace(
                                  ":companyId",
                                  group.items[0]?.companyId ?? ""
                                )
                              )
                            }
                          >
                            Ver lancamentos
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredRunsByCompany.length === 0 && (
                    <tr>
                      <td className="px-5 py-6 text-center text-gray-500 dark:text-slate-400" colSpan={3}>
                        Nenhuma empresa finalizada.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <Modal
        isOpen={!!editing}
        title="Editar configuracao"
        onClose={closeModal}
        footer={
          <>
            <button
              className="rounded-xl border border-gray-200 dark:border-slate-800 px-4 py-2"
              onClick={closeModal}
            >
              Cancelar
            </button>
            <button className="rounded-xl bg-blue-600 text-white px-4 py-2 font-semibold" onClick={saveConfig}>
              Salvar
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <Field label="Empresa *" error={errors.companyId}>
            <input
              list={companyDatalistId}
              value={companyQuery}
              onChange={(event) => handleCompanyInput(event.target.value)}
              onBlur={handleCompanyBlur}
              className={inputClass(!!errors.companyId)}
              placeholder="Digite o nome da empresa..."
              disabled
            />
            <datalist id={companyDatalistId}>
              {companyChoices.map((company: Company) => (
                <option key={company.id} value={company.name} />
              ))}
            </datalist>
          </Field>
          <Field label="Responsavel (opcional)">
            <input
              value={form.responsible}
              onChange={(event) => setForm((prev) => ({ ...prev, responsible: event.target.value }))}
              className={inputClass(false)}
              placeholder="Nome do responsavel"
            />
          </Field>
          <Field label="Observacoes">
            <textarea
              value={form.observation}
              onChange={(event) => setForm((prev) => ({ ...prev, observation: event.target.value }))}
              className={`${inputClass(false)} min-h-[90px]`}
              placeholder="Observacoes sobre a geracao"
            />
          </Field>
        </div>
      </Modal>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="text-sm">{label}</label>
      <div className="mt-1">{children}</div>
      {error && <div className="mt-1 text-xs text-red-500">{error}</div>}
    </div>
  );
}

function inputClass(hasError: boolean) {
  return [
    "w-full rounded-xl border bg-white dark:bg-slate-900 px-4 py-3 outline-none",
    hasError ? "border-red-500" : "border-gray-200 dark:border-slate-800",
  ].join(" ");
}
