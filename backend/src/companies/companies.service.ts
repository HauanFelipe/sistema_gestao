import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCompanyDto } from "./dto/create-company.dto";
import { UpdateCompanyDto } from "./dto/update-company.dto";

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    return this.prisma.company.findMany({ orderBy: { name: "asc" } });
  }

  async get(id: string) {
    const company = await this.prisma.company.findUnique({ where: { id } });
    if (!company) throw new NotFoundException("Empresa nao encontrada");
    return company;
  }

  async create(data: CreateCompanyDto) {
    return this.prisma.company.create({ data });
  }

  async update(id: string, data: UpdateCompanyDto) {
    const exists = await this.prisma.company.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException("Empresa nao encontrada");
    return this.prisma.company.update({ where: { id }, data });
  }

  async remove(id: string) {
    const exists = await this.prisma.company.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException("Empresa nao encontrada");
    await this.prisma.company.delete({ where: { id } });
    return { ok: true };
  }
}
