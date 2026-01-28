import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { CalendarService } from "./calendar.service";
import { CreateCalendarEventDto } from "./dto/create-calendar-event.dto";
import { UpdateCalendarEventDto } from "./dto/update-calendar-event.dto";

@Controller("calendar")
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get()
  list(
    @Query("companyId") companyId?: string,
    @Query("dateFrom") dateFrom?: string,
    @Query("dateTo") dateTo?: string,
  ) {
    return this.calendarService.list(companyId, dateFrom, dateTo);
  }

  @Get(":id")
  get(@Param("id") id: string) {
    return this.calendarService.get(id);
  }

  @Post()
  create(@Body() data: CreateCalendarEventDto) {
    return this.calendarService.create(data);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() data: UpdateCalendarEventDto) {
    return this.calendarService.update(id, data);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.calendarService.remove(id);
  }
}
