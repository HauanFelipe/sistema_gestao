import { Controller, Get, Post, Query } from "@nestjs/common";
import { SystemService } from "./system.service";
import { MonthlyTasksService } from "../schedulers/monthly-tasks.service";

@Controller("system")
export class SystemController {
  constructor(
    private readonly systemService: SystemService,
    private readonly monthlyTasksService: MonthlyTasksService
  ) {}

  @Get("logs")
  listLogs(@Query("limit") limit?: string) {
    const parsed = Number(limit ?? 10);
    const safeLimit = Number.isFinite(parsed) ? Math.min(Math.max(parsed, 1), 50) : 10;
    return this.systemService.listLogs(safeLimit);
  }

  @Post("run-monthly")
  runMonthly() {
    return this.monthlyTasksService.handleMonthlyCreation();
  }
}
