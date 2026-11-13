import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../infra/prisma/prisma.service";
import { AssignPermissionsDto } from "./dto/assign-permissions.dto";
import { CreateRoleDto } from "./dto/create-role.dto";

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  list(companyId: string) {
    return this.prisma.role.findMany({
      where: { companyId, deletedAt: null },
      include: { permissions: { include: { permission: true } } },
      orderBy: { name: "asc" }
    });
  }

  async create(companyId: string, dto: CreateRoleDto) {
    const existingRole = await this.prisma.role.findUnique({
      where: { companyId_code: { companyId, code: dto.code } }
    });
    if (existingRole) throw new ConflictException("Role code already exists");

    return this.prisma.role.create({
      data: { companyId, ...dto },
      include: { permissions: { include: { permission: true } } }
    });
  }

  async assignPermissions(companyId: string, roleId: string, dto: AssignPermissionsDto) {
    const role = await this.prisma.role.findFirst({ where: { id: roleId, companyId, deletedAt: null } });
    if (!role) throw new NotFoundException("Role not found");

    // Replace-all assignment makes permission updates idempotent and easier to reason about from admin UI.
    await this.prisma.$transaction([
      this.prisma.rolePermission.deleteMany({ where: { roleId } }),
      ...dto.permissionIds.map((permissionId) =>
        this.prisma.rolePermission.create({
          data: { roleId, permissionId }
        })
      )
    ]);

    return this.prisma.role.findUnique({
      where: { id: roleId },
      include: { permissions: { include: { permission: true } } }
    });
  }
}
