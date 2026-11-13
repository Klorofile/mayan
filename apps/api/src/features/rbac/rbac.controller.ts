import { Controller, Get, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import type { JwtUser } from "../auth/types/jwt-user";
import { Permissions } from "./decorators/permissions.decorator";
import { PermissionsGuard } from "./guards/permissions.guard";
import { RbacService } from "./rbac.service";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("rbac")
export class RbacController {
  constructor(private readonly rbacService: RbacService) {}

  @Get("roles")
  @Permissions("role.read")
  roles(@CurrentUser() user: JwtUser) {
    return this.rbacService.listRoles(user.companyId);
  }

  @Get("permissions")
  @Permissions("permission.read")
  permissions(@CurrentUser() user: JwtUser) {
    return this.rbacService.listPermissions(user.companyId);
  }
}
