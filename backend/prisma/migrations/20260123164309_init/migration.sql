-- CreateEnum
CREATE TYPE "CompanyStatus" AS ENUM ('Ativa', 'Inativa');

-- CreateEnum
CREATE TYPE "WorkOrderStatus" AS ENUM ('Aberta', 'Em_andamento', 'Concluida', 'Nao_realizada', 'Reagendada', 'Cancelada');

-- CreateEnum
CREATE TYPE "WorkOrderPriority" AS ENUM ('Baixa', 'Media', 'Alta');

-- CreateEnum
CREATE TYPE "CalendarEventType" AS ENUM ('Visita', 'Treinamento');

-- CreateEnum
CREATE TYPE "FiscalBatchType" AS ENUM ('Entrada', 'Saida');

-- CreateEnum
CREATE TYPE "FiscalFileRunStatus" AS ENUM ('Gerado', 'Falhou');

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cnpj" TEXT,
    "contact" TEXT,
    "phone" TEXT,
    "generatesFiscalFiles" BOOLEAN NOT NULL DEFAULT false,
    "generatesFiscalProduction" BOOLEAN NOT NULL DEFAULT false,
    "tipoContribuinte" TEXT,
    "ie" TEXT,
    "razaoSocial" TEXT,
    "cep" TEXT,
    "rua" TEXT,
    "numero" TEXT,
    "bairro" TEXT,
    "cidade" TEXT,
    "estado" TEXT,
    "nomeFantasia" TEXT,
    "email" TEXT,
    "contabilidadeNome" TEXT,
    "contabilidadeEmail" TEXT,
    "contabilidadeTelefone" TEXT,
    "status" "CompanyStatus" NOT NULL DEFAULT 'Ativa',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkOrder" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "responsible" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "priority" "WorkOrderPriority" NOT NULL,
    "status" "WorkOrderStatus" NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkOrderHistory" (
    "id" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkOrderHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FiscalFile" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "responsible" TEXT,
    "observation" TEXT,
    "dayOfMonth" INTEGER NOT NULL,
    "nextGeneration" TIMESTAMP(3) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FiscalFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FiscalFileRun" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "competence" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "generatedBy" TEXT NOT NULL,
    "notes" TEXT,
    "status" "FiscalFileRunStatus" NOT NULL DEFAULT 'Gerado',

    CONSTRAINT "FiscalFileRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FiscalBatch" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "competence" TEXT NOT NULL,
    "type" "FiscalBatchType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "notes" TEXT,
    "launchDone" BOOLEAN NOT NULL DEFAULT false,
    "billingDone" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FiscalBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalendarEvent" (
    "id" TEXT NOT NULL,
    "type" "CalendarEventType" NOT NULL,
    "companyId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "time" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "responsible" TEXT NOT NULL,
    "notes" TEXT,

    CONSTRAINT "CalendarEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WorkOrder_companyId_idx" ON "WorkOrder"("companyId");

-- CreateIndex
CREATE INDEX "WorkOrderHistory_workOrderId_idx" ON "WorkOrderHistory"("workOrderId");

-- CreateIndex
CREATE INDEX "FiscalFile_companyId_idx" ON "FiscalFile"("companyId");

-- CreateIndex
CREATE INDEX "FiscalFileRun_companyId_idx" ON "FiscalFileRun"("companyId");

-- CreateIndex
CREATE INDEX "FiscalBatch_companyId_idx" ON "FiscalBatch"("companyId");

-- CreateIndex
CREATE INDEX "CalendarEvent_companyId_idx" ON "CalendarEvent"("companyId");

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrderHistory" ADD CONSTRAINT "WorkOrderHistory_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "WorkOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FiscalFile" ADD CONSTRAINT "FiscalFile_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FiscalFileRun" ADD CONSTRAINT "FiscalFileRun_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FiscalBatch" ADD CONSTRAINT "FiscalBatch_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarEvent" ADD CONSTRAINT "CalendarEvent_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
