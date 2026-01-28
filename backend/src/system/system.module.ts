import { Module } from "@nestjs/common";
import { MonthlyTasksService } from "../schedulers/monthly-tasks.service";
import { SystemController } from "./system.controller";
import { SystemService } from "./system.service";

@Module({
  controllers: [SystemController],
  providers: [SystemService, MonthlyTasksService],
})
export class SystemModule {}
