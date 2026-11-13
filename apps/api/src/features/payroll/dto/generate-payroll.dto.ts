import { IsOptional, IsUUID } from "class-validator";

export class GeneratePayrollDto {
  @IsOptional()
  @IsUUID()
  employeeId?: string;
}
