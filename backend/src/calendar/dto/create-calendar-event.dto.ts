import { CalendarEventType } from "@prisma/client";

export class CreateCalendarEventDto {
  type: CalendarEventType;
  companyId: string;
  date: string;
  time: string;
  location: string;
  responsible: string;
  notes?: string;
}
