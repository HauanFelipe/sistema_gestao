import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { PrismaService } from "../prisma/prisma.service";

const currentCompetence = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

const currentMonthStart = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
};

@Injectable()
export class MonthlyTasksService {
  private readonly logger = new Logger(MonthlyTasksService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron("0 0 1 * *")
  async handleMonthlyCreation() {
    const competence = currentCompetence();
    const monthStart = currentMonthStart();
    this.logger.log(`Gerando chamados do mes ${competence}.`);

    const companies = await this.prisma.company.findMany({
      where: {
        status: "Ativa",
        OR: [{ generatesFiscalFiles: true }, { generatesFiscalProduction: true }],
      },
    });

    for (const company of companies) {
      if (company.generatesFiscalFiles) {
        const existingFile = await this.prisma.fiscalFile.findFirst({
          where: { companyId: company.id },
        });
        if (!existingFile) {
          await this.prisma.fiscalFile.create({
            data: {
              companyId: company.id,
              dayOfMonth: 1,
              nextGeneration: monthStart,
              active: true,
            },
          });
        } else {
          await this.prisma.fiscalFile.update({
            where: { id: existingFile.id },
            data: {
              nextGeneration: monthStart,
              active: true,
            },
          });
        }
      }

      if (company.generatesFiscalProduction) {
        for (const type of ["Entrada", "Saida"] as const) {
          const existingBatch = await this.prisma.fiscalBatch.findFirst({
            where: {
              companyId: company.id,
              competence,
              type,
            },
          });
          if (!existingBatch) {
            await this.prisma.fiscalBatch.create({
              data: {
                companyId: company.id,
                competence,
                type,
                quantity: 0,
                launchDone: false,
                billingDone: false,
                createdBy: "Sistema",
              },
            });
          }
        }
      }
    }

    await this.prisma.systemLog.create({
      data: {
        type: "monthly",
        message: `Chamados do mes ${competence} gerados para ${companies.length} empresa(s).`,
      },
    });
  }
}
