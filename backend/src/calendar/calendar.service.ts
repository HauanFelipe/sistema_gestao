import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCalendarEventDto } from "./dto/create-calendar-event.dto";
import { UpdateCalendarEventDto } from "./dto/update-calendar-event.dto";

const parseDate = (value: string) => new Date(value);

@Injectable()
export class CalendarService {
  constructor(private readonly prisma: PrismaService) {}

  list(companyId?: string, dateFrom?: string, dateTo?: string) {
    const from = dateFrom ? parseDate(dateFrom) : undefined;
    const to = dateTo ? parseDate(dateTo) : undefined;
    return this.prisma.calendarEvent.findMany({
      where: {
        ...(companyId ? { companyId } : {}),
        ...(from || to
          ? {
              date: {
                ...(from ? { gte: from } : {}),
                ...(to ? { lte: to } : {}),
              },
            }
          : {}),
      },
      orderBy: { date: "asc" },
      include: { company: true },
    });
  }

  async get(id: string) {
    const event = await this.prisma.calendarEvent.findUnique({
      where: { id },
      include: { company: true },
    });
    if (!event) throw new NotFoundException("Evento nao encontrado");
    return event;
  }

  create(data: CreateCalendarEventDto) {
    return this.prisma.calendarEvent.create({
      data: {
        type: data.type,
        companyId: data.companyId,
        date: parseDate(data.date),
        time: data.time,
        location: data.location,
        responsible: data.responsible,
        notes: data.notes,
      },
      include: { company: true },
    });
  }

  async update(id: string, data: UpdateCalendarEventDto) {
    await this.get(id);
    const updateData: {
      type?: UpdateCalendarEventDto["type"];
      companyId?: string;
      date?: Date;
      time?: string;
      location?: string;
      responsible?: string;
      notes?: string;
    } = {
      type: data.type,
      companyId: data.companyId,
      time: data.time,
      location: data.location,
      responsible: data.responsible,
      notes: data.notes,
    };
    if (data.date) {
      updateData.date = parseDate(data.date);
    }
    return this.prisma.calendarEvent.update({
      where: { id },
      data: updateData,
      include: { company: true },
    });
  }

  async remove(id: string) {
    await this.get(id);
    return this.prisma.calendarEvent.delete({ where: { id } });
  }
}
