import { DocumentStatus } from "@prisma/client";
import { IsDateString, IsEnum, IsOptional, IsString, IsUrl } from "class-validator";

export class CreateEmployeeDocumentDto {
  @IsString()
  documentType!: string;

  @IsOptional()
  @IsString()
  documentNumber?: string;

  @IsString()
  fileName!: string;

  @IsUrl()
  fileUrl!: string;

  @IsOptional()
  @IsDateString()
  issuedAt?: string;

  @IsOptional()
  @IsDateString()
  expiredAt?: string;

  @IsOptional()
  @IsEnum(DocumentStatus)
  status?: DocumentStatus;
}
