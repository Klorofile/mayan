import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { compare, hash } from "bcryptjs";
import { PrismaService } from "../../infra/prisma/prisma.service";
import { DEFAULT_PERMISSIONS, DEFAULT_ROLES, ROLE_PERMISSION_MATRIX } from "./constants/default-rbac";
import { LoginDto } from "./dto/login.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { RegisterAdminDto } from "./dto/register-admin.dto";
import type { AuthResponse } from "./types/auth-response";
import type { JwtUser } from "./types/jwt-user";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService
  ) {}

  async registerAdmin(dto: RegisterAdminDto): Promise<AuthResponse> {
    const existingCompany = await this.prisma.company.findUnique({ where: { companyCode: dto.companyCode } });
    if (existingCompany) {
      throw new ConflictException("Company code already exists");
    }

    const existingUser = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existingUser) {
      throw new ConflictException("Email already registered");
    }

    const passwordHash = await hash(dto.password, 12);

    const user = await this.prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: {
          companyCode: dto.companyCode,
          name: dto.companyName,
          email: dto.email
        }
      });

      const permissions = await Promise.all(
        DEFAULT_PERMISSIONS.map((code) => {
          const [resource, action] = code.split(".");
          return tx.permission.create({
            data: {
              companyId: company.id,
              code,
              resource,
              action,
              description: `Allows ${action} access on ${resource}`
            }
          });
        })
      );

      const permissionByCode = new Map(permissions.map((permission) => [permission.code, permission]));

      const roles = await Promise.all(
        DEFAULT_ROLES.map((code) =>
          tx.role.create({
            data: {
              companyId: company.id,
              code,
              name: code
                .split("_")
                .map((word) => word[0] + word.slice(1).toLowerCase())
                .join(" "),
              isSystem: true
            }
          })
        )
      );

      await Promise.all(
        roles.flatMap((role) =>
          ROLE_PERMISSION_MATRIX[role.code as keyof typeof ROLE_PERMISSION_MATRIX].map((permissionCode) =>
            tx.rolePermission.create({
              data: {
                roleId: role.id,
                permissionId: permissionByCode.get(permissionCode)!.id
              }
            })
          )
        )
      );

      const superAdminRole = roles.find((role) => role.code === "SUPER_ADMIN")!;

      // Admin registration bootstraps the tenant: company, RBAC catalog, and the first user are committed atomically.
      return tx.user.create({
        data: {
          companyId: company.id,
          email: dto.email,
          passwordHash,
          roles: {
            create: { roleId: superAdminRole.id }
          }
        },
        include: this.authUserInclude()
      });
    });

    return this.issueTokens(this.toJwtUser(user, dto.fullName));
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: this.authUserInclude()
    });

    if (!user || !user.isActive || user.deletedAt || !(await compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException("Invalid email or password");
    }

    await this.prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

    return this.issueTokens(this.toJwtUser(user));
  }

  async refresh(dto: RefreshTokenDto): Promise<AuthResponse> {
    try {
      const payload = await this.jwt.verifyAsync<JwtUser>(dto.refreshToken, {
        secret: this.config.getOrThrow<string>("JWT_REFRESH_SECRET")
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: this.authUserInclude()
      });

      if (!user || !user.isActive || user.deletedAt) {
        throw new UnauthorizedException("User is no longer active");
      }

      return this.issueTokens(this.toJwtUser(user));
    } catch {
      throw new UnauthorizedException("Invalid refresh token");
    }
  }

  private authUserInclude() {
    return {
      employee: true,
      roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } }
    } as const;
  }

  private toJwtUser(
    user: Awaited<ReturnType<typeof this.prisma.user.findUnique>> & {
      employee?: { fullName: string } | null;
      roles: { role: { code: string; permissions: { permission: { code: string } }[] } }[];
    },
    fallbackName?: string
  ): JwtUser {
    return {
      sub: user!.id,
      companyId: user!.companyId,
      employeeId: user!.employeeId ?? undefined,
      email: user!.email,
      name: user!.employee?.fullName ?? fallbackName ?? user!.email,
      roles: user!.roles.map(({ role }) => role.code),
      permissions: [
        ...new Set(user!.roles.flatMap(({ role }) => role.permissions.map(({ permission }) => permission.code)))
      ]
    };
  }

  private async issueTokens(payload: JwtUser): Promise<AuthResponse> {
    return {
      accessToken: await this.jwt.signAsync(payload),
      refreshToken: await this.jwt.signAsync(payload, {
        secret: this.config.getOrThrow<string>("JWT_REFRESH_SECRET"),
        expiresIn: this.config.get<string>("JWT_REFRESH_EXPIRES_IN", "7d")
      }),
      user: { id: payload.sub, ...payload }
    };
  }
}
