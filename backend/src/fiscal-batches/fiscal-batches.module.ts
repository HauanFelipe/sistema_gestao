import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { FiscalBatchesController } from "./fiscal-batches.controller";
import { FiscalBatchesService } from "./fiscal-batches.service";

@Module({
  imports: [PrismaModule],
  controllers: [FiscalBatchesController],
  providers: [FiscalBatchesService],
})
export class FiscalBatchesModule {}
