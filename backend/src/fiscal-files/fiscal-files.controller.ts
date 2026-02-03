import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { FiscalFilesService } from "./fiscal-files.service";
import { MarkGeneratedDto } from "./dto/mark-generated.dto";
import { UpdateFiscalFileDto } from "./dto/update-fiscal-file.dto";

@Controller("fiscal-files")
export class FiscalFilesController {
  constructor(private readonly fiscalFilesService: FiscalFilesService) {}

  @Get()
  listAll() {
    return this.fiscalFilesService.listAll();
  }

  @Get("pending")
  listPending() {
    return this.fiscalFilesService.listPending();
  }

  @Get("runs")
  listRuns() {
    return this.fiscalFilesService.listRuns();
  }

  @Get("runs/:companyId")
  listRunsByCompany(@Param("companyId") companyId: string, @Query("competence") competence?: string) {
    return this.fiscalFilesService.listRunsByCompany(companyId, competence);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() data: UpdateFiscalFileDto) {
    return this.fiscalFilesService.update(id, data);
  }

  @Post(":id/generate")
  markGenerated(@Param("id") id: string, @Body() data: MarkGeneratedDto) {
    return this.fiscalFilesService.markGenerated(id, data);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.fiscalFilesService.remove(id);
  }
}
