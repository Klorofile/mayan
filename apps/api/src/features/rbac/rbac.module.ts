import { Module } from "@nestjs/common";
import { PermissionsGuard } from "./guards/permissions.guard";
import { RbacController } from "./rbac.controller";
import { RbacService } from "./rbac.service";

@Module({
  controllers: [RbacController],
  providers: [RbacService, PermissionsGuard],
  exports: [RbacService, PermissionsGuard]
})
export class RbacModule {}
