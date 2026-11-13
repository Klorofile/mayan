import { SalaryStatus } from "@prisma/client";
import { Type } from "class-transformer";
import { IsDateString, IsEnum, IsNumber, IsOptional, IsUUID, Min } from "class-validator";

export class AssignEmployeeSalaryComponentDto {
  @IsUUID()
  salaryComponentId!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amount!: number;

  @IsDateString()
  effectiveFrom!: string;

  @IsOptional()
  @IsDateString()
  effectiveTo?: string;

  @IsOptional()
  @IsEnum(SalaryStatus)
  status?: SalaryStatus;
}
