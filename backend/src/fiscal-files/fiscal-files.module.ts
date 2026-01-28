import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { FiscalFilesController } from "./fiscal-files.controller";
import { FiscalFilesService } from "./fiscal-files.service";

@Module({
  imports: [PrismaModule],
  controllers: [FiscalFilesController],
  providers: [FiscalFilesService],
})
export class FiscalFilesModule {}
