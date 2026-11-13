import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { JwtUser } from "../../auth/types/jwt-user";
import { PERMISSIONS_KEY } from "../decorators/permissions.decorator";

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    if (!required?.length) return true;

    const user = context.switchToHttp().getRequest<{ user?: JwtUser }>().user;
    const allowed = required.every((permission) => user?.permissions?.includes(permission));

    if (!allowed) {
      throw new ForbiddenException("You do not have the required permission");
    }

    return true;
  }
}
