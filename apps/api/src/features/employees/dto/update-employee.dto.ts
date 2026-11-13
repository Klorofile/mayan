import { PartialType } from "@nestjs/mapped-types";
import { IsDateString, IsOptional } from "class-validator";
import { CreateEmployeeDto } from "./create-employee.dto";

export class UpdateEmployeeDto extends PartialType(CreateEmployeeDto) {
  @IsOptional()
  @IsDateString()
  resignDate?: string;
}
