import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ArrowDownCircle, ArrowUpCircle, ClipboardList, Pencil, Plus, Search } from "lucide-react";
import StatCard from "../shared/StatCard";
import Badge from "../shared/Badge";
import EmptyState from "../shared/EmptyState";
import Modal from "../shared/Modal";
import { NavLink, useNavigate } from "react-router-dom";
import { routes } from "../app/routes";
import {
  createFiscalBatch,
  listCompanies,
  listFiscalBatches,
  updateFiscalBatch,
} from "../api";
import type { Company, FiscalBatch, FiscalBatchType, FiscalSummaryRow } from "../mocks/types";
import { getAuthUser } from "../app/auth";

type BatchForm = {
  companyId: string;
  competence: string;
  type: FiscalBatchType | "";
  quantity: string;
  notes: string;
};

type Props = {
  view?: "pending" | "finished";
};

export default function Fiscal({ view = "pending" }: Props) {
  const navigate = useNavigate();
  const [form, setForm] = useState<BatchForm>({
    companyId: "",
    competence: currentMonth(),
    type: "",
    quantity: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof BatchForm, string>>>({});
  const [competence, setCompetence] = useState(currentMonth());
  const [batches, setBatches] = useState<FiscalBatch[]>([]);
  const [query, setQuery] = useState("");
  const [companyQuery, setCompanyQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<{ companyId: string; companyName: string } | null>(null);
  const [editForm, setEditForm] = useState({
    entradaNotes: "",
    saidaNotes: "",
    observacoes: "",
  });

  const [companies, setCompanies] = useState<Company[]>([]);
  const companyDatalistId = "company-options-fiscal";
  const summary = useMemo(() => getFiscalSummaryByMonth(competence, batches), [competence, batches]);
  const batchesByCompany = useMemo(() => {
    const map = new Map<string, typeof batches>();
    batches
      .filter((batch) => batch.competence === competence)
      .forEach((batch) => {
        const list = map.get(batch.companyId) ?? [];
        list.push(batch);
        map.set(batch.companyId, list);
      });
    return map;
  }, [batches, competence]);
  const filteredSummary = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return summary;
    return summary.filter((row) => row.companyName.toLowerCase().includes(q));
  }, [summary, query]);
  const pendingSummary = useMemo(() => {
    return filteredSummary.filter((row) => {
      const items = batchesByCompany.get(row.companyId);
      return !isAllDone(items) || !isAllBilled(items);
    });
  }, [filteredSummary, batchesByCompany]);
  const totals = useMemo(() => {
    return summary.reduce(
      (acc, row) => {
        acc.entrada += row.entrada;
        acc.saida += row.saida;
        acc.total += row.total;
        return acc;
      },
      { entrada: 0, saida: 0, total: 0 }
    );
  }, [summary]);
  const pendingTotals = useMemo(() => {
    return pendingSummary.reduce(
      (acc, row) => {
        acc.entrada += row.entrada;
        acc.saida += row.saida;
        acc.total += row.total;
        return acc;
      },
      { entrada: 0, saida: 0, total: 0 }
    );
  }, [pendingSummary]);
  const finishedRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const map = new Map<string, { companyId: string; companyName: string; months: Map<string, { competence: string; entrada: number; saida: number; total: number }> }>();
    batches.forEach((batch) => {
      if (!batch.launchDone || !batch.billingDone) return;
      if (batch.competence !== competence) return;
      if (q && !batch.companyName.toLowerCase().includes(q)) return;
      const existing =
        map.get(batch.companyId) ??
        ({
          companyId: batch.companyId,
          companyName: batch.companyName,
          months: new Map(),
        } as {
          companyId: string;
          companyName: string;
          months: Map<string, { competence: string; entrada: number; saida: number; total: number }>;
        });
      const monthKey = batch.competence;
      const month = existing.months.get(monthKey) ?? {
        competence: monthKey,
        entrada: 0,
        saida: 0,
        total: 0,
      };
      if (batch.type === "Entrada") {
        month.entrada += batch.quantity;
      } else {
        month.saida += batch.quantity;
      }
      month.total = month.entrada + month.saida;
      existing.months.set(monthKey, month);
      map.set(batch.companyId, existing);
    });
    const rows: { companyId: string; companyName: string; competence: string; entrada: number; saida: number; total: number }[] = [];
    Array.from(map.values())
      .sort((a, b) => a.companyName.localeCompare(b.companyName))
      .forEach((entry) => {
        Array.from(entry.months.values())
          .sort((a, b) => b.competence.localeCompare(a.competence))
          .forEach((month) => {
            rows.push({
              companyId: entry.companyId,
              companyName: entry.companyName,
              competence: month.competence,
              entrada: month.entrada,
              saida: month.saida,
              total: month.total,
            });
          });
      });
    return rows;
  }, [batches, competence, query]);

  useEffect(() => {
    listCompanies().then(setCompanies).catch(() => setCompanies([]));
    listFiscalBatches()
      .then((rows) => setBatches(mergeFiscalBatches(rows)))
      .catch(() => setBatches([]));
  }, []);

  const refresh = () =>
    listFiscalBatches()
      .then((rows) => setBatches(mergeFiscalBatches(rows)))
      .catch(() => setBatches([]));

  const resolveCompany = (value: string) => {
    const normalized = value.trim().toLowerCase();
    if (!normalized) return undefined;
    const exact = companies.find((company) => company.name.toLowerCase() === normalized);
    if (exact) return exact;
    const matches = companies.filter((company) => company.name.toLowerCase().includes(normalized));
    return matches.length === 1 ? matches[0] : undefined;
  };

  const validate = () => {
    const nextErrors: Partial<Record<keyof BatchForm, string>> = {};
    if (!form.companyId) nextErrors.companyId = "Campo obrigatorio.";
    if (!form.competence) nextErrors.competence = "Campo obrigatorio.";
    if (!form.type) nextErrors.type = "Campo obrigatorio.";
    if (!form.quantity) nextErrors.quantity = "Campo obrigatorio.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const resolvedCompany = form.companyId ? undefined : resolveCompany(companyQuery);
    const companyIdForSubmit = form.companyId || resolvedCompany?.id || "";
    if (!companyIdForSubmit) {
      setErrors((prev) => ({ ...prev, companyId: "Campo obrigatorio." }));
      return;
    }
    if (resolvedCompany && form.companyId !== resolvedCompany.id) {
      setForm((prev) => ({ ...prev, companyId: resolvedCompany.id }));
    }
    if (!validate()) return;
    const user = getAuthUser();
    await createFiscalBatch({
      companyId: companyIdForSubmit,
      competence: form.competence,
      type: form.type as FiscalBatchType,
      quantity: Number(form.quantity),
      notes: form.notes,
      createdBy: user?.name || "Usuario",
    });
    setForm({
      companyId: "",
      competence: currentMonth(),
      type: "",
      quantity: "",
      notes: "",
    });
    setCompanyQuery("");
    refresh();
    setShowForm(false);
  };

  const openEdit = (companyId: string, companyName: string) => {
    const related = batches.filter(
      (batch) => batch.companyId === companyId && batch.competence === competence
    );
    if (related.length === 0) {
      setEditing({ companyId, companyName });
      setEditForm({ entradaNotes: "", saidaNotes: "", observacoes: "" });
      return;
    }
    const allLaunchDone = related.every((batch) => batch.launchDone);
    const allBillingDone = related.every((batch) => batch.billingDone);
    const entradaBatch = [...related].reverse().find((batch) => batch.type === "Entrada");
    const saidaBatch = [...related].reverse().find((batch) => batch.type === "Saida");
    const observacoes = [...related].reverse().find((batch) => batch.notes)?.notes ?? "";
    setEditing({ companyId, companyName });
    setEditForm({
      entradaNotes: "0",
      saidaNotes: "0",
      observacoes,
    });
  };

  const saveEdit = async () => {
    if (!editing) return;
    const related = await listFiscalBatches(editing.companyId, competence);
    const addEntrada = Number(editForm.entradaNotes || 0);
    const addSaida = Number(editForm.saidaNotes || 0);
    const user = getAuthUser();
    const entradaBatches = related.filter((batch) => batch.type === "Entrada");
    const saidaBatches = related.filter((batch) => batch.type === "Saida");
    const entradaTotal = entradaBatches.reduce((acc, batch) => acc + batch.quantity, 0);
    const saidaTotal = saidaBatches.reduce((acc, batch) => acc + batch.quantity, 0);
    const observacoes = editForm.observacoes.trim();

    if (addEntrada > 0) {
      if (entradaBatches.length === 0) {
        await createFiscalBatch({
          companyId: editing.companyId,
          competence,
          type: "Entrada",
          quantity: addEntrada,
          notes: observacoes,
          createdBy: user?.name || "Usuario",
        });
      } else {
        const [primary, ...rest] = entradaBatches;
        await updateFiscalBatch(primary.id, {
          quantity: entradaTotal + addEntrada,
          notes: observacoes || primary.notes,
        });
        for (const extra of rest) {
          await updateFiscalBatch(extra.id, {
            quantity: 0,
            notes: observacoes || extra.notes,
          });
        }
      }
    }

    if (addSaida > 0) {
      if (saidaBatches.length === 0) {
        await createFiscalBatch({
          companyId: editing.companyId,
          competence,
          type: "Saida",
          quantity: addSaida,
          notes: observacoes,
          createdBy: user?.name || "Usuario",
        });
      } else {
        const [primary, ...rest] = saidaBatches;
        await updateFiscalBatch(primary.id, {
          quantity: saidaTotal + addSaida,
          notes: observacoes || primary.notes,
        });
        for (const extra of rest) {
          await updateFiscalBatch(extra.id, {
            quantity: 0,
            notes: observacoes || extra.notes,
          });
        }
      }
    }
    refresh();
    setEditing(null);
  };

  const finalizeCompanyMonth = async (companyId: string) => {
    const related = batches.filter(
      (batch) => batch.companyId === companyId && batch.competence === competence
    );
    if (related.length === 0) return;
    const allLaunchDone = related.every((batch) => batch.launchDone);
    for (const batch of related) {
      if (!allLaunchDone) {
        await updateFiscalBatch(batch.id, { launchDone: true });
      } else {
        await updateFiscalBatch(batch.id, { billingDone: true });
      }
    }
    refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Producao Fiscal</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Registre e acompanhe a producao mensal das empresas.
          </p>
        </div>
        {view === "pending" && (
          <button
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 text-white px-4 py-3 font-semibold hover:bg-blue-700"
            onClick={() => {
              setForm({
                companyId: "",
                competence: currentMonth(),
                type: "",
                quantity: "",
                notes: "",
              });
              setCompanyQuery("");
              setErrors({});
              setShowForm(true);
            }}
          >
            <Plus size={18} />
            Novo Lancamento
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <NavLink
          to={routes.fiscalPending}
          className={({ isActive }) =>
            `rounded-xl px-4 py-2 text-sm font-semibold ${
              isActive ? "bg-blue-600 text-white" : "border border-gray-200 dark:border-slate-800"
            }`
          }
        >
          Pendentes
        </NavLink>
        <NavLink
          to={routes.fiscalFinished}
          className={({ isActive }) =>
            `rounded-xl px-4 py-2 text-sm font-semibold ${
              isActive ? "bg-blue-600 text-white" : "border border-gray-200 dark:border-slate-800"
            }`
          }
        >
          Finalizados
        </NavLink>
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
        <div className="rounded-2xl border border-gray-200 dark:border-slate-900 bg-white/70 dark:bg-slate-950/60 backdrop-blur px-4 py-3">
          <div className="flex items-center gap-2">
            <Search size={18} className="text-gray-500" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por empresa..."
              className="w-full bg-transparent outline-none text-sm"
            />
          </div>
        </div>
      </div>

      {view === "pending" && showForm && (
        <form className="space-y-4" onSubmit={submit}>
          <div className="rounded-2xl border border-gray-200 dark:border-slate-900 bg-white/70 dark:bg-slate-950/60 backdrop-blur p-5 space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="font-semibold">Novo Lancamento de Producao</h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="rounded-xl border border-gray-200 dark:border-slate-800 px-4 py-2 text-sm"
                  onClick={() => {
                    setForm({
                      companyId: "",
                      competence: currentMonth(),
                      type: "",
                      quantity: "",
                      notes: "",
                    });
                    setCompanyQuery("");
                    setErrors({});
                    setShowForm(false);
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 text-white px-4 py-2 text-sm font-semibold hover:bg-blue-700"
                >
                  Salvar Lancamento
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <Field label="Empresa *" error={errors.companyId}>
                <input
                  list={companyDatalistId}
                  value={companyQuery}
                  onChange={(event) => {
                    const value = event.target.value;
                    setCompanyQuery(value);
                    const match = companies.find(
                      (company) => company.name.toLowerCase() === value.trim().toLowerCase()
                    );
                    setForm((prev) => ({ ...prev, companyId: match ? match.id : "" }));
                  }}
                  onBlur={() => {
                    const resolved = resolveCompany(companyQuery);
                    setForm((prev) => ({ ...prev, companyId: resolved ? resolved.id : "" }));
                    if (resolved) setCompanyQuery(resolved.name);
                  }}
                  className={inputClass(!!errors.companyId)}
                  placeholder="Digite o nome da empresa..."
                />
                <datalist id={companyDatalistId}>
                  {companies.map((company) => (
                    <option key={company.id} value={company.name} />
                  ))}
                </datalist>
              </Field>
              <Field label="Competencia *" error={errors.competence}>
                <input
                  type="month"
                  value={form.competence}
                  onChange={(event) => setForm((prev) => ({ ...prev, competence: event.target.value }))}
                  className={inputClass(!!errors.competence)}
                />
              </Field>
              <Field label="Tipo *" error={errors.type}>
                <select
                  value={form.type}
                  onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value as FiscalBatchType }))}
                  className={inputClass(!!errors.type)}
                >
                  <option value="">Selecione...</option>
                  <option value="Entrada">Entrada</option>
                  <option value="Saida">Saida</option>
                </select>
              </Field>
              <Field label="Quantidade *" error={errors.quantity}>
                <input
                  type="number"
                  min={0}
                  value={form.quantity}
                  onChange={(event) => setForm((prev) => ({ ...prev, quantity: event.target.value }))}
                  className={inputClass(!!errors.quantity)}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Field label="Observacao">
                <textarea
                  value={form.notes}
                  onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
                  className={`${inputClass(false)} min-h-[90px]`}
                />
              </Field>
            </div>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Entradas"
          value={view === "pending" ? pendingTotals.entrada : totals.entrada}
          icon={<ArrowDownCircle size={20} />}
        />
        <StatCard
          title="Total Saidas"
          value={view === "pending" ? pendingTotals.saida : totals.saida}
          icon={<ArrowUpCircle size={20} />}
        />
        <StatCard
          title="Total Geral"
          value={view === "pending" ? pendingTotals.total : totals.total}
          icon={<ClipboardList size={20} />}
        />
      </div>

      {view === "pending" ? (
        pendingSummary.length === 0 ? (
          <EmptyState title="Sem registros no periodo" description="Cadastre producao para visualizar o resumo." />
        ) : (
          <div className="rounded-2xl border border-gray-200 dark:border-slate-900 bg-white/70 dark:bg-slate-950/60 backdrop-blur overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50/80 dark:bg-slate-900/40">
                  <tr className="text-left">
                    <th className="px-5 py-3 font-semibold">Empresa</th>
                    <th className="px-5 py-3 font-semibold">Competencia</th>
                    <th className="px-5 py-3 font-semibold">Entradas</th>
                    <th className="px-5 py-3 font-semibold">Saidas</th>
                    <th className="px-5 py-3 font-semibold">Total</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold text-right">Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingSummary.map((row) => (
                    <tr key={row.companyId} className="border-t border-gray-200 dark:border-slate-900">
                      <td className="px-5 py-4 font-semibold">{row.companyName}</td>
                      <td className="px-5 py-4 text-gray-500 dark:text-slate-400">{competence}</td>
                      <td className="px-5 py-4">
                        <Badge label={String(row.entrada)} tone="green" />
                      </td>
                      <td className="px-5 py-4">
                        <Badge label={String(row.saida)} tone="red" />
                      </td>
                      <td className="px-5 py-4 font-semibold">{row.total}</td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-2">
                          <Badge
                            label={isAllDone(batchesByCompany.get(row.companyId)) ? "Lancado" : "Pendente"}
                            tone={isAllDone(batchesByCompany.get(row.companyId)) ? "green" : "gray"}
                          />
                          <Badge
                            label={isAllBilled(batchesByCompany.get(row.companyId)) ? "Cobrado" : "Pendente"}
                            tone={isAllBilled(batchesByCompany.get(row.companyId)) ? "green" : "gray"}
                          />
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className="h-9 rounded-lg border border-green-200 dark:border-green-900 bg-white dark:bg-slate-900 px-3 text-xs font-semibold text-green-600 hover:bg-green-50 dark:hover:bg-green-950/40"
                            title="Finalizar"
                            onClick={() => finalizeCompanyMonth(row.companyId)}
                          >
                            {isAllDone(batchesByCompany.get(row.companyId)) ? "Cobrar" : "Finalizar"}
                          </button>
                          <button
                            className="h-9 w-9 rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-slate-800"
                            title="Editar"
                            onClick={() => openEdit(row.companyId, row.companyName)}
                          >
                            <Pencil size={16} />
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
      ) : finishedRows.length === 0 ? (
        <EmptyState title="Sem registros finalizados" description="Lancamentos concluidos aparecerao aqui." />
      ) : (
        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-200 dark:border-slate-900 bg-white/70 dark:bg-slate-950/60 backdrop-blur overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 dark:border-slate-900">
              <div className="text-sm text-gray-500 dark:text-slate-400">
                {new Set(finishedRows.map((row) => row.companyId)).size} empresa(s) encontrada(s)
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50/80 dark:bg-slate-900/40">
                  <tr className="text-left">
                    <th className="px-5 py-3 font-semibold">Empresa</th>
                    <th className="px-5 py-3 font-semibold">Competencia</th>
                    <th className="px-5 py-3 font-semibold">Entradas</th>
                    <th className="px-5 py-3 font-semibold">Saidas</th>
                    <th className="px-5 py-3 font-semibold">Total</th>
                    <th className="px-5 py-3 font-semibold text-right">Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {finishedRows.map((row) => (
                    <tr
                      key={`${row.companyId}-${row.competence}`}
                      className="border-t border-gray-200 dark:border-slate-900 hover:bg-gray-50 dark:hover:bg-slate-900/30"
                    >
                      <td className="px-5 py-4 font-semibold">{row.companyName}</td>
                      <td className="px-5 py-4 text-gray-500 dark:text-slate-400">{row.competence}</td>
                      <td className="px-5 py-4">{row.entrada}</td>
                      <td className="px-5 py-4">{row.saida}</td>
                      <td className="px-5 py-4">{row.total}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end">
                          <button
                            className="rounded-lg border border-gray-200 dark:border-slate-800 px-3 py-1 text-xs hover:bg-gray-100 dark:hover:bg-slate-800"
                            onClick={() =>
                              navigate(routes.fiscalCompanyDetail.replace(":companyId", row.companyId))
                            }
                          >
                            Ver lancamentos
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {finishedRows.length === 0 && (
                    <tr>
                      <td className="px-5 py-6 text-center text-gray-500 dark:text-slate-400" colSpan={6}>
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
        title={editing ? `Editar: ${editing.companyName}` : "Editar lancamento"}
        onClose={() => setEditing(null)}
        footer={
          <>
            <button
              className="rounded-xl border border-gray-200 dark:border-slate-800 px-4 py-2"
              onClick={() => setEditing(null)}
            >
              Cancelar
            </button>
            <button className="rounded-xl bg-blue-600 text-white px-4 py-2 font-semibold" onClick={saveEdit}>
              Salvar
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Notas Entrada">
              <input
                type="number"
                min={0}
                value={editForm.entradaNotes}
                onChange={(event) =>
                  setEditForm((prev) => ({
                    ...prev,
                    entradaNotes: event.target.value.replace(/[^0-9]/g, ""),
                  }))
                }
                className={inputClass(false)}
              />
            </Field>
            <Field label="Notas Saida">
              <input
                type="number"
                min={0}
                value={editForm.saidaNotes}
                onChange={(event) =>
                  setEditForm((prev) => ({
                    ...prev,
                    saidaNotes: event.target.value.replace(/[^0-9]/g, ""),
                  }))
                }
                className={inputClass(false)}
              />
            </Field>
          </div>
          <Field label="Observacoes">
            <textarea
              value={editForm.observacoes}
              onChange={(event) => setEditForm((prev) => ({ ...prev, observacoes: event.target.value }))}
              className={`${inputClass(false)} min-h-[90px]`}
            />
          </Field>
        </div>
      </Modal>
    </div>
  );
}

function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
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

function isAllDone(items: { launchDone?: boolean }[] | undefined) {
  if (!items || items.length === 0) return false;
  return items.every((item) => item.launchDone);
}

function isAllBilled(items: { billingDone?: boolean }[] | undefined) {
  if (!items || items.length === 0) return false;
  return items.every((item) => item.billingDone);
}

function mergeFiscalBatches(batches: FiscalBatch[]) {
  const map = new Map<string, FiscalBatch>();
  batches.forEach((batch) => {
    const key = `${batch.companyId}|${batch.competence}|${batch.type}`;
    const existing = map.get(key);
    if (!existing) {
      map.set(key, batch);
      return;
    }
    const mergedNotes = batch.notes
      ? existing.notes
        ? `${existing.notes} | ${batch.notes}`
        : batch.notes
      : existing.notes;
    const useNewer = batch.createdAt > existing.createdAt;
    map.set(key, {
      ...existing,
      quantity: existing.quantity + batch.quantity,
      notes: mergedNotes,
      launchDone: existing.launchDone || batch.launchDone,
      billingDone: existing.billingDone || batch.billingDone,
      createdAt: useNewer ? batch.createdAt : existing.createdAt,
      createdBy: useNewer ? batch.createdBy : existing.createdBy,
    });
  });
  return Array.from(map.values());
}

function getFiscalSummaryByMonth(competence: string, batches: FiscalBatch[]): FiscalSummaryRow[] {
  const filtered = batches.filter((batch) => batch.competence === competence);
  const map = new Map<string, FiscalSummaryRow>();
  filtered.forEach((batch) => {
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
}
