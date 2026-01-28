import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { CompaniesService } from "./companies.service";
import { CreateCompanyDto } from "./dto/create-company.dto";
import { UpdateCompanyDto } from "./dto/update-company.dto";

@Controller("companies")
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  list() {
    return this.companiesService.list();
  }

  @Get(":id")
  get(@Param("id") id: string) {
    return this.companiesService.get(id);
  }

  @Post()
  create(@Body() body: CreateCompanyDto) {
    return this.companiesService.create(body);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() body: UpdateCompanyDto) {
    return this.companiesService.update(id, body);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.companiesService.remove(id);
  }
}
