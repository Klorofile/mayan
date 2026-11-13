import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../decorators/roles.decorator";
import type { JwtUser } from "../types/jwt-user";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    if (!requiredRoles?.length) return true;

    const user = context.switchToHttp().getRequest<{ user?: JwtUser }>().user;
    const allowed = requiredRoles.some((role) => user?.roles?.includes(role));

    if (!allowed) {
      throw new ForbiddenException("You do not have the required role");
    }

    return true;
  }
}
