import { IsDateString, IsOptional, IsUUID } from "class-validator";

export class AttendanceReportQueryDto {
  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsOptional()
  @IsUUID()
  employeeId?: string;
}
