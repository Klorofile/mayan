import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { JwtUser } from "../types/jwt-user";

export const CurrentUser = createParamDecorator((_: unknown, context: ExecutionContext): JwtUser => {
  const request = context.switchToHttp().getRequest();
  return request.user;
});
