import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { FiscalBatchesService } from "./fiscal-batches.service";
import { CreateFiscalBatchDto } from "./dto/create-fiscal-batch.dto";
import { UpdateFiscalBatchDto } from "./dto/update-fiscal-batch.dto";

@Controller("fiscal-batches")
export class FiscalBatchesController {
  constructor(private readonly fiscalBatchesService: FiscalBatchesService) {}

  @Get()
  list(@Query("companyId") companyId?: string, @Query("competence") competence?: string) {
    return this.fiscalBatchesService.list(companyId, competence);
  }

  @Get(":id")
  get(@Param("id") id: string) {
    return this.fiscalBatchesService.get(id);
  }

  @Post()
  create(@Body() data: CreateFiscalBatchDto) {
    return this.fiscalBatchesService.create(data);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() data: UpdateFiscalBatchDto) {
    return this.fiscalBatchesService.update(id, data);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.fiscalBatchesService.remove(id);
  }
}
