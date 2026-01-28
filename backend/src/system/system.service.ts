import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class SystemService {
  constructor(private readonly prisma: PrismaService) {}

  listLogs(limit = 10) {
    return this.prisma.systemLog.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
    });
  }
}
