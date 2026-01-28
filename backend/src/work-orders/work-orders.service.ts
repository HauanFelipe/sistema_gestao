import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateWorkOrderDto } from "./dto/create-work-order.dto";
import { CreateWorkOrderHistoryDto } from "./dto/create-work-order-history.dto";
import { UpdateWorkOrderDto } from "./dto/update-work-order.dto";

const parseDate = (value: string) => new Date(value);

@Injectable()
export class WorkOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.workOrder.findMany({
      orderBy: { createdAt: "desc" },
      include: { company: true, history: { orderBy: { at: "desc" } } },
    });
  }

  async get(id: string) {
    const workOrder = await this.prisma.workOrder.findUnique({
      where: { id },
      include: { company: true, history: { orderBy: { at: "desc" } } },
    });
    if (!workOrder) throw new NotFoundException("OS nao encontrada");
    return workOrder;
  }

  create(data: CreateWorkOrderDto) {
    const createRecord = async (number: string) =>
      this.prisma.workOrder.create({
        data: {
          number,
        companyId: data.companyId,
        type: data.type,
        responsible: data.responsible,
        dueDate: parseDate(data.dueDate),
        priority: data.priority,
        status: data.status,
        description: data.description,
        },
        include: { company: true, history: { orderBy: { at: "desc" } } },
      });
    if (data.number) {
      return createRecord(data.number);
    }
    return this.prisma.workOrder
      .findMany({ select: { number: true } })
      .then((rows) => {
        const max = rows.reduce((acc, row) => {
          const value = Number(row.number);
          return Number.isFinite(value) ? Math.max(acc, value) : acc;
        }, 1000);
        return createRecord(String(max + 1));
      });
  }

  async update(id: string, data: UpdateWorkOrderDto) {
    await this.get(id);
    const updateData: {
      number?: string;
      companyId?: string;
      type?: string;
      responsible?: string;
      dueDate?: Date;
      priority?: UpdateWorkOrderDto["priority"];
      status?: UpdateWorkOrderDto["status"];
      description?: string;
    } = {
      number: data.number,
      companyId: data.companyId,
      type: data.type,
      responsible: data.responsible,
      priority: data.priority,
      status: data.status,
      description: data.description,
    };
    if (data.dueDate) {
      updateData.dueDate = parseDate(data.dueDate);
    }
    return this.prisma.workOrder.update({
      where: { id },
      data: updateData,
      include: { company: true, history: { orderBy: { at: "desc" } } },
    });
  }

  async remove(id: string) {
    await this.get(id);
    return this.prisma.workOrder.delete({ where: { id } });
  }

  async addHistory(id: string, data: CreateWorkOrderHistoryDto) {
    await this.get(id);
    return this.prisma.workOrderHistory.create({
      data: {
        workOrderId: id,
        title: data.title,
        description: data.description,
      },
    });
  }
}
