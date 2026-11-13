import type { JwtUser } from "./jwt-user";

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: JwtUser & { id: string };
};
