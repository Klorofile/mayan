import { Module } from "@nestjs/common";
import { RolesGuard } from "../auth/guards/roles.guard";
import { PermissionsGuard } from "../rbac/guards/permissions.guard";
import { RolesController } from "./roles.controller";
import { RolesService } from "./roles.service";

@Module({
  controllers: [RolesController],
  providers: [RolesService, RolesGuard, PermissionsGuard],
  exports: [RolesService]
})
export class RolesModule {}
