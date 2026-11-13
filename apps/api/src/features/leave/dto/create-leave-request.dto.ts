import { IsDateString, IsOptional, IsString, IsUrl, IsUUID, MinLength } from "class-validator";

export class CreateLeaveRequestDto {
  @IsOptional()
  @IsUUID()
  employeeId?: string;

  @IsUUID()
  leaveTypeId!: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsString()
  @MinLength(8)
  reason!: string;

  @IsOptional()
  @IsUrl()
  attachmentUrl?: string;
}
