import { ContractStatus } from "@prisma/client";
import { IsDateString, IsEnum, IsOptional, IsString, IsUrl } from "class-validator";

export class CreateEmployeeContractDto {
  @IsString()
  contractNumber!: string;

  @IsString()
  contractType!: string;

  @IsDateString()
  startDate!: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsUrl()
  fileUrl?: string;

  @IsOptional()
  @IsEnum(ContractStatus)
  status?: ContractStatus;
}
