import { IsOptional, IsString, MinLength } from "class-validator";

export class CreateRoleDto {
  @IsString()
  code!: string;

  @IsString()
  @MinLength(2)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;
}
