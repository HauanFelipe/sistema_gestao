import { ArrowLeft, Pencil } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { routes } from "../app/routes";
import EmptyState from "../shared/EmptyState";
import { getCompanyById } from "../api";
import type { Company } from "../mocks/types";

export default function CompanyDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [company, setCompany] = useState<Company | undefined>();

  useEffect(() => {
    if (!id) return;
    getCompanyById(id)
      .then((data) => setCompany(data))
      .catch(() => setCompany(undefined));
  }, [id]);

  const displayName = useMemo(() => {
    if (!company) return "";
    return company.nomeFantasia?.trim() || company.razaoSocial?.trim() || company.name;
  }, [company]);

  if (!company) {
    return (
      <EmptyState
        title="Empresa nao encontrada"
        description="Verifique o identificador informado."
        action={
          <button
            className="rounded-xl border border-gray-200 dark:border-slate-800 px-5 py-3"
            onClick={() => navigate(routes.companies)}
          >
            Voltar para lista
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
            onClick={() => navigate(routes.companies)}
            className="h-10 w-10 rounded-xl border border-gray-200 dark:border-slate-800 flex items-center justify-center"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-semibold">{displayName}</h1>
            <p className="text-sm text-gray-500 dark:text-slate-400">{company.cnpj ?? "-"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-slate-800 px-4 py-2 text-sm"
            onClick={() => navigate(`/empresas/${company.id}/editar`)}
          >
            <Pencil size={16} />
            Editar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6">
        <div className="space-y-6">
          <Section title="Dados fiscais">
            <Info label="CNPJ" value={company.cnpj} />
            <Info label="Tipo de Contribuinte" value={company.tipoContribuinte} />
            <Info label="IE" value={company.ie} />
            <Info label="Razao Social" value={company.razaoSocial} />
            <Info label="Nome Fantasia" value={company.nomeFantasia} />
          </Section>

          <Section title="Endereco">
            <Info label="CEP" value={company.cep} />
            <Info label="Rua" value={company.rua} />
            <Info label="Numero" value={company.numero} />
            <Info label="Bairro" value={company.bairro} />
            <Info label="Cidade" value={company.cidade} />
            <Info label="Estado" value={company.estado} />
          </Section>
        </div>

        <div className="space-y-6">
          <Section title="Contato">
            <Info label="E-mail" value={company.email} />
            <Info label="Telefone" value={company.phone} />
            <Info label="Contato" value={company.contact} />
            <Info label="Status" value={company.status} />
          </Section>

          <Section title="Contabilidade">
            <Info label="Nome" value={company.contabilidadeNome} />
            <Info label="E-mail" value={company.contabilidadeEmail} />
            <Info label="Telefone" value={company.contabilidadeTelefone} />
          </Section>

          <Section title="Rotinas mensais">
            <Info
              label="Arquivos Fiscais"
              value={company.generatesFiscalFiles ? "Automatico" : "Nao gera"}
            />
            <Info
              label="Producao Fiscal"
              value={company.generatesFiscalProduction ? "Automatico" : "Nao gera"}
            />
          </Section>
        </div>
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

function Info({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <div className="text-xs text-gray-500 dark:text-slate-400">{label}</div>
      <div className="text-sm font-semibold">{value?.trim() || "-"}</div>
    </div>
  );
}
