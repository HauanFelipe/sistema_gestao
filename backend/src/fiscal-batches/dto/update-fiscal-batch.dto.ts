import { FiscalBatchType } from "@prisma/client";

export class UpdateFiscalBatchDto {
  companyId?: string;
  competence?: string;
  type?: FiscalBatchType;
  quantity?: number;
  notes?: string;
  launchDone?: boolean;
  billingDone?: boolean;
  createdBy?: string;
}
