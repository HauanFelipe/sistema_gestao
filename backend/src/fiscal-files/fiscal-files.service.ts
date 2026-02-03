import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { MarkGeneratedDto } from "./dto/mark-generated.dto";
import { UpdateFiscalFileDto } from "./dto/update-fiscal-file.dto";

const currentCompetence = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

const currentMonthStart = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
};

@Injectable()
export class FiscalFilesService {
  constructor(private readonly prisma: PrismaService) {}

  async listAll() {
    return this.prisma.fiscalFile.findMany({
      orderBy: { company: { name: "asc" } },
      include: { company: true },
    });
  }

  async listPending() {
    const competence = currentCompetence();
    const runs = await this.prisma.fiscalFileRun.findMany({
      where: { competence },
      select: { companyId: true },
    });
    const doneCompanies = new Set(runs.map((run) => run.companyId));
    const files = await this.prisma.fiscalFile.findMany({
      where: { active: true },
      include: { company: true },
      orderBy: { company: { name: "asc" } },
    });
    return files.filter((file) => !doneCompanies.has(file.companyId));
  }

  async listRuns() {
    return this.prisma.fiscalFileRun.findMany({
      orderBy: { generatedAt: "desc" },
    });
  }

  async listRunsByCompany(companyId: string, competence?: string) {
    return this.prisma.fiscalFileRun.findMany({
      where: {
        companyId,
        ...(competence ? { competence } : {}),
      },
      orderBy: { generatedAt: "desc" },
    });
  }

  async update(id: string, data: UpdateFiscalFileDto) {
    const exists = await this.prisma.fiscalFile.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException("Configuracao nao encontrada");
    return this.prisma.fiscalFile.update({
      where: { id },
      data: {
        responsible: data.responsible ?? exists.responsible,
        observation: data.observation ?? exists.observation,
      },
    });
  }

  async markGenerated(id: string, data: MarkGeneratedDto) {
    const file = await this.prisma.fiscalFile.findUnique({ where: { id }, include: { company: true } });
    if (!file) throw new NotFoundException("Configuracao nao encontrada");

    const competence = currentCompetence();
    const existingRun = await this.prisma.fiscalFileRun.findFirst({
      where: { companyId: file.companyId, competence },
    });
    if (existingRun) {
      return existingRun;
    }

    const generatedBy = data.responsible?.trim() || file.responsible || "Usuario";
    const run = await this.prisma.fiscalFileRun.create({
      data: {
        companyId: file.companyId,
        competence,
        generatedBy,
        notes: data.notes ?? file.observation,
        status: "Gerado",
      },
    });

    await this.prisma.fiscalFile.update({
      where: { id: file.id },
      data: {
        responsible: generatedBy,
        nextGeneration: currentMonthStart(),
        active: true,
      },
    });

    return run;
  }

  async remove(id: string) {
    const exists = await this.prisma.fiscalFile.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException("Configuracao nao encontrada");
    return this.prisma.fiscalFile.delete({ where: { id } });
  }
}
