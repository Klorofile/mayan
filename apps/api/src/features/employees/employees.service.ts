import { Injectable, NotFoundException } from "@nestjs/common";
import { AuditAction, Prisma } from "@prisma/client";
import { PrismaService } from "../../infra/prisma/prisma.service";
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

type Actor = {
  userId: string;
  companyId: string;
};

@Injectable()
export class EmployeesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(companyId: string, query: ListEmployeesQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const where: Prisma.EmployeeWhereInput = {
      companyId,
      deletedAt: null,
      departmentId: query.departmentId,
      positionId: query.positionId,
      branchId: query.branchId,
      status: query.status,
      ...(query.search
        ? {
            OR: [
              { fullName: { contains: query.search, mode: "insensitive" } },
              { employeeNumber: { contains: query.search, mode: "insensitive" } },
              { email: { contains: query.search, mode: "insensitive" } }
            ]
          }
        : {})
    };

    const [data, total] = await Promise.all([
      this.prisma.employee.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          branch: true,
          department: true,
          position: true
        },
        orderBy: { createdAt: "desc" }
      }),
      this.prisma.employee.count({ where })
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async detail(companyId: string, id: string) {
    return this.findEmployeeOrThrow(companyId, id);
  }

  async create(actor: Actor, dto: CreateEmployeeDto) {
    const employee = await this.prisma.employee.create({
      data: {
        companyId: actor.companyId,
        branchId: dto.branchId,
        departmentId: dto.departmentId,
        positionId: dto.positionId,
        workScheduleId: dto.workScheduleId,
        employeeNumber: dto.employeeNumber,
        email: dto.email,
        fullName: dto.fullName,
        phone: dto.phone,
        photoUrl: dto.photoUrl,
        gender: dto.gender,
        maritalStatus: dto.maritalStatus,
        birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
        hireDate: new Date(dto.hireDate),
        status: dto.status ?? "PROBATION"
      },
      include: { branch: true, department: true, position: true }
    });

    await this.audit(actor, "CREATE", "Employee", employee.id, null, employee);
    return employee;
  }

  async update(actor: Actor, id: string, dto: UpdateEmployeeDto) {
    const before = await this.findEmployeeOrThrow(actor.companyId, id);
    const employee = await this.prisma.employee.update({
      where: { id },
      data: {
        branchId: dto.branchId,
        departmentId: dto.departmentId,
        positionId: dto.positionId,
        workScheduleId: dto.workScheduleId,
        employeeNumber: dto.employeeNumber,
        email: dto.email,
        fullName: dto.fullName,
        phone: dto.phone,
        photoUrl: dto.photoUrl,
        gender: dto.gender,
        maritalStatus: dto.maritalStatus,
        birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
        hireDate: dto.hireDate ? new Date(dto.hireDate) : undefined,
        resignDate: dto.resignDate ? new Date(dto.resignDate) : undefined,
        status: dto.status
      },
      include: { branch: true, department: true, position: true }
    });

    await this.audit(actor, "UPDATE", "Employee", employee.id, before, employee);
    return employee;
  }

  async softDelete(actor: Actor, id: string) {
    const before = await this.findEmployeeOrThrow(actor.companyId, id);
    const employee = await this.prisma.employee.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    await this.audit(actor, "DELETE", "Employee", id, before, employee);
    return { id, deletedAt: employee.deletedAt };
  }

  async listDocuments(companyId: string, employeeId: string) {
    await this.ensureEmployeeAccess(companyId, employeeId);
    return this.prisma.employeeDocument.findMany({
      where: { companyId, employeeId, deletedAt: null },
      orderBy: { createdAt: "desc" }
    });
  }

  async createDocument(actor: Actor, employeeId: string, dto: CreateEmployeeDocumentDto) {
    await this.ensureEmployeeAccess(actor.companyId, employeeId);
    const document = await this.prisma.employeeDocument.create({
      data: {
        companyId: actor.companyId,
        employeeId,
        documentType: dto.documentType,
        documentNumber: dto.documentNumber,
        fileName: dto.fileName,
        fileUrl: dto.fileUrl,
        issuedAt: dto.issuedAt ? new Date(dto.issuedAt) : undefined,
        expiredAt: dto.expiredAt ? new Date(dto.expiredAt) : undefined,
        status: dto.status ?? "PENDING"
      }
    });
    await this.audit(actor, "CREATE", "EmployeeDocument", document.id, null, document);
    return document;
  }

  async updateDocument(actor: Actor, employeeId: string, documentId: string, dto: UpdateEmployeeDocumentDto) {
    const before = await this.findDocumentOrThrow(actor.companyId, employeeId, documentId);
    const document = await this.prisma.employeeDocument.update({
      where: { id: documentId },
      data: {
        documentType: dto.documentType,
        documentNumber: dto.documentNumber,
        fileName: dto.fileName,
        fileUrl: dto.fileUrl,
        issuedAt: dto.issuedAt ? new Date(dto.issuedAt) : undefined,
        expiredAt: dto.expiredAt ? new Date(dto.expiredAt) : undefined,
        status: dto.status
      }
    });
    await this.audit(actor, "UPDATE", "EmployeeDocument", document.id, before, document);
    return document;
  }

  async deleteDocument(actor: Actor, employeeId: string, documentId: string) {
    const before = await this.findDocumentOrThrow(actor.companyId, employeeId, documentId);
    const document = await this.prisma.employeeDocument.update({ where: { id: documentId }, data: { deletedAt: new Date() } });
    await this.audit(actor, "DELETE", "EmployeeDocument", documentId, before, document);
    return { id: documentId, deletedAt: document.deletedAt };
  }

  async listContracts(companyId: string, employeeId: string) {
    await this.ensureEmployeeAccess(companyId, employeeId);
    return this.prisma.employeeContract.findMany({
      where: { companyId, employeeId, deletedAt: null },
      orderBy: { startDate: "desc" }
    });
  }

  async createContract(actor: Actor, employeeId: string, dto: CreateEmployeeContractDto) {
    await this.ensureEmployeeAccess(actor.companyId, employeeId);
    const contract = await this.prisma.employeeContract.create({
      data: {
        companyId: actor.companyId,
        employeeId,
        contractNumber: dto.contractNumber,
        contractType: dto.contractType,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        fileUrl: dto.fileUrl,
        status: dto.status ?? "DRAFT"
      }
    });
    await this.audit(actor, "CREATE", "EmployeeContract", contract.id, null, contract);
    return contract;
  }

  async updateContract(actor: Actor, employeeId: string, contractId: string, dto: UpdateEmployeeContractDto) {
    const before = await this.findContractOrThrow(actor.companyId, employeeId, contractId);
    const contract = await this.prisma.employeeContract.update({
      where: { id: contractId },
      data: {
        contractNumber: dto.contractNumber,
        contractType: dto.contractType,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        fileUrl: dto.fileUrl,
        status: dto.status
      }
    });
    await this.audit(actor, "UPDATE", "EmployeeContract", contract.id, before, contract);
    return contract;
  }

  async deleteContract(actor: Actor, employeeId: string, contractId: string) {
    const before = await this.findContractOrThrow(actor.companyId, employeeId, contractId);
    const contract = await this.prisma.employeeContract.update({ where: { id: contractId }, data: { deletedAt: new Date() } });
    await this.audit(actor, "DELETE", "EmployeeContract", contractId, before, contract);
    return { id: contractId, deletedAt: contract.deletedAt };
  }

  async listSalaryHistory(companyId: string, employeeId: string) {
    await this.ensureEmployeeAccess(companyId, employeeId);
    return this.prisma.employeeSalary.findMany({
      where: { companyId, employeeId, deletedAt: null },
      orderBy: { effectiveFrom: "desc" }
    });
  }

  async createSalary(actor: Actor, employeeId: string, dto: CreateEmployeeSalaryDto) {
    await this.ensureEmployeeAccess(actor.companyId, employeeId);
    const salary = await this.prisma.employeeSalary.create({
      data: {
        companyId: actor.companyId,
        employeeId,
        baseSalary: dto.baseSalary,
        currency: dto.currency ?? "IDR",
        effectiveFrom: new Date(dto.effectiveFrom),
        effectiveTo: dto.effectiveTo ? new Date(dto.effectiveTo) : undefined,
        status: dto.status ?? "ACTIVE"
      }
    });
    await this.audit(actor, "CREATE", "EmployeeSalary", salary.id, null, salary);
    return salary;
  }

  async listBankAccounts(companyId: string, employeeId: string) {
    await this.ensureEmployeeAccess(companyId, employeeId);
    return this.prisma.employeeBankAccount.findMany({
      where: { companyId, employeeId, deletedAt: null },
      orderBy: [{ isPrimary: "desc" }, { createdAt: "desc" }]
    });
  }

  async createBankAccount(actor: Actor, employeeId: string, dto: CreateEmployeeBankAccountDto) {
    await this.ensureEmployeeAccess(actor.companyId, employeeId);
    const account = await this.prisma.employeeBankAccount.create({
      data: {
        companyId: actor.companyId,
        employeeId,
        bankName: dto.bankName,
        accountNumber: dto.accountNumber,
        accountName: dto.accountName,
        isPrimary: dto.isPrimary ?? false,
        status: dto.status ?? "ACTIVE"
      }
    });
    await this.audit(actor, "CREATE", "EmployeeBankAccount", account.id, null, account);
    return account;
  }

  async updateBankAccount(actor: Actor, employeeId: string, accountId: string, dto: UpdateEmployeeBankAccountDto) {
    const before = await this.findBankAccountOrThrow(actor.companyId, employeeId, accountId);
    const account = await this.prisma.employeeBankAccount.update({
      where: { id: accountId },
      data: dto
    });
    await this.audit(actor, "UPDATE", "EmployeeBankAccount", account.id, before, account);
    return account;
  }

  async deleteBankAccount(actor: Actor, employeeId: string, accountId: string) {
    const before = await this.findBankAccountOrThrow(actor.companyId, employeeId, accountId);
    const account = await this.prisma.employeeBankAccount.update({ where: { id: accountId }, data: { deletedAt: new Date() } });
    await this.audit(actor, "DELETE", "EmployeeBankAccount", accountId, before, account);
    return { id: accountId, deletedAt: account.deletedAt };
  }

  private findEmployeeOrThrow(companyId: string, id: string) {
    return this.prisma.employee
      .findFirst({
        where: { id, companyId, deletedAt: null },
        include: {
          branch: true,
          department: true,
          position: true,
          documents: { where: { deletedAt: null }, orderBy: { createdAt: "desc" } },
          contracts: { where: { deletedAt: null }, orderBy: { startDate: "desc" } },
          salaries: { where: { deletedAt: null }, orderBy: { effectiveFrom: "desc" } },
          bankAccounts: { where: { deletedAt: null }, orderBy: { createdAt: "desc" } }
        }
      })
      .then((employee) => {
        if (!employee) throw new NotFoundException("Employee not found");
        return employee;
      });
  }

  private async ensureEmployeeAccess(companyId: string, employeeId: string) {
    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, companyId, deletedAt: null },
      select: { id: true }
    });
    if (!employee) throw new NotFoundException("Employee not found");
  }

  private async findDocumentOrThrow(companyId: string, employeeId: string, id: string) {
    const document = await this.prisma.employeeDocument.findFirst({ where: { id, employeeId, companyId, deletedAt: null } });
    if (!document) throw new NotFoundException("Employee document not found");
    return document;
  }

  private async findContractOrThrow(companyId: string, employeeId: string, id: string) {
    const contract = await this.prisma.employeeContract.findFirst({ where: { id, employeeId, companyId, deletedAt: null } });
    if (!contract) throw new NotFoundException("Employee contract not found");
    return contract;
  }

  private async findBankAccountOrThrow(companyId: string, employeeId: string, id: string) {
    const account = await this.prisma.employeeBankAccount.findFirst({ where: { id, employeeId, companyId, deletedAt: null } });
    if (!account) throw new NotFoundException("Employee bank account not found");
    return account;
  }

  private audit(actor: Actor, action: AuditAction, entityName: string, entityId: string, oldValues: unknown, newValues: unknown) {
    // Audit log is intentionally best-effort per transaction boundary but awaited so compliance records are not skipped silently.
    return this.prisma.auditLog.create({
      data: {
        companyId: actor.companyId,
        userId: actor.userId,
        action,
        entityName,
        entityId,
        oldValues: this.toJson(oldValues),
        newValues: this.toJson(newValues)
      }
    });
  }

  private toJson(value: unknown): Prisma.InputJsonValue | undefined {
    if (value === null || value === undefined) return undefined;
    return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
  }
}
