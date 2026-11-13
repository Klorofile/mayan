import { IsDateString, IsOptional, IsString, MinLength } from "class-validator";

export class CreatePayrollPeriodDto {
  @IsString()
  code!: string;

  @IsString()
  @MinLength(2)
  name!: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsOptional()
  @IsDateString()
  paymentDate?: string;
}
