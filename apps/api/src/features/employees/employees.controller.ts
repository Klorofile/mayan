import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import type { JwtUser } from "../auth/types/jwt-user";
import { Permissions } from "../rbac/decorators/permissions.decorator";
import { PermissionsGuard } from "../rbac/guards/permissions.guard";
import { CreateEmployeeBankAccountDto } from "./dto/create-employee-bank-account.dto";
import { CreateEmployeeContractDto } from "./dto/create-employee-contract.dto";
import { CreateEmployeeDocumentDto } from "./dto/create-employee-document.dto";
import { CreateEmployeeSalaryDto } from "./dto/create-employee-salary.dto";
import { CreateEmployeeDto } from "./dto/create-employee.dto";
import { ListEmployeesQueryDto } from "./dto/list-employees-query.dto";
import { UpdateEmployeeBankAccountDto } from "./dto/update-employee-bank-account.dto";
import { UpdateEmployeeContractDto } from "./dto/update-employee-contract.dto";
import { UpdateEmployeeDocumentDto } from "./dto/update-employee-document.dto";
import { UpdateEmployeeDto } from "./dto/update-employee.dto";
import { EmployeesService } from "./employees.service";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("employees")
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  @Permissions("employee.read")
  list(@CurrentUser() user: JwtUser, @Query() query: ListEmployeesQueryDto) {
    return this.employeesService.list(user.companyId, query);
  }

  @Get(":id")
  @Permissions("employee.read")
  detail(@CurrentUser() user: JwtUser, @Param("id") id: string) {
    return this.employeesService.detail(user.companyId, id);
  }

  @Post()
  @Permissions("employee.create")
  create(@CurrentUser() user: JwtUser, @Body() dto: CreateEmployeeDto) {
    return this.employeesService.create({ userId: user.sub, companyId: user.companyId }, dto);
  }

  @Patch(":id")
  @Permissions("employee.update")
  update(@CurrentUser() user: JwtUser, @Param("id") id: string, @Body() dto: UpdateEmployeeDto) {
    return this.employeesService.update({ userId: user.sub, companyId: user.companyId }, id, dto);
  }

  @Delete(":id")
  @Permissions("employee.delete")
  softDelete(@CurrentUser() user: JwtUser, @Param("id") id: string) {
    return this.employeesService.softDelete({ userId: user.sub, companyId: user.companyId }, id);
  }

  @Get(":id/documents")
  @Permissions("employee.read")
  listDocuments(@CurrentUser() user: JwtUser, @Param("id") id: string) {
    return this.employeesService.listDocuments(user.companyId, id);
  }

  @Post(":id/documents")
  @Permissions("employee.update")
  createDocument(@CurrentUser() user: JwtUser, @Param("id") id: string, @Body() dto: CreateEmployeeDocumentDto) {
    return this.employeesService.createDocument({ userId: user.sub, companyId: user.companyId }, id, dto);
  }

  @Patch(":id/documents/:documentId")
  @Permissions("employee.update")
  updateDocument(
    @CurrentUser() user: JwtUser,
    @Param("id") id: string,
    @Param("documentId") documentId: string,
    @Body() dto: UpdateEmployeeDocumentDto
  ) {
    return this.employeesService.updateDocument({ userId: user.sub, companyId: user.companyId }, id, documentId, dto);
  }

  @Delete(":id/documents/:documentId")
  @Permissions("employee.update")
  deleteDocument(@CurrentUser() user: JwtUser, @Param("id") id: string, @Param("documentId") documentId: string) {
    return this.employeesService.deleteDocument({ userId: user.sub, companyId: user.companyId }, id, documentId);
  }

  @Get(":id/contracts")
  @Permissions("employee.read")
  listContracts(@CurrentUser() user: JwtUser, @Param("id") id: string) {
    return this.employeesService.listContracts(user.companyId, id);
  }

  @Post(":id/contracts")
  @Permissions("employee.update")
  createContract(@CurrentUser() user: JwtUser, @Param("id") id: string, @Body() dto: CreateEmployeeContractDto) {
    return this.employeesService.createContract({ userId: user.sub, companyId: user.companyId }, id, dto);
  }

  @Patch(":id/contracts/:contractId")
  @Permissions("employee.update")
  updateContract(
    @CurrentUser() user: JwtUser,
    @Param("id") id: string,
    @Param("contractId") contractId: string,
    @Body() dto: UpdateEmployeeContractDto
  ) {
    return this.employeesService.updateContract({ userId: user.sub, companyId: user.companyId }, id, contractId, dto);
  }

  @Delete(":id/contracts/:contractId")
  @Permissions("employee.update")
  deleteContract(@CurrentUser() user: JwtUser, @Param("id") id: string, @Param("contractId") contractId: string) {
    return this.employeesService.deleteContract({ userId: user.sub, companyId: user.companyId }, id, contractId);
  }

  @Get(":id/salaries")
  @Permissions("payroll.read")
  listSalaryHistory(@CurrentUser() user: JwtUser, @Param("id") id: string) {
    return this.employeesService.listSalaryHistory(user.companyId, id);
  }

  @Post(":id/salaries")
  @Permissions("payroll.generate")
  createSalary(@CurrentUser() user: JwtUser, @Param("id") id: string, @Body() dto: CreateEmployeeSalaryDto) {
    return this.employeesService.createSalary({ userId: user.sub, companyId: user.companyId }, id, dto);
  }

  @Get(":id/bank-accounts")
  @Permissions("employee.read")
  listBankAccounts(@CurrentUser() user: JwtUser, @Param("id") id: string) {
    return this.employeesService.listBankAccounts(user.companyId, id);
  }

  @Post(":id/bank-accounts")
  @Permissions("employee.update")
  createBankAccount(@CurrentUser() user: JwtUser, @Param("id") id: string, @Body() dto: CreateEmployeeBankAccountDto) {
    return this.employeesService.createBankAccount({ userId: user.sub, companyId: user.companyId }, id, dto);
  }

  @Patch(":id/bank-accounts/:accountId")
  @Permissions("employee.update")
  updateBankAccount(
    @CurrentUser() user: JwtUser,
    @Param("id") id: string,
    @Param("accountId") accountId: string,
    @Body() dto: UpdateEmployeeBankAccountDto
  ) {
    return this.employeesService.updateBankAccount({ userId: user.sub, companyId: user.companyId }, id, accountId, dto);
  }

  @Delete(":id/bank-accounts/:accountId")
  @Permissions("employee.update")
  deleteBankAccount(@CurrentUser() user: JwtUser, @Param("id") id: string, @Param("accountId") accountId: string) {
    return this.employeesService.deleteBankAccount({ userId: user.sub, companyId: user.companyId }, id, accountId);
  }
}
