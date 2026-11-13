import { IsDateString, IsOptional, IsString, IsUUID, MinLength } from "class-validator";

export class CreateAttendanceCorrectionDto {
  @IsOptional()
  @IsUUID()
  attendanceId?: string;

  @IsOptional()
  @IsUUID()
  employeeId?: string;

  @IsOptional()
  @IsDateString()
  requestedClockInAt?: string;

  @IsOptional()
  @IsDateString()
  requestedClockOutAt?: string;

  @IsString()
  @MinLength(8)
  reason!: string;
}
