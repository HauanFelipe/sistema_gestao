import { ArrowLeft, Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { routes } from "../app/routes";
import { createCompany, getCompanyById, updateCompany } from "../api";

type FormData = {
  cnpj: string;
  tipoContribuinte: string;
  ie: string;
  razaoSocial: string;
  cep: string;
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  nomeFantasia?: string;
  email?: string;
  telefone?: string;
  contato?: string;
  contabilidadeNome?: string;
  contabilidadeEmail?: string;
  contabilidadeTelefone?: string;
  generatesFiscalFiles?: boolean;
  generatesFiscalProduction?: boolean;
};

export default function CompanyForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [form, setForm] = useState<FormData>({
    cnpj: "",
    tipoContribuinte: "",
    ie: "",
    razaoSocial: "",
    cep: "",
    rua: "",
    numero: "",
    bairro: "",
    cidade: "",
    estado: "",
    generatesFiscalFiles: false,
    generatesFiscalProduction: false,
  });
  const [notFound, setNotFound] = useState(false);
  const [cnpjLoading, setCnpjLoading] = useState(false);
  const [cnpjError, setCnpjError] = useState("");
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState("");

  useEffect(() => {
    if (!id) return;
    getCompanyById(id)
      .then((company) => {
        setForm({
          cnpj: company.cnpj ?? "",
          tipoContribuinte: company.tipoContribuinte ?? "",
          ie: company.ie ?? "",
          razaoSocial: company.razaoSocial ?? "",
          cep: company.cep ?? "",
          rua: company.rua ?? "",
          numero: company.numero ?? "",
          bairro: company.bairro ?? "",
          cidade: company.cidade ?? "",
          estado: company.estado ?? "",
          nomeFantasia: company.nomeFantasia ?? "",
          email: company.email ?? "",
          telefone: company.phone ?? "",
          contato: company.contact ?? "",
          contabilidadeNome: company.contabilidadeNome ?? "",
          contabilidadeEmail: company.contabilidadeEmail ?? "",
          contabilidadeTelefone: company.contabilidadeTelefone ?? "",
          generatesFiscalFiles: company.generatesFiscalFiles ?? false,
          generatesFiscalProduction: company.generatesFiscalProduction ?? false,
        });
      })
      .catch(() => setNotFound(true));
  }, [id]);

  const headerTitle = useMemo(() => (isEdit ? "Editar Empresa" : "Cadastrar Empresa"), [isEdit]);
  const headerSubtitle = useMemo(
    () =>
      isEdit
        ? "Atualize os dados da empresa cadastrada."
        : "Preencha os dados obrigatorios para cadastrar a empresa.",
    [isEdit]
  );

  function update<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleCepBlur(value: string) {
    const cep = value.replace(/\D/g, "");
    if (!cep) return;
    if (cep.length !== 8) {
      setCepError("CEP invalido.");
      return;
    }
    setCepError("");
    setCepLoading(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = (await response.json()) as {
        erro?: boolean;
        logradouro?: string;
        bairro?: string;
        localidade?: string;
        uf?: string;
      };
      if (data.erro) {
        setCepError("CEP nao encontrado.");
        return;
      }
      setForm((prev) => ({
        ...prev,
        rua: data.logradouro ?? prev.rua,
        bairro: data.bairro ?? prev.bairro,
        cidade: data.localidade ?? prev.cidade,
        estado: data.uf ?? prev.estado,
      }));
    } catch {
      setCepError("Nao foi possivel buscar o CEP.");
    } finally {
      setCepLoading(false);
    }
  }

  async function handleCnpjBlur(value: string) {
    const digits = value.replace(/\D/g, "");
    if (!digits) return;
    if (digits.length !== 14 || !isValidCnpj(digits)) {
      setCnpjError("CNPJ invalido.");
      return;
    }
    const formatted = `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(
      8,
      12
    )}-${digits.slice(12)}`;
    setForm((prev) => ({ ...prev, cnpj: formatted }));
    setCnpjError("");
    setCnpjLoading(true);
    try {
      const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${digits}`);
      if (!response.ok) {
        setCnpjError("CNPJ nao encontrado.");
        return;
      }
      const data = (await response.json()) as {
        razao_social?: string;
        nome_fantasia?: string;
        email?: string;
        telefone?: string;
        cep?: string;
        logradouro?: string;
        numero?: string;
        bairro?: string;
        municipio?: string;
        uf?: string;
      };
      setForm((prev) => ({
        ...prev,
        razaoSocial: data.razao_social ?? prev.razaoSocial,
        nomeFantasia: data.nome_fantasia ?? prev.nomeFantasia,
        email: data.email ?? prev.email,
        telefone: data.telefone ?? prev.telefone,
        cep: data.cep ?? prev.cep,
        rua: data.logradouro ?? prev.rua,
        numero: data.numero ?? prev.numero,
        bairro: data.bairro ?? prev.bairro,
        cidade: data.municipio ?? prev.cidade,
        estado: data.uf ?? prev.estado,
      }));
    } catch {
      setCnpjError("Nao foi possivel buscar o CNPJ.");
    } finally {
      setCnpjLoading(false);
    }
  }

  async function submit() {
    const displayName = form.nomeFantasia?.trim() || form.razaoSocial.trim();
    const payload = {
      name: displayName,
      cnpj: form.cnpj.trim(),
      tipoContribuinte: form.tipoContribuinte.trim(),
      ie: form.ie.trim(),
      razaoSocial: form.razaoSocial.trim(),
      cep: form.cep.trim(),
      rua: form.rua.trim(),
      numero: form.numero.trim(),
      bairro: form.bairro.trim(),
      cidade: form.cidade.trim(),
      estado: form.estado.trim(),
      nomeFantasia: form.nomeFantasia?.trim() || undefined,
      email: form.email?.trim() || undefined,
      phone: form.telefone?.trim() || undefined,
      contact: form.contato?.trim() || undefined,
      contabilidadeNome: form.contabilidadeNome?.trim() || undefined,
      contabilidadeEmail: form.contabilidadeEmail?.trim() || undefined,
      contabilidadeTelefone: form.contabilidadeTelefone?.trim() || undefined,
      generatesFiscalFiles: form.generatesFiscalFiles ?? false,
      generatesFiscalProduction: form.generatesFiscalProduction ?? false,
    };

    try {
      if (id) {
        await updateCompany(id, payload);
      } else {
        await createCompany(payload);
      }
      alert(isEdit ? "Empresa atualizada." : "Empresa salva.");
      navigate(routes.companies);
    } catch {
      alert("Nao foi possivel salvar a empresa.");
    }
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {notFound && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Empresa nao encontrada.
        </div>
      )}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(routes.companies)}
          className="h-10 w-10 rounded-xl border border-gray-200 dark:border-slate-800 flex items-center justify-center"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-semibold">{headerTitle}</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">{headerSubtitle}</p>
        </div>
      </div>

      <div className="space-y-6">
        <Section title="Informacoes Fiscais">
          <Input label="CNPJ *" value={form.cnpj} onChange={(v) => update("cnpj", v)} onBlur={handleCnpjBlur} />
          {cnpjLoading && <div className="text-xs text-gray-500 dark:text-slate-400">Buscando CNPJ...</div>}
          {cnpjError && <div className="text-xs text-red-500">{cnpjError}</div>}
          <Select
            label="Tipo de Contribuinte *"
            value={form.tipoContribuinte}
            onChange={(v) => update("tipoContribuinte", v)}
            options={["Contribuinte ICMS", "Contribuinte ISENTO", "Nao Contribuinte"]}
          />
          <Input label="Inscricao Estadual (IE) *" value={form.ie} onChange={(v) => update("ie", v)} />
          <Input label="Razao Social *" value={form.razaoSocial} onChange={(v) => update("razaoSocial", v)} />
        </Section>

        <Section title="Endereco">
          <Input label="CEP *" value={form.cep} onChange={(v) => update("cep", v)} onBlur={handleCepBlur} />
          {cepLoading && <div className="text-xs text-gray-500 dark:text-slate-400">Buscando CEP...</div>}
          {cepError && <div className="text-xs text-red-500">{cepError}</div>}
          <Input label="Rua *" value={form.rua} onChange={(v) => update("rua", v)} />
          <Input label="Numero *" value={form.numero} onChange={(v) => update("numero", v)} />
          <Input label="Bairro *" value={form.bairro} onChange={(v) => update("bairro", v)} />
          <Input label="Cidade *" value={form.cidade} onChange={(v) => update("cidade", v)} />
          <Input label="Estado *" value={form.estado} onChange={(v) => update("estado", v)} />
        </Section>

        <Section title="Contato da empresa (opcional)">
          <Input label="Nome Fantasia" value={form.nomeFantasia ?? ""} onChange={(v) => update("nomeFantasia", v)} />
          <Input label="E-mail" value={form.email ?? ""} onChange={(v) => update("email", v)} />
          <Input label="Telefone" value={form.telefone ?? ""} onChange={(v) => update("telefone", v)} />
          <Input label="Contato (Dono)" value={form.contato ?? ""} onChange={(v) => update("contato", v)} />
        </Section>

        <Section title="Contabilidade (opcional)">
          <Input
            label="Nome"
            value={form.contabilidadeNome ?? ""}
            onChange={(v) => update("contabilidadeNome", v)}
          />
          <Input
            label="E-mail"
            value={form.contabilidadeEmail ?? ""}
            onChange={(v) => update("contabilidadeEmail", v)}
          />
          <Input
            label="Telefone"
            value={form.contabilidadeTelefone ?? ""}
            onChange={(v) => update("contabilidadeTelefone", v)}
          />
        </Section>

        <Section title="Rotinas mensais">
          <CheckboxField
            label="Gerar Arquivos Fiscais automaticamente"
            checked={!!form.generatesFiscalFiles}
            onChange={(value) => update("generatesFiscalFiles", value)}
          />
          <CheckboxField
            label="Gerar Producao Fiscal automaticamente"
            checked={!!form.generatesFiscalProduction}
            onChange={(value) => update("generatesFiscalProduction", value)}
          />
        </Section>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={submit}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 text-white px-5 py-3 font-semibold hover:bg-blue-700"
        >
          <Save size={18} /> {isEdit ? "Salvar Alteracoes" : "Salvar Empresa"}
        </button>
        <button
          onClick={() => navigate(routes.companies)}
          className="rounded-xl border border-gray-200 dark:border-slate-800 px-5 py-3"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-slate-900 bg-white/70 dark:bg-slate-950/60 p-5 space-y-4">
      <h2 className="font-semibold">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  onBlur,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-sm">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={(e) => onBlur?.(e.target.value)}
        className="mt-1 w-full rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-600/30"
      />
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div>
      <label className="text-sm">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3"
      >
        <option value="">Selecione...</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

function CheckboxField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 rounded border-gray-300"
      />
      <span>{label}</span>
    </label>
  );
}

function isValidCnpj(value: string) {
  const cnpj = value.replace(/\D/g, "");
  if (cnpj.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cnpj)) return false;
  const calc = (size: number) => {
    let sum = 0;
    let pos = size - 7;
    for (let i = size; i >= 1; i -= 1) {
      sum += Number(cnpj[size - i]) * pos--;
      if (pos < 2) pos = 9;
    }
    const result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    return result;
  };
  const digit1 = calc(12);
  const digit2 = calc(13);
  return digit1 === Number(cnpj[12]) && digit2 === Number(cnpj[13]);
}
