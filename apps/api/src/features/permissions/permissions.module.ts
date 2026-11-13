import { Module } from "@nestjs/common";
import { RolesGuard } from "../auth/guards/roles.guard";
import { PermissionsGuard } from "../rbac/guards/permissions.guard";
import { PermissionsController } from "./permissions.controller";
import { PermissionsService } from "./permissions.service";

@Module({
  controllers: [PermissionsController],
  providers: [PermissionsService, RolesGuard, PermissionsGuard],
  exports: [PermissionsService]
})
export class PermissionsModule {}
