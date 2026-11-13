import { EmploymentStatus, Gender, MaritalStatus } from "@prisma/client";
import { IsDateString, IsEmail, IsEnum, IsOptional, IsString, IsUrl, IsUUID, MinLength } from "class-validator";

export class CreateEmployeeDto {
  @IsString()
  employeeNumber!: string;

  @IsString()
  @MinLength(2)
  fullName!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsUrl()
  photoUrl?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsEnum(MaritalStatus)
  maritalStatus?: MaritalStatus;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsUUID()
  branchId?: string;

  @IsOptional()
  @IsUUID()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsUUID()
  positionId?: string;

  @IsOptional()
  @IsUUID()
  workScheduleId?: string;

  @IsOptional()
  @IsString()
  jobTitle?: string;

  @IsDateString()
  hireDate!: string;

  @IsOptional()
  @IsEnum(EmploymentStatus)
  status?: EmploymentStatus;
}
