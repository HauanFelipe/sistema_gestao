import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { WorkOrdersService } from "./work-orders.service";
import { CreateWorkOrderDto } from "./dto/create-work-order.dto";
import { UpdateWorkOrderDto } from "./dto/update-work-order.dto";
import { CreateWorkOrderHistoryDto } from "./dto/create-work-order-history.dto";

@Controller("work-orders")
export class WorkOrdersController {
  constructor(private readonly workOrdersService: WorkOrdersService) {}

  @Get()
  list() {
    return this.workOrdersService.list();
  }

  @Get(":id")
  get(@Param("id") id: string) {
    return this.workOrdersService.get(id);
  }

  @Post()
  create(@Body() data: CreateWorkOrderDto) {
    return this.workOrdersService.create(data);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() data: UpdateWorkOrderDto) {
    return this.workOrdersService.update(id, data);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.workOrdersService.remove(id);
  }

  @Post(":id/history")
  addHistory(@Param("id") id: string, @Body() data: CreateWorkOrderHistoryDto) {
    return this.workOrdersService.addHistory(id, data);
  }
}
