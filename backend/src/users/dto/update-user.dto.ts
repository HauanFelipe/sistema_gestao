import { UserRole } from "@prisma/client";

export class UpdateUserDto {
  name?: string;
  password?: string;
  role?: UserRole;
  active?: boolean;
}
