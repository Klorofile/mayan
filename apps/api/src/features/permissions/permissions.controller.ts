import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import type { JwtUser } from "../auth/types/jwt-user";
import { Permissions } from "../rbac/decorators/permissions.decorator";
import { PermissionsGuard } from "../rbac/guards/permissions.guard";
import { CreatePermissionDto } from "./dto/create-permission.dto";
import { PermissionsService } from "./permissions.service";

@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller("permissions")
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  @Roles("SUPER_ADMIN", "HR_ADMIN")
  list(@CurrentUser() user: JwtUser) {
    return this.permissionsService.list(user.companyId);
  }

  @Post()
  @Roles("SUPER_ADMIN")
  create(@CurrentUser() user: JwtUser, @Body() dto: CreatePermissionDto) {
    return this.permissionsService.create(user.companyId, dto);
  }
}
