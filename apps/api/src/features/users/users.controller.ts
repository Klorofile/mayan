import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import type { JwtUser } from "../auth/types/jwt-user";
import { Permissions } from "../rbac/decorators/permissions.decorator";
import { PermissionsGuard } from "../rbac/guards/permissions.guard";
import { CreateUserDto } from "./dto/create-user.dto";
import { UsersService } from "./users.service";

@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles("SUPER_ADMIN", "HR_ADMIN")
  @Permissions("employee.read")
  list(@CurrentUser() user: JwtUser) {
    return this.usersService.list(user.companyId);
  }

  @Get(":id")
  @Roles("SUPER_ADMIN", "HR_ADMIN")
  @Permissions("employee.read")
  detail(@CurrentUser() user: JwtUser, @Param("id") id: string) {
    return this.usersService.detail(user.companyId, id);
  }

  @Post()
  @Roles("SUPER_ADMIN", "HR_ADMIN")
  @Permissions("employee.create")
  create(@CurrentUser() user: JwtUser, @Body() dto: CreateUserDto) {
    return this.usersService.create(user.companyId, dto);
  }
}
