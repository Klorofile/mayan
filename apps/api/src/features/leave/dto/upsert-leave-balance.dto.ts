import { Type } from "class-transformer";
import { IsInt, IsNumber, IsUUID, Max, Min } from "class-validator";

export class UpsertLeaveBalanceDto {
  @IsUUID()
  employeeId!: string;

  @IsUUID()
  leaveTypeId!: string;

  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  year!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  openingBalance!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  accrued!: number;
}
