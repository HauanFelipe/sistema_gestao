import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PrismaModule } from "./prisma/prisma.module";
import { CompaniesModule } from "./companies/companies.module";
import { FiscalFilesModule } from "./fiscal-files/fiscal-files.module";
import { UsersModule } from "./users/users.module";
import { AuthModule } from "./auth/auth.module";
import { WorkOrdersModule } from "./work-orders/work-orders.module";
import { FiscalBatchesModule } from "./fiscal-batches/fiscal-batches.module";
import { CalendarModule } from "./calendar/calendar.module";
import { MonthlyTasksService } from "./schedulers/monthly-tasks.service";
import { SystemModule } from "./system/system.module";

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    CompaniesModule,
    FiscalFilesModule,
    UsersModule,
    AuthModule,
    WorkOrdersModule,
    FiscalBatchesModule,
    CalendarModule,
    SystemModule,
  ],
  controllers: [AppController],
  providers: [AppService, MonthlyTasksService],
})
export class AppModule {}
