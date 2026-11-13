import { ConflictException, Injectable } from "@nestjs/common";
import { PrismaService } from "../../infra/prisma/prisma.service";
import { CreatePermissionDto } from "./dto/create-permission.dto";

@Injectable()
export class PermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  list(companyId: string) {
    return this.prisma.permission.findMany({
      where: { companyId, deletedAt: null },
      orderBy: [{ resource: "asc" }, { action: "asc" }]
    });
  }

  async create(companyId: string, dto: CreatePermissionDto) {
    const existingPermission = await this.prisma.permission.findUnique({
      where: { companyId_code: { companyId, code: dto.code } }
    });
    if (existingPermission) throw new ConflictException("Permission code already exists");

    return this.prisma.permission.create({
      data: { companyId, ...dto }
    });
  }
}
