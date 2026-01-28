import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateFiscalBatchDto } from "./dto/create-fiscal-batch.dto";
import { UpdateFiscalBatchDto } from "./dto/update-fiscal-batch.dto";

@Injectable()
export class FiscalBatchesService {
  constructor(private readonly prisma: PrismaService) {}

  list(companyId?: string, competence?: string) {
    return this.prisma.fiscalBatch.findMany({
      where: {
        ...(companyId ? { companyId } : {}),
        ...(competence ? { competence } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: { company: true },
    });
  }

  async get(id: string) {
    const batch = await this.prisma.fiscalBatch.findUnique({
      where: { id },
      include: { company: true },
    });
    if (!batch) throw new NotFoundException("Lancamento nao encontrado");
    return batch;
  }

  create(data: CreateFiscalBatchDto) {
    return this.prisma.fiscalBatch.create({
      data: {
        companyId: data.companyId,
        competence: data.competence,
        type: data.type,
        quantity: data.quantity,
        notes: data.notes,
        launchDone: data.launchDone ?? false,
        billingDone: data.billingDone ?? false,
        createdBy: data.createdBy,
      },
      include: { company: true },
    });
  }

  async update(id: string, data: UpdateFiscalBatchDto) {
    await this.get(id);
    return this.prisma.fiscalBatch.update({
      where: { id },
      data: {
        companyId: data.companyId,
        competence: data.competence,
        type: data.type,
        quantity: data.quantity,
        notes: data.notes,
        launchDone: data.launchDone,
        billingDone: data.billingDone,
        createdBy: data.createdBy,
      },
      include: { company: true },
    });
  }

  async remove(id: string) {
    await this.get(id);
    return this.prisma.fiscalBatch.delete({ where: { id } });
  }
}
