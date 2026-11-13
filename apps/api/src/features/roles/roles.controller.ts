import { Body, Controller, Get, Param, Post, Put, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import type { JwtUser } from "../auth/types/jwt-user";
import { Permissions } from "../rbac/decorators/permissions.decorator";
import { PermissionsGuard } from "../rbac/guards/permissions.guard";
import { AssignPermissionsDto } from "./dto/assign-permissions.dto";
import { CreateRoleDto } from "./dto/create-role.dto";
import { RolesService } from "./roles.service";

@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller("roles")
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @Roles("SUPER_ADMIN", "HR_ADMIN")
  list(@CurrentUser() user: JwtUser) {
    return this.rolesService.list(user.companyId);
  }

  @Post()
  @Roles("SUPER_ADMIN")
  create(@CurrentUser() user: JwtUser, @Body() dto: CreateRoleDto) {
    return this.rolesService.create(user.companyId, dto);
  }

  @Put(":id/permissions")
  @Roles("SUPER_ADMIN")
  assignPermissions(@CurrentUser() user: JwtUser, @Param("id") id: string, @Body() dto: AssignPermissionsDto) {
    return this.rolesService.assignPermissions(user.companyId, id, dto);
  }
}
