import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { hash } from "bcryptjs";
import { PrismaService } from "../../infra/prisma/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateUserDto) {
    const existingUser = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existingUser) {
      throw new ConflictException("Email already registered");
    }

    // Passwords are never stored in plain text; bcrypt cost 12 is a sane default for application auth.
    return this.prisma.user.create({
      data: {
        companyId,
        email: dto.email,
        passwordHash: await hash(dto.password, 12),
        employeeId: dto.employeeId,
        roles: dto.roleIds?.length
          ? {
              create: dto.roleIds.map((roleId) => ({ roleId }))
            }
          : undefined
      },
      select: this.safeUserSelect()
    });
  }

  list(companyId: string) {
    return this.prisma.user.findMany({
      where: { companyId, deletedAt: null },
      orderBy: { createdAt: "desc" },
      select: this.safeUserSelect()
    });
  }

  async detail(companyId: string, id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, companyId, deletedAt: null },
      select: this.safeUserSelect()
    });

    if (!user) throw new NotFoundException("User not found");
    return user;
  }

  private safeUserSelect() {
    return {
      id: true,
      companyId: true,
      employeeId: true,
      email: true,
      isActive: true,
      lastLoginAt: true,
      roles: { select: { role: { select: { id: true, code: true, name: true } } } },
      createdAt: true,
      updatedAt: true
    } as const;
  }
}
