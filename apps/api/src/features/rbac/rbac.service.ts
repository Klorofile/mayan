import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../infra/prisma/prisma.service";

@Injectable()
export class RbacService {
  constructor(private readonly prisma: PrismaService) {}

  listRoles(companyId: string) {
    return this.prisma.role.findMany({
      where: { companyId, deletedAt: null },
      orderBy: { name: "asc" },
      include: { permissions: { include: { permission: true } } }
    });
  }

  listPermissions(companyId: string) {
    // RBAC catalog is tenant-scoped; never expose roles/permissions from another company.
    return this.prisma.permission.findMany({
      where: { companyId, deletedAt: null },
      orderBy: [{ resource: "asc" }, { action: "asc" }]
    });
  }
}
