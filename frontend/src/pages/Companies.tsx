import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Search, Pencil, Eye, Trash } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { routes } from "../app/routes";
import { createCompany, deleteCompany, listCompanies, updateCompany } from "../api";
import type { Company } from "../mocks/types";
import * as XLSX from "xlsx";

const statusTone: Record<Company["status"], "green" | "gray"> = {
  Ativa: "green",
  Inativa: "gray",
};

export default function Companies() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [companies, setCompanies] = useState<Company[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    listCompanies().then(setCompanies).catch(() => setCompanies([]));
  }, []);

  const refresh = () => listCompanies().then(setCompanies).catch(() => setCompanies([]));
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return companies;
    return companies.filter((company) => {
      return (
        company.name.toLowerCase().includes(q) ||
        (company.cnpj ?? "").toLowerCase().includes(q) ||
        (company.contact ?? "").toLowerCase().includes(q)
      );
    });
  }, [companies, query]);

  const toggleStatus = async (company: Company) => {
    const nextStatus = company.status === "Ativa" ? "Inativa" : "Ativa";
    await updateCompany(company.id, { status: nextStatus });
    refresh();
  };

  const handleDelete = async (company: Company) => {
    if (!window.confirm("Tem certeza que deseja excluir esta empresa?")) return;
    try {
      await deleteCompany(company.id);
      refresh();
    } catch {
      alert("Nao foi possivel excluir a empresa.");
    }
  };

  const exportCompanies = () => {
    if (companies.length === 0) {
      alert("Nao ha empresas para exportar.");
      return;
    }
    const headers = ["Nome", "CNPJ", "Contato", "Telefone", "Status", "Cidade", "Estado"];
    const rows = companies.map((company) => [
      company.name ?? "",
      company.cnpj ?? "",
      company.contact ?? "",
      company.phone ?? "",
      company.status ?? "",
      company.cidade ?? "",
      company.estado ?? "",
    ]);
    const escapeCell = (value: string) => {
      const safe = value.replace(/"/g, '""');
      return `"${safe}"`;
    };
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => escapeCell(String(cell))).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "empresas.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const triggerImport = () => {
    fileInputRef.current?.click();
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    let parsed: { rows: Record<string, string>[]; headers: string[] };
    const lowerName = file.name.toLowerCase();
    if (lowerName.endsWith(".csv")) {
      const text = await file.text();
      parsed = parseCsv(text);
    } else {
      const buffer = await file.arrayBuffer();
      parsed = parseXlsx(buffer);
    }
    const { rows, headers } = parsed;
    if (!rows.length) {
      alert("Planilha vazia.");
      return;
    }
    const headerMap = mapHeaders(headers);
    if (!headerMap.name) {
      alert("Coluna obrigatoria nao encontrada: Nome.");
      return;
    }
    let created = 0;
    let failed = 0;
    for (const row of rows) {
      const name = row[headerMap.name]?.trim();
      if (!name) {
        failed += 1;
        continue;
      }
      try {
        await createCompany({
          name,
          razaoSocial: row[headerMap.razaoSocial ?? ""]?.trim() || undefined,
          cnpj: row[headerMap.cnpj ?? ""]?.trim() || undefined,
          rua: row[headerMap.address ?? ""]?.trim() || undefined,
          email: row[headerMap.email ?? ""]?.trim() || undefined,
          phone: row[headerMap.phone ?? ""]?.trim() || undefined,
          cidade: row[headerMap.city ?? ""]?.trim() || undefined,
          estado: row[headerMap.state ?? ""]?.trim() || undefined,
          status: (row[headerMap.status ?? ""]?.trim() as Company["status"]) || "Ativa",
        });
        created += 1;
      } catch {
        failed += 1;
      }
    }
    event.target.value = "";
    refresh();
    alert(`Importacao concluida. Criadas: ${created}. Falhas: ${failed}.`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Empresas</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Cadastre e gerencie empresas do sistema.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            onChange={handleImport}
          />
          <button
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 font-semibold hover:bg-gray-50 dark:hover:bg-slate-800"
            onClick={triggerImport}
          >
            Importar Excel
          </button>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 font-semibold hover:bg-gray-50 dark:hover:bg-slate-800"
            onClick={exportCompanies}
          >
            Exportar Excel
          </button>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 text-white px-4 py-3 font-semibold hover:bg-blue-700"
            onClick={() => navigate(routes.companyNew)}
          >
            <Plus size={18} />
            Nova Empresa
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 dark:border-slate-900 bg-white/70 dark:bg-slate-950/60 backdrop-blur p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center">
            <Search size={18} />
          </div>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nome, CNPJ ou contato..."
            className="w-full bg-transparent outline-none text-sm"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 dark:border-slate-900 bg-white/70 dark:bg-slate-950/60 backdrop-blur overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-slate-900">
          <div className="text-sm text-gray-500 dark:text-slate-400">
            {rows.length} empresa(s) encontrada(s)
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50/80 dark:bg-slate-900/40">
              <tr className="text-left">
                <th className="px-5 py-3 font-semibold">Empresa</th>
                <th className="px-5 py-3 font-semibold">CNPJ</th>
                <th className="px-5 py-3 font-semibold">Contato</th>
                <th className="px-5 py-3 font-semibold">Telefone</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold text-right">Acoes</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((company) => (
                <tr
                  key={company.id}
                  className="border-t border-gray-200 dark:border-slate-900 hover:bg-gray-50 dark:hover:bg-slate-900/30"
                >
                  <td className="px-5 py-4">
                    <div className="font-semibold">{company.name}</div>
                  </td>

                  <td className="px-5 py-4 text-gray-600 dark:text-slate-300">
                    {company.cnpj ?? "-"}
                  </td>

                  <td className="px-5 py-4 text-gray-600 dark:text-slate-300">
                    {company.contact ?? "-"}
                  </td>

                  <td className="px-5 py-4 text-gray-600 dark:text-slate-300">
                    {company.phone ?? "-"}
                  </td>

                  <td className="px-5 py-4">
                    <button
                      type="button"
                      className={`text-xs px-2 py-1 rounded-lg border ${
                        statusTone[company.status] === "green"
                          ? "bg-green-500/15 text-green-400 border-green-500/20"
                          : "bg-gray-500/15 text-gray-400 border-gray-500/20"
                      }`}
                      onClick={() => toggleStatus(company)}
                      title="Alternar status"
                    >
                      {company.status}
                    </button>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        className="h-9 w-9 rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-slate-800"
                        title="Visualizar"
                        onClick={() => navigate(`/empresas/${company.id}`)}
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        className="h-9 w-9 rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-slate-800"
                        title="Editar"
                        onClick={() => navigate(`/empresas/${company.id}/editar`)}
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        className="h-9 w-9 rounded-lg border border-red-200 dark:border-red-900 bg-white dark:bg-slate-900 flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600"
                        title="Excluir"
                        onClick={() => handleDelete(company)}
                      >
                        <Trash size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {rows.length === 0 && (
                <tr>
                  <td className="px-5 py-10 text-center text-gray-500 dark:text-slate-400" colSpan={6}>
                    Nenhuma empresa encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function parseCsv(text: string) {
  const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
  if (!normalized) return { headers: [] as string[], rows: [] as Record<string, string>[] };
  const delimiter = normalized.includes(";") && !normalized.includes(",") ? ";" : ",";
  const lines = normalized.split("\n").filter((line) => line.trim().length > 0);
  const headers = splitCsvLine(lines[0], delimiter).map((h) => h.trim());
  const rows = lines.slice(1).map((line) => {
    const values = splitCsvLine(line, delimiter);
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] ?? "";
    });
    return row;
  });
  return { headers, rows };
}

function splitCsvLine(line: string, delimiter: string) {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      const next = line[i + 1];
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (char === delimiter && !inQuotes) {
      result.push(current);
      current = "";
      continue;
    }
    current += char;
  }
  result.push(current);
  return result;
}

function normalizeHeader(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function mapHeaders(headers: string[]) {
  const normalized = headers.map(normalizeHeader);
  const find = (candidates: string[]) => {
    const index = normalized.findIndex((header) => candidates.includes(header));
    return index >= 0 ? headers[index] : undefined;
  };
  return {
    name: find(["nome", "empresa", "razao social", "razao_social", "razaosocial"]),
    razaoSocial: find(["razao social", "razao_social", "razaosocial"]),
    cnpj: find(["cnpj", "cpf/cnpj", "cpf cnpj", "cpfcnpj"]),
    contact: find(["contato", "contato (dono)", "responsavel"]),
    phone: find(["telefone", "fone", "celular"]),
    address: find(["endereco", "logradouro", "rua"]),
    email: find(["email", "e-mail", "mail"]),
    status: find(["status"]),
    city: find(["cidade"]),
    state: find(["estado", "uf"]),
  };
}

function parseXlsx(buffer: ArrayBuffer) {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json<(string | number)[]>(sheet, { header: 1, defval: "" });
  const headerRowIndex = data.findIndex((row) =>
    row.some((cell) => normalizeHeader(String(cell ?? "")) === "nome")
  );
  if (headerRowIndex < 0) {
    return { headers: [], rows: [] as Record<string, string>[] };
  }
  const headers = (data[headerRowIndex] ?? []).map((cell) => String(cell ?? "").trim());
  const rows = data.slice(headerRowIndex + 1).map((row) => {
    const values = row.map((cell) => String(cell ?? ""));
    const entry: Record<string, string> = {};
    headers.forEach((header, index) => {
      entry[header] = values[index] ?? "";
    });
    return entry;
  });
  return { headers, rows };
}
