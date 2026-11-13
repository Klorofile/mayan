import { IsOptional, IsString } from "class-validator";

export class ApproveAttendanceCorrectionDto {
  @IsOptional()
  @IsString()
  reviewerNote?: string;
}
