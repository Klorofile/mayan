import { Controller, Get, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import type { JwtUser } from "../auth/types/jwt-user";
import { Permissions } from "../rbac/decorators/permissions.decorator";
import { PermissionsGuard } from "../rbac/guards/permissions.guard";
import { DashboardService } from "./dashboard.service";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("dashboard")
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get("summary")
  @Permissions("dashboard.read")
  summary(@CurrentUser() user: JwtUser) {
    // Summary selalu memakai companyId dari token supaya user tidak bisa membaca data company lain.
    return this.dashboardService.summary(user.companyId);
  }
}
