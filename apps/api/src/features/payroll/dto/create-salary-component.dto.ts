import { CalculationType, SalaryComponentType } from "@prisma/client";
import { Type } from "class-transformer";
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Min, MinLength } from "class-validator";

export class CreateSalaryComponentDto {
  @IsString()
  code!: string;

  @IsString()
  @MinLength(2)
  name!: string;

  @IsEnum(SalaryComponentType)
  type!: SalaryComponentType;

  @IsOptional()
  @IsEnum(CalculationType)
  calculationType?: CalculationType;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  defaultAmount?: number;

  @IsOptional()
  @IsBoolean()
  isTaxable?: boolean;
}
