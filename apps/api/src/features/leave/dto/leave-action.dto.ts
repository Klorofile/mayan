import { IsOptional, IsString } from "class-validator";

export class LeaveActionDto {
  @IsOptional()
  @IsString()
  note?: string;
}
