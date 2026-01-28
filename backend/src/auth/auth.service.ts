import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { LoginDto } from "./dto/login.dto";

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async login(data: LoginDto) {
    const identifier = data.username?.trim();
    const user = await this.prisma.user.findFirst({
      where: { name: identifier },
    });
    if (!user || !user.active) throw new UnauthorizedException("Credenciais invalidas");
    if (user.passwordHash !== data.password) {
      throw new UnauthorizedException("Credenciais invalidas");
    }
    const token = Buffer.from(`${user.id}:${Date.now()}`).toString("base64");
    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}
