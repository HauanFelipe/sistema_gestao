import { WorkOrderPriority, WorkOrderStatus } from "@prisma/client";

export class CreateWorkOrderDto {
  number?: string;
  companyId: string;
  type: string;
  responsible: string;
  dueDate: string;
  priority: WorkOrderPriority;
  status: WorkOrderStatus;
  description?: string;
}
