import { IsOptional, IsString } from "class-validator";

export class CreatePermissionDto {
  @IsString()
  code!: string;

  @IsString()
  resource!: string;

  @IsString()
  action!: string;

  @IsOptional()
  @IsString()
  description?: string;
}
