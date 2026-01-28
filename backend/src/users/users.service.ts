import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.user.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        role: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async get(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        role: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) throw new NotFoundException("Usuario nao encontrado");
    return user;
  }

  async create(data: CreateUserDto) {
    return this.prisma.user.create({
      data: {
        name: data.name,
        passwordHash: data.password,
        role: data.role ?? "Colaborador",
      },
    });
  }

  async update(id: string, data: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException("Usuario nao encontrado");
    return this.prisma.user.update({
      where: { id: user.id },
      data: {
        name: data.name ?? user.name,
        passwordHash: data.password ? data.password : user.passwordHash,
        role: data.role ?? user.role,
        active: typeof data.active === "boolean" ? data.active : user.active,
      },
    });
  }

  async remove(id: string) {
    await this.get(id);
    return this.prisma.user.delete({ where: { id } });
  }
}
