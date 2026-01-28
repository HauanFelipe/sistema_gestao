export class CreateCompanyDto {
  name!: string;
  cnpj?: string;
  contact?: string;
  phone?: string;
  generatesFiscalFiles?: boolean;
  generatesFiscalProduction?: boolean;
  tipoContribuinte?: string;
  ie?: string;
  razaoSocial?: string;
  cep?: string;
  rua?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  nomeFantasia?: string;
  email?: string;
  contabilidadeNome?: string;
  contabilidadeEmail?: string;
  contabilidadeTelefone?: string;
  status?: "Ativa" | "Inativa";
}
