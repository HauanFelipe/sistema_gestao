import { FiscalBatchType } from "@prisma/client";

export class CreateFiscalBatchDto {
  companyId: string;
  competence: string;
  type: FiscalBatchType;
  quantity: number;
  notes?: string;
  launchDone?: boolean;
  billingDone?: boolean;
  createdBy?: string;
}
