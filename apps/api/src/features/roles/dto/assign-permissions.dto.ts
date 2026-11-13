import { IsString } from "class-validator";

export class AssignPermissionsDto {
  @IsString({ each: true })
  permissionIds!: string[];
}
