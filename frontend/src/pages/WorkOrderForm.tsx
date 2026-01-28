import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { Company, WorkOrderPriority } from "../mocks/types";
import type { SystemUser } from "../api";

export type WorkOrderFormValues = {
  companyId: string;
  type: string;
  responsible: string;
  dueDate: string;
  status: string;
  priority: WorkOrderPriority | "";
  description?: string;
};


type Props = {
  initialValues?: Partial<WorkOrderFormValues>;
  companies: Company[];
  users: SystemUser[];
  submitLabel: string;
  onSubmit: (values: WorkOrderFormValues) => void;
  onCancel: () => void;
};

const defaultValues: WorkOrderFormValues = {
  companyId: "",
  type: "",
  responsible: "",
  priority: "",
  dueDate: "",
  status: "Pendente",
  description: "",
};


export default function WorkOrderForm({ initialValues, companies, users, submitLabel, onSubmit, onCancel }: Props) {
  const [values, setValues] = useState<WorkOrderFormValues>({
    ...defaultValues,
    ...initialValues,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof WorkOrderFormValues, string>>>({});
  const [companyQuery, setCompanyQuery] = useState("");

  const companyOptions = useMemo(() => companies, [companies]);
  const companyDatalistId = "company-options-os";
  const responsibleDatalistId = "responsible-options-os";

  const update = <K extends keyof WorkOrderFormValues>(key: K, value: WorkOrderFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleCompanyInput = (value: string) => {
    setCompanyQuery(value);
    const match = companyOptions.find(
      (company) => company.name.toLowerCase() === value.trim().toLowerCase()
    );
    update("companyId", match ? match.id : "");
  };

  const resolveCompany = (value: string) => {
    const normalized = value.trim().toLowerCase();
    if (!normalized) return undefined;
    const exact = companyOptions.find((company) => company.name.toLowerCase() === normalized);
    if (exact) return exact;
    const matches = companyOptions.filter((company) => company.name.toLowerCase().includes(normalized));
    return matches.length === 1 ? matches[0] : undefined;
  };

  const handleCompanyBlur = () => {
    const resolved = resolveCompany(companyQuery);
    update("companyId", resolved ? resolved.id : "");
    if (resolved) {
      setCompanyQuery(resolved.name);
    }
  };

  const selectedCompany = useMemo(
    () => companyOptions.find((company) => company.id === values.companyId),
    [companyOptions, values.companyId]
  );

  useEffect(() => {
    if (selectedCompany && selectedCompany.name !== companyQuery) {
      setCompanyQuery(selectedCompany.name);
    }
  }, [selectedCompany, companyQuery]);

  const validate = () => {
    const nextErrors: Partial<Record<keyof WorkOrderFormValues, string>> = {};
    if (!values.companyId) nextErrors.companyId = "Campo obrigatorio.";
    if (!values.type) nextErrors.type = "Campo obrigatorio.";
    if (!values.responsible) nextErrors.responsible = "Campo obrigatorio.";
    if (!values.priority) nextErrors.priority = "Campo obrigatorio.";
    if (!values.dueDate) nextErrors.dueDate = "Campo obrigatorio.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    onSubmit(values);
  };

  return (
    <form className="space-y-6 max-w-5xl" onSubmit={submit}>
      <Section title="Dados da OS">
        <Field label="Empresa *" error={errors.companyId}>
          <input
            list={companyDatalistId}
            value={companyQuery}
            onChange={(event) => handleCompanyInput(event.target.value)}
            onBlur={handleCompanyBlur}
            className={inputClass(!!errors.companyId)}
            placeholder="Digite o nome da empresa..."
          />
          <datalist id={companyDatalistId}>
            {companyOptions.map((company) => (
              <option key={company.id} value={company.name} />
            ))}
          </datalist>
        </Field>
        <Field label="Tipo de servico *" error={errors.type}>
        <input
            value={values.type}
            onChange={(event) => update("type", event.target.value)}
            className={inputClass(!!errors.type)}

            placeholder="Ex: Suporte, Visita, Treinamento"
          />
        </Field>
        <Field label="Responsavel *" error={errors.responsible}>
          <input
            list={responsibleDatalistId}
            value={values.responsible}
            onChange={(event) => update("responsible", event.target.value)}
            className={inputClass(!!errors.responsible)}
            placeholder="Selecione o responsavel"
          />
          <datalist id={responsibleDatalistId}>
            {users
              .filter((user) => user.active !== false)
              .map((user) => (
                <option key={user.id} value={user.name} />
              ))}
          </datalist>
        </Field>
        <Field label="Prioridade *" error={errors.priority}>
          <select
            value={values.priority}
            onChange={(event) => update("priority", event.target.value as WorkOrderPriority)}
            className={inputClass(!!errors.priority)}
          >
            <option value="">Selecione...</option>
            <option value="Baixa">Baixa</option>
            <option value="Media">Media</option>
            <option value="Alta">Alta</option>
          </select>
        </Field>
        <Field label="Prazo *" error={errors.dueDate}>
          <input
            type="date"
            value={values.dueDate}
            onChange={(event) => update("dueDate", event.target.value)}
            className={inputClass(!!errors.dueDate)}
          />
        </Field>
        <Field label="Descricao">
          <textarea
            value={values.description}
            onChange={(event) => update("description", event.target.value)}
            className={`${inputClass(false)} min-h-[120px]`}
            placeholder="Detalhes adicionais"
          />
        </Field>
      </Section>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 text-white px-5 py-3 font-semibold hover:bg-blue-700"
        >
          {submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-gray-200 dark:border-slate-800 px-5 py-3"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-slate-900 bg-white/70 dark:bg-slate-950/60 p-5 space-y-4">
      <h2 className="font-semibold">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
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
    "w-full rounded-xl border bg-white dark:bg-slate-900 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-600/30",
    hasError ? "border-red-500" : "border-gray-200 dark:border-slate-800",
  ].join(" ");
}
