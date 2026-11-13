import { Prisma, PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

loadApiEnv();
const prisma = new PrismaClient();

const companyCode = "MAYAN";
const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth();
const monthStart = new Date(currentYear, currentMonth, 1);
const monthEnd = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);

const defaultPermissions = [
  "dashboard.read",
  "employee.read",
  "employee.create",
  "employee.update",
  "employee.delete",
  "attendance.read",
  "attendance.create",
  "attendance.update",
  "leave.read",
  "leave.create",
  "leave.approve",
  "payroll.read",
  "payroll.generate",
  "role.read",
  "role.create",
  "role.update",
  "permission.read",
  "permission.create",
  // Permission legacy ini tetap dibuat agar endpoint lama yang masih memakai kode colon tetap bisa diakses.
  "role:read",
  "permission:read"
];

const rolePermissionMatrix: Record<string, string[]> = {
  SUPER_ADMIN: defaultPermissions,
  HR_ADMIN: [
    "dashboard.read",
    "employee.read",
    "employee.create",
    "employee.update",
    "employee.delete",
    "attendance.read",
    "attendance.create",
    "attendance.update",
    "leave.read",
    "leave.create",
    "leave.approve",
    "payroll.read",
    "payroll.generate"
  ],
  MANAGER: ["dashboard.read", "employee.read", "attendance.read", "leave.read", "leave.approve"],
  EMPLOYEE: ["dashboard.read", "employee.read", "attendance.create", "leave.read", "leave.create"]
};

const branches = [
  { code: "JKT", name: "Jakarta", city: "Jakarta", latitude: "-6.2000000", longitude: "106.8166660", radiusMeter: 150 },
  { code: "BDG", name: "Bandung", city: "Bandung", latitude: "-6.9175000", longitude: "107.6191000", radiusMeter: 150 },
  { code: "SBY", name: "Surabaya", city: "Surabaya", latitude: "-7.2575000", longitude: "112.7521000", radiusMeter: 150 }
];

const departments = [
  { code: "HR", name: "Human Resources" },
  { code: "IT", name: "Information Technology" },
  { code: "FIN", name: "Finance" },
  { code: "SAL", name: "Sales" },
  { code: "MKT", name: "Marketing" }
];

const positions = [
  { code: "STAFF", name: "Staff", level: 1 },
  { code: "SENIOR_STAFF", name: "Senior Staff", level: 2 },
  { code: "MANAGER", name: "Manager", level: 3 },
  { code: "HEAD", name: "Head", level: 4 }
];

const leaveTypes = [
  { code: "ANNUAL", name: "Annual Leave", annualQuotaDays: 12, isPaid: true },
  { code: "SICK", name: "Sick Leave", annualQuotaDays: 12, isPaid: true },
  { code: "PERMISSION", name: "Permission", annualQuotaDays: 6, isPaid: false }
];

const salaryComponents = [
  { code: "BASIC", name: "Basic Salary", type: "EARNING", defaultAmount: 5_500_000, isTaxable: true },
  { code: "TRANSPORT", name: "Transport Allowance", type: "EARNING", defaultAmount: 750_000, isTaxable: true },
  { code: "MEAL", name: "Meal Allowance", type: "EARNING", defaultAmount: 650_000, isTaxable: true },
  { code: "BPJS", name: "BPJS Deduction", type: "DEDUCTION", defaultAmount: 250_000, isTaxable: false },
  { code: "PPH21", name: "PPh21", type: "TAX", defaultAmount: 300_000, isTaxable: false }
] as const;

const firstNames = [
  "Aditya",
  "Bunga",
  "Candra",
  "Dewi",
  "Eka",
  "Fajar",
  "Gita",
  "Hendra",
  "Intan",
  "Joko",
  "Kartika",
  "Lukman",
  "Maya",
  "Naufal",
  "Olivia",
  "Pratama",
  "Qori",
  "Rizky",
  "Sari",
  "Taufik"
];

const lastNames = [
  "Saputra",
  "Wijaya",
  "Prasetyo",
  "Anggraini",
  "Kusuma",
  "Mahendra",
  "Lestari",
  "Permana",
  "Santoso",
  "Ramadhan"
];

function loadApiEnv() {
  const envPath = resolve(process.cwd(), ".env");
  if (!existsSync(envPath)) return;

  // Prisma seed dijalankan via tsx, jadi .env API perlu dimuat eksplisit sebelum PrismaClient dibuat.
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!match || process.env[match[1]]) continue;
    process.env[match[1]] = match[2].replace(/^"|"$/g, "");
  }
}

async function main() {
  const company = await prisma.company.upsert({
    where: { companyCode },
    update: {
      name: "MAYAN",
      legalName: "PT MAYAN Human Capital",
      email: "hello@mayan.hris",
      phone: "+62-21-555-0101",
      address: "Jl. HRIS Enterprise No. 1, Jakarta",
      status: "ACTIVE"
    },
    create: {
      companyCode,
      name: "MAYAN",
      legalName: "PT MAYAN Human Capital",
      taxNumber: "01.234.567.8-999.000",
      email: "hello@mayan.hris",
      phone: "+62-21-555-0101",
      address: "Jl. HRIS Enterprise No. 1, Jakarta",
      status: "ACTIVE"
    }
  });

  const createdBranches = await seedBranches(company.id);
  const createdDepartments = await seedDepartments(company.id, createdBranches);
  const createdPositions = await seedPositions(company.id, createdDepartments);
  const permissionByCode = await seedPermissions(company.id);
  const roleByCode = await seedRoles(company.id, permissionByCode);
  const workSchedule = await seedWorkSchedule(company.id, createdBranches[0].id);
  const leaveTypeByCode = await seedLeaveTypes(company.id);
  const salaryComponentByCode = await seedSalaryComponents(company.id);
  const employees = await seedEmployees(company.id, createdBranches, createdDepartments, createdPositions, workSchedule.id);

  const adminUser = await seedAdminUser(company.id, roleByCode.SUPER_ADMIN.id);
  await seedLeaveBalances(company.id, employees, Object.values(leaveTypeByCode));
  await seedEmployeeSalaries(company.id, employees, salaryComponentByCode);
  const payrollPeriod = await seedPayrollPeriod(company.id);
  const workflows = await seedApprovalWorkflows(company.id, roleByCode);

  await seedEmployeeSectionSamples(company.id, employees);
  await seedAttendanceSamples(company.id, employees, workSchedule.id);
  const leaveRequests = await seedLeaveRequestSamples(company.id, employees, leaveTypeByCode, workflows.leaveWorkflow);
  const payrolls = await seedPayrollSamples(company.id, employees, payrollPeriod.id, salaryComponentByCode);
  await seedNotifications(company.id, adminUser.id);
  await seedAuditLogs(company.id, adminUser.id, employees[0].id);
  await seedApprovalSamples(company.id, workflows, leaveRequests, payrolls, employees);

  console.log(`Seed selesai: ${company.name}, ${employees.length} employees + contoh data setiap section, admin@hrispro.com / Admin123!`);
}

async function seedBranches(companyId: string) {
  return Promise.all(
    branches.map((branch) =>
      prisma.branch.upsert({
        where: { companyId_code: { companyId, code: branch.code } },
        update: {
          name: branch.name,
          city: branch.city,
          latitude: new Prisma.Decimal(branch.latitude),
          longitude: new Prisma.Decimal(branch.longitude),
          radiusMeter: branch.radiusMeter
        },
        create: {
          companyId,
          code: branch.code,
          name: branch.name,
          city: branch.city,
          province: branch.city === "Jakarta" ? "DKI Jakarta" : "Jawa",
          address: `Kantor MAYAN ${branch.name}`,
          latitude: new Prisma.Decimal(branch.latitude),
          longitude: new Prisma.Decimal(branch.longitude),
          radiusMeter: branch.radiusMeter
        }
      })
    )
  );
}

async function seedDepartments(companyId: string, branchRecords: Awaited<ReturnType<typeof seedBranches>>) {
  return Promise.all(
    departments.map((department, index) =>
      prisma.department.upsert({
        where: { companyId_code: { companyId, code: department.code } },
        update: { name: department.name, branchId: branchRecords[index % branchRecords.length].id },
        create: {
          companyId,
          branchId: branchRecords[index % branchRecords.length].id,
          code: department.code,
          name: department.name
        }
      })
    )
  );
}

async function seedPositions(companyId: string, departmentRecords: Awaited<ReturnType<typeof seedDepartments>>) {
  return Promise.all(
    positions.map((position, index) =>
      prisma.position.upsert({
        where: { companyId_code: { companyId, code: position.code } },
        update: { name: position.name, level: position.level, departmentId: departmentRecords[index % departmentRecords.length].id },
        create: {
          companyId,
          departmentId: departmentRecords[index % departmentRecords.length].id,
          code: position.code,
          name: position.name,
          level: position.level
        }
      })
    )
  );
}

async function seedPermissions(companyId: string) {
  const permissionEntries = await Promise.all(
    defaultPermissions.map((code) => {
      const [resource, action = "read"] = code.includes(".") ? code.split(".") : code.split(":");
      return prisma.permission.upsert({
        where: { companyId_code: { companyId, code } },
        update: { resource, action, description: `Allows ${action} on ${resource}` },
        create: { companyId, code, resource, action, description: `Allows ${action} on ${resource}` }
      });
    })
  );

  return Object.fromEntries(permissionEntries.map((permission) => [permission.code, permission]));
}

async function seedRoles(companyId: string, permissionByCode: Awaited<ReturnType<typeof seedPermissions>>) {
  const roleEntries = await Promise.all(
    Object.keys(rolePermissionMatrix).map((code) =>
      prisma.role.upsert({
        where: { companyId_code: { companyId, code } },
        update: { name: code.replace("_", " "), isSystem: true },
        create: {
          companyId,
          code,
          name: code.replace("_", " "),
          description: `${code} default MAYAN role`,
          isSystem: true
        }
      })
    )
  );

  await Promise.all(
    roleEntries.flatMap((role) =>
      rolePermissionMatrix[role.code].map((permissionCode) =>
        prisma.rolePermission.upsert({
          where: { roleId_permissionId: { roleId: role.id, permissionId: permissionByCode[permissionCode].id } },
          update: {},
          create: { roleId: role.id, permissionId: permissionByCode[permissionCode].id }
        })
      )
    )
  );

  return Object.fromEntries(roleEntries.map((role) => [role.code, role]));
}

async function seedWorkSchedule(companyId: string, branchId: string) {
  return prisma.workSchedule.upsert({
    where: { companyId_code: { companyId, code: "REGULAR_09_18" } },
    update: {
      name: "Regular Office 09:00 - 18:00",
      branchId,
      mondayStart: "09:00",
      mondayEnd: "18:00",
      tuesdayStart: "09:00",
      tuesdayEnd: "18:00",
      wednesdayStart: "09:00",
      wednesdayEnd: "18:00",
      thursdayStart: "09:00",
      thursdayEnd: "18:00",
      fridayStart: "09:00",
      fridayEnd: "18:00"
    },
    create: {
      companyId,
      branchId,
      code: "REGULAR_09_18",
      name: "Regular Office 09:00 - 18:00",
      type: "FIXED",
      timezone: "Asia/Jakarta",
      mondayStart: "09:00",
      mondayEnd: "18:00",
      tuesdayStart: "09:00",
      tuesdayEnd: "18:00",
      wednesdayStart: "09:00",
      wednesdayEnd: "18:00",
      thursdayStart: "09:00",
      thursdayEnd: "18:00",
      fridayStart: "09:00",
      fridayEnd: "18:00"
    }
  });
}

async function seedLeaveTypes(companyId: string) {
  const entries = await Promise.all(
    leaveTypes.map((leaveType) =>
      prisma.leaveType.upsert({
        where: { companyId_code: { companyId, code: leaveType.code } },
        update: {
          name: leaveType.name,
          annualQuotaDays: new Prisma.Decimal(leaveType.annualQuotaDays),
          isPaid: leaveType.isPaid
        },
        create: {
          companyId,
          code: leaveType.code,
          name: leaveType.name,
          annualQuotaDays: new Prisma.Decimal(leaveType.annualQuotaDays),
          isPaid: leaveType.isPaid,
          requiresApproval: true
        }
      })
    )
  );

  return Object.fromEntries(entries.map((leaveType) => [leaveType.code, leaveType]));
}

async function seedSalaryComponents(companyId: string) {
  const entries = await Promise.all(
    salaryComponents.map((component) =>
      prisma.salaryComponent.upsert({
        where: { companyId_code: { companyId, code: component.code } },
        update: {
          name: component.name,
          type: component.type,
          defaultAmount: new Prisma.Decimal(component.defaultAmount),
          isTaxable: component.isTaxable
        },
        create: {
          companyId,
          code: component.code,
          name: component.name,
          type: component.type,
          calculationType: "FIXED",
          defaultAmount: new Prisma.Decimal(component.defaultAmount),
          isTaxable: component.isTaxable
        }
      })
    )
  );

  return Object.fromEntries(entries.map((component) => [component.code, component]));
}

async function seedEmployees(
  companyId: string,
  branchRecords: Awaited<ReturnType<typeof seedBranches>>,
  departmentRecords: Awaited<ReturnType<typeof seedDepartments>>,
  positionRecords: Awaited<ReturnType<typeof seedPositions>>,
  workScheduleId: string
) {
  const employees = [];

  for (let index = 1; index <= 50; index += 1) {
    const firstName = firstNames[(index - 1) % firstNames.length];
    const lastName = lastNames[(index - 1) % lastNames.length];
    const fullName = `${firstName} ${lastName}`;
    const employeeNumber = `MYN-${String(index).padStart(4, "0")}`;
    const branch = branchRecords[(index - 1) % branchRecords.length];
    const department = departmentRecords[(index - 1) % departmentRecords.length];
    const position = positionRecords[(index - 1) % positionRecords.length];

    // Upsert membuat seed aman dijalankan berulang tanpa menggandakan employee.
    const employee = await prisma.employee.upsert({
      where: { employeeNumber },
      update: {
        companyId,
        branchId: branch.id,
        departmentId: department.id,
        positionId: position.id,
        workScheduleId,
        fullName,
        phone: `+62812${String(10_000_000 + index).slice(1)}`,
        status: index % 13 === 0 ? "PROBATION" : "ACTIVE"
      },
      create: {
        companyId,
        branchId: branch.id,
        departmentId: department.id,
        positionId: position.id,
        workScheduleId,
        employeeNumber,
        email: `employee${String(index).padStart(3, "0")}@mayan.hris`,
        fullName,
        phone: `+62812${String(10_000_000 + index).slice(1)}`,
        photoUrl: `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(fullName)}`,
        gender: index % 2 === 0 ? "FEMALE" : "MALE",
        maritalStatus: index % 3 === 0 ? "MARRIED" : "SINGLE",
        birthDate: new Date(1988 + (index % 12), index % 12, (index % 27) + 1),
        hireDate: new Date(currentYear - (index % 5), index % 12, 1),
        status: index % 13 === 0 ? "PROBATION" : "ACTIVE"
      }
    });

    employees.push(employee);
  }

  return employees;
}

async function seedAdminUser(companyId: string, superAdminRoleId: string) {
  const passwordHash = await hash("Admin123!", 12);
  const user = await prisma.user.upsert({
    where: { email: "admin@hrispro.com" },
    update: { companyId, passwordHash, isActive: true },
    create: {
      companyId,
      email: "admin@hrispro.com",
      passwordHash,
      isActive: true
    }
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: user.id, roleId: superAdminRoleId } },
    update: {},
    create: { userId: user.id, roleId: superAdminRoleId }
  });

  return user;
}

async function seedLeaveBalances(
  companyId: string,
  employees: Awaited<ReturnType<typeof seedEmployees>>,
  leaveTypeRecords: Array<{ id: string; annualQuotaDays: Prisma.Decimal }>
) {
  await Promise.all(
    employees.flatMap((employee) =>
      leaveTypeRecords.map((leaveType) =>
        prisma.leaveBalance.upsert({
          where: { employeeId_leaveTypeId_year: { employeeId: employee.id, leaveTypeId: leaveType.id, year: currentYear } },
          update: {
            openingBalance: leaveType.annualQuotaDays,
            accrued: leaveType.annualQuotaDays,
            remaining: leaveType.annualQuotaDays
          },
          create: {
            companyId,
            employeeId: employee.id,
            leaveTypeId: leaveType.id,
            year: currentYear,
            openingBalance: leaveType.annualQuotaDays,
            accrued: leaveType.annualQuotaDays,
            used: new Prisma.Decimal(0),
            remaining: leaveType.annualQuotaDays
          }
        })
      )
    )
  );
}

async function seedEmployeeSalaries(
  companyId: string,
  employees: Awaited<ReturnType<typeof seedEmployees>>,
  componentByCode: Awaited<ReturnType<typeof seedSalaryComponents>>
) {
  for (const [index, employee] of employees.entries()) {
    const baseSalary = new Prisma.Decimal(5_000_000 + (index % 10) * 350_000);

    const existingSalary = await prisma.employeeSalary.findFirst({
      where: { companyId, employeeId: employee.id, effectiveFrom: monthStart, deletedAt: null }
    });

    if (existingSalary) {
      await prisma.employeeSalary.update({
        where: { id: existingSalary.id },
        data: { baseSalary, status: "ACTIVE" }
      });
    } else {
      await prisma.employeeSalary.create({
        data: {
          companyId,
          employeeId: employee.id,
          baseSalary,
          effectiveFrom: monthStart,
          status: "ACTIVE"
        }
      });
    }

    await Promise.all(
      Object.values(componentByCode).map(async (component) => {
        const amount = component.code === "BASIC" ? baseSalary : component.defaultAmount;

        const existingComponent = await prisma.employeeSalaryComponent.findFirst({
          where: { companyId, employeeId: employee.id, salaryComponentId: component.id, effectiveFrom: monthStart, deletedAt: null }
        });

        // Tidak ada unique constraint di schema untuk assignment komponen, jadi idempotency dijaga lewat lookup natural key.
        return existingComponent
          ? prisma.employeeSalaryComponent.update({ where: { id: existingComponent.id }, data: { amount, status: "ACTIVE" } })
          : prisma.employeeSalaryComponent.create({
              data: {
                companyId,
                employeeId: employee.id,
                salaryComponentId: component.id,
                amount,
                effectiveFrom: monthStart,
                status: "ACTIVE"
              }
            });
      })
    );
  }
}

async function seedPayrollPeriod(companyId: string) {
  const code = `PAY-${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`;

  return prisma.payrollPeriod.upsert({
    where: { companyId_code: { companyId, code } },
    update: {
      name: `Payroll ${monthStart.toLocaleString("id-ID", { month: "long", year: "numeric" })}`,
      startDate: monthStart,
      endDate: monthEnd,
      paymentDate: new Date(currentYear, currentMonth + 1, 5),
      status: "OPEN"
    },
    create: {
      companyId,
      code,
      name: `Payroll ${monthStart.toLocaleString("id-ID", { month: "long", year: "numeric" })}`,
      startDate: monthStart,
      endDate: monthEnd,
      paymentDate: new Date(currentYear, currentMonth + 1, 5),
      status: "OPEN"
    }
  });
}

async function seedEmployeeSectionSamples(companyId: string, employees: Awaited<ReturnType<typeof seedEmployees>>) {
  const sampleEmployees = employees.slice(0, 10);

  for (const [index, employee] of sampleEmployees.entries()) {
    await upsertByLookup(
      () => prisma.employeeDocument.findFirst({ where: { companyId, employeeId: employee.id, documentType: "KTP", deletedAt: null } }),
      (id, data) => prisma.employeeDocument.update({ where: { id }, data }),
      () =>
        prisma.employeeDocument.create({
          data: {
            companyId,
            employeeId: employee.id,
            documentType: "KTP",
            documentNumber: `3174${String(10_000_000 + index).slice(1)}`,
            fileName: `${employee.employeeNumber}-ktp.pdf`,
            fileUrl: `https://files.mayan.local/documents/${employee.employeeNumber}-ktp.pdf`,
            issuedAt: new Date(currentYear - 5, 0, 1),
            status: "VERIFIED"
          }
        }),
      { status: "VERIFIED" as const }
    );

    await upsertByLookup(
      () => prisma.employeeContract.findFirst({ where: { companyId, employeeId: employee.id, contractNumber: `CTR-${employee.employeeNumber}`, deletedAt: null } }),
      (id, data) => prisma.employeeContract.update({ where: { id }, data }),
      () =>
        prisma.employeeContract.create({
          data: {
            companyId,
            employeeId: employee.id,
            contractNumber: `CTR-${employee.employeeNumber}`,
            contractType: index % 3 === 0 ? "PKWT" : "PKWTT",
            startDate: employee.hireDate,
            endDate: index < 4 ? new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 20 + index) : undefined,
            fileUrl: `https://files.mayan.local/contracts/${employee.employeeNumber}.pdf`,
            status: "ACTIVE"
          }
        }),
      { status: "ACTIVE" as const }
    );

    await upsertByLookup(
      () => prisma.employeeBankAccount.findFirst({ where: { companyId, employeeId: employee.id, isPrimary: true, deletedAt: null } }),
      (id, data) => prisma.employeeBankAccount.update({ where: { id }, data }),
      () =>
        prisma.employeeBankAccount.create({
          data: {
            companyId,
            employeeId: employee.id,
            bankName: index % 2 === 0 ? "BCA" : "Mandiri",
            accountNumber: `900${String(100_000_000 + index).slice(1)}`,
            accountName: employee.fullName,
            isPrimary: true,
            status: "ACTIVE"
          }
        }),
      { accountName: employee.fullName, status: "ACTIVE" as const }
    );
  }
}

async function seedAttendanceSamples(companyId: string, employees: Awaited<ReturnType<typeof seedEmployees>>, workScheduleId: string) {
  const sampleEmployees = employees.slice(0, 20);
  const today = startOfDay(new Date());

  await Promise.all(
    sampleEmployees.map((employee, index) => {
      const clockInAt = withTime(today, index % 4 === 0 ? "09:18" : "08:55");
      const clockOutAt = withTime(today, "18:04");
      return prisma.attendance.upsert({
        where: { employeeId_attendanceDate: { employeeId: employee.id, attendanceDate: today } },
        update: {
          clockInAt,
          clockOutAt,
          lateMinutes: index % 4 === 0 ? 18 : 0,
          workingMinutes: minutesBetween(clockInAt, clockOutAt),
          status: index % 4 === 0 ? "LATE" : "PRESENT"
        },
        create: {
          companyId,
          employeeId: employee.id,
          workScheduleId,
          attendanceDate: today,
          clockInAt,
          clockOutAt,
          clockInLatitude: new Prisma.Decimal("-6.2000000"),
          clockInLongitude: new Prisma.Decimal("106.8166660"),
          clockOutLatitude: new Prisma.Decimal("-6.2000000"),
          clockOutLongitude: new Prisma.Decimal("106.8166660"),
          lateMinutes: index % 4 === 0 ? 18 : 0,
          workingMinutes: minutesBetween(clockInAt, clockOutAt),
          status: index % 4 === 0 ? "LATE" : "PRESENT",
          notes: index % 4 === 0 ? "Datang terlambat karena meeting eksternal" : "Clock in normal"
        }
      });
    })
  );

  const attendance = await prisma.attendance.findFirst({ where: { companyId, employeeId: sampleEmployees[0].id, attendanceDate: today } });
  if (attendance) {
    await upsertByLookup(
      () => prisma.attendanceCorrection.findFirst({ where: { companyId, employeeId: sampleEmployees[0].id, attendanceId: attendance.id, deletedAt: null } }),
      (id, data) => prisma.attendanceCorrection.update({ where: { id }, data }),
      () =>
        prisma.attendanceCorrection.create({
          data: {
            companyId,
            employeeId: sampleEmployees[0].id,
            attendanceId: attendance.id,
            requestedClockInAt: withTime(today, "08:57"),
            requestedClockOutAt: withTime(today, "18:10"),
            reason: "Koreksi karena lupa memilih lokasi kantor saat clock in.",
            status: "PENDING"
          }
        }),
      { status: "PENDING" as const }
    );
  }
}

async function seedLeaveRequestSamples(
  companyId: string,
  employees: Awaited<ReturnType<typeof seedEmployees>>,
  leaveTypeByCode: Awaited<ReturnType<typeof seedLeaveTypes>>,
  workflow: { id: string }
) {
  const today = startOfDay(new Date());
  const samples = [
    { employee: employees[1], leaveType: leaveTypeByCode.ANNUAL, startOffset: 3, endOffset: 4, status: "PENDING" as const, reason: "Rencana cuti keluarga tahunan." },
    { employee: employees[2], leaveType: leaveTypeByCode.SICK, startOffset: 0, endOffset: 0, status: "APPROVED" as const, reason: "Istirahat sakit dengan surat dokter." },
    { employee: employees[3], leaveType: leaveTypeByCode.PERMISSION, startOffset: 7, endOffset: 7, status: "REJECTED" as const, reason: "Izin urusan administrasi pribadi." }
  ];
  const result = [];

  for (const sample of samples) {
    const startDate = addDays(today, sample.startOffset);
    const endDate = addDays(today, sample.endOffset);
    const leave = await upsertByLookup(
      () => prisma.leaveRequest.findFirst({ where: { companyId, employeeId: sample.employee.id, leaveTypeId: sample.leaveType.id, startDate, deletedAt: null } }),
      (id, data) => prisma.leaveRequest.update({ where: { id }, data }),
      () =>
        prisma.leaveRequest.create({
          data: {
            companyId,
            employeeId: sample.employee.id,
            leaveTypeId: sample.leaveType.id,
            startDate,
            endDate,
            totalDays: new Prisma.Decimal(sample.endOffset - sample.startOffset + 1),
            reason: sample.reason,
            attachmentUrl: sample.leaveType.code === "SICK" ? "https://files.mayan.local/leaves/sick-note.pdf" : undefined,
            status: sample.status,
            managerApprovedAt: sample.status === "APPROVED" ? new Date() : undefined,
            hrApprovedAt: sample.status === "APPROVED" ? new Date() : undefined,
            rejectedAt: sample.status === "REJECTED" ? new Date() : undefined
          }
        }),
      { status: sample.status }
    );

    result.push(leave);
    await ensureApprovalForLeave(companyId, workflow.id, leave.id, sample.employee.id, sample.status);
  }

  return result;
}

async function seedPayrollSamples(
  companyId: string,
  employees: Awaited<ReturnType<typeof seedEmployees>>,
  payrollPeriodId: string,
  componentByCode: Awaited<ReturnType<typeof seedSalaryComponents>>
) {
  const payrolls = [];
  const sampleEmployees = employees.slice(0, 8);

  for (const [index, employee] of sampleEmployees.entries()) {
    const basicSalary = new Prisma.Decimal(5_000_000 + index * 350_000);
    const allowance = new Prisma.Decimal(1_400_000);
    const deduction = new Prisma.Decimal(250_000);
    const tax = new Prisma.Decimal(300_000);
    const grossPay = basicSalary.plus(allowance);
    const netPay = grossPay.minus(deduction).minus(tax);

    const payroll = await prisma.payroll.upsert({
      where: { employeeId_payrollPeriodId: { employeeId: employee.id, payrollPeriodId } },
      update: { basicSalary, allowance, deduction, tax, grossPay, totalDeduction: deduction.plus(tax), netPay, status: "CALCULATED" },
      create: {
        companyId,
        employeeId: employee.id,
        payrollPeriodId,
        basicSalary,
        allowance,
        overtime: 0,
        deduction,
        tax,
        grossPay,
        totalDeduction: deduction.plus(tax),
        netPay,
        status: "CALCULATED"
      }
    });

    await prisma.payrollComponent.deleteMany({ where: { payrollId: payroll.id } });
    await prisma.payrollComponent.createMany({
      data: [
        componentSnapshot(companyId, payroll.id, componentByCode.BASIC, basicSalary),
        componentSnapshot(companyId, payroll.id, componentByCode.TRANSPORT, new Prisma.Decimal(750_000)),
        componentSnapshot(companyId, payroll.id, componentByCode.MEAL, new Prisma.Decimal(650_000)),
        componentSnapshot(companyId, payroll.id, componentByCode.BPJS, deduction),
        componentSnapshot(companyId, payroll.id, componentByCode.PPH21, tax)
      ]
    });

    payrolls.push(payroll);
  }

  await prisma.payrollPeriod.update({ where: { id: payrollPeriodId }, data: { status: "PROCESSED" } });
  return payrolls;
}

async function seedApprovalWorkflows(companyId: string, roleByCode: Awaited<ReturnType<typeof seedRoles>>) {
  const leaveWorkflow = await prisma.approvalWorkflow.upsert({
    where: { companyId_code: { companyId, code: "LEAVE_TWO_STEP" } },
    update: { name: "Leave Request Two Step", module: "LEAVE_REQUEST", status: "ACTIVE" },
    create: { companyId, code: "LEAVE_TWO_STEP", name: "Leave Request Two Step", module: "LEAVE_REQUEST", status: "ACTIVE" }
  });
  const payrollWorkflow = await prisma.approvalWorkflow.upsert({
    where: { companyId_code: { companyId, code: "PAYROLL_APPROVAL" } },
    update: { name: "Payroll Approval", module: "PAYROLL", status: "ACTIVE" },
    create: { companyId, code: "PAYROLL_APPROVAL", name: "Payroll Approval", module: "PAYROLL", status: "ACTIVE" }
  });

  await upsertApprovalStep(companyId, leaveWorkflow.id, 1, "Manager Approval", roleByCode.MANAGER.id);
  await upsertApprovalStep(companyId, leaveWorkflow.id, 2, "HR Approval", roleByCode.HR_ADMIN.id);
  await upsertApprovalStep(companyId, payrollWorkflow.id, 1, "HR Payroll Review", roleByCode.HR_ADMIN.id);

  return { leaveWorkflow, payrollWorkflow };
}

async function seedApprovalSamples(
  companyId: string,
  workflows: Awaited<ReturnType<typeof seedApprovalWorkflows>>,
  leaveRequests: Array<{ id: string; status: "PENDING" | "APPROVED" | "REJECTED" | "DRAFT" | "CANCELLED" }>,
  payrolls: Array<{ id: string }>,
  employees: Awaited<ReturnType<typeof seedEmployees>>
) {
  if (payrolls[0]) {
    const step = await prisma.approvalStep.findFirst({ where: { companyId, workflowId: workflows.payrollWorkflow.id, stepOrder: 1 } });
    await upsertByLookup(
      () => prisma.approval.findFirst({ where: { companyId, workflowId: workflows.payrollWorkflow.id, payrollId: payrolls[0].id, deletedAt: null } }),
      (id, data) => prisma.approval.update({ where: { id }, data }),
      () =>
        prisma.approval.create({
          data: {
            companyId,
            workflowId: workflows.payrollWorkflow.id,
            approvalStepId: step?.id,
            approverEmployeeId: employees[4].id,
            payrollId: payrolls[0].id,
            targetType: "PAYROLL",
            targetId: payrolls[0].id,
            status: "PENDING"
          }
        }),
      { status: "PENDING" as const }
    );
  }

  return leaveRequests;
}

async function seedNotifications(companyId: string, userId: string) {
  const notifications = [
    { title: "Pengajuan cuti baru", message: "Ada pengajuan cuti yang menunggu approval.", linkUrl: "/leaves/approval" },
    { title: "Payroll bulan ini siap dicek", message: "Payroll period bulan berjalan sudah diproses.", linkUrl: "/payroll" },
    { title: "Kontrak akan berakhir", message: "Beberapa kontrak karyawan akan berakhir dalam 30 hari.", linkUrl: "/employees" }
  ];

  for (const notification of notifications) {
    await upsertByLookup(
      () => prisma.notification.findFirst({ where: { companyId, userId, title: notification.title, deletedAt: null } }),
      (id, data) => prisma.notification.update({ where: { id }, data }),
      () => prisma.notification.create({ data: { companyId, userId, ...notification, status: "UNREAD" } }),
      { message: notification.message, linkUrl: notification.linkUrl, status: "UNREAD" as const }
    );
  }
}

async function seedAuditLogs(companyId: string, userId: string, employeeId: string) {
  const logs = [
    { action: "LOGIN" as const, entityName: "User", entityId: userId, newValues: { email: "admin@hrispro.com" } },
    { action: "CREATE" as const, entityName: "Employee", entityId: employeeId, newValues: { source: "seed" } },
    { action: "EXPORT" as const, entityName: "Payroll", entityId: null, newValues: { format: "csv" } }
  ];

  for (const log of logs) {
    await upsertByLookup(
      () => prisma.auditLog.findFirst({ where: { companyId, userId, action: log.action, entityName: log.entityName, entityId: log.entityId ?? undefined, deletedAt: null } }),
      (id, data) => prisma.auditLog.update({ where: { id }, data }),
      () => prisma.auditLog.create({ data: { companyId, userId, ...log, ipAddress: "127.0.0.1", userAgent: "MAYAN Seed" } }),
      { newValues: log.newValues }
    );
  }
}

async function ensureApprovalForLeave(companyId: string, workflowId: string, leaveRequestId: string, employeeId: string, status: "PENDING" | "APPROVED" | "REJECTED") {
  const step = await prisma.approvalStep.findFirst({ where: { companyId, workflowId, stepOrder: 1 } });
  await upsertByLookup(
    () => prisma.approval.findFirst({ where: { companyId, workflowId, leaveRequestId, deletedAt: null } }),
    (id, data) => prisma.approval.update({ where: { id }, data }),
    () =>
      prisma.approval.create({
        data: {
          companyId,
          workflowId,
          approvalStepId: step?.id,
          approverEmployeeId: employeeId,
          leaveRequestId,
          targetType: "LEAVE_REQUEST",
          targetId: leaveRequestId,
          status: status === "APPROVED" ? "APPROVED" : status === "REJECTED" ? "REJECTED" : "PENDING",
          action: status === "APPROVED" ? "APPROVE" : status === "REJECTED" ? "REJECT" : undefined,
          actedAt: status === "PENDING" ? undefined : new Date()
        }
      }),
    {
      status: status === "APPROVED" ? "APPROVED" : status === "REJECTED" ? "REJECTED" : "PENDING",
      action: status === "APPROVED" ? "APPROVE" : status === "REJECTED" ? "REJECT" : undefined,
      actedAt: status === "PENDING" ? null : new Date()
    }
  );
}

async function upsertApprovalStep(companyId: string, workflowId: string, stepOrder: number, name: string, roleId: string) {
  return prisma.approvalStep.upsert({
    where: { workflowId_stepOrder: { workflowId, stepOrder } },
    update: { name, roleId },
    create: { companyId, workflowId, stepOrder, name, roleId }
  });
}

function componentSnapshot(
  companyId: string,
  payrollId: string,
  component: { id: string; code: string; name: string; type: "EARNING" | "DEDUCTION" | "BENEFIT" | "TAX" },
  amount: Prisma.Decimal
) {
  return {
    companyId,
    payrollId,
    salaryComponentId: component.id,
    componentCode: component.code,
    componentName: component.name,
    type: component.type,
    amount
  };
}

async function upsertByLookup<T extends { id: string }, U>(
  findExisting: () => Promise<T | null>,
  updateExisting: (id: string, data: U) => Promise<T>,
  createNew: () => Promise<T>,
  updateData: U
) {
  const existing = await findExisting();
  return existing ? updateExisting(existing.id, updateData) : createNew();
}

function startOfDay(date: Date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function withTime(date: Date, time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  const result = new Date(date);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

function minutesBetween(start: Date, end: Date) {
  return Math.max(0, Math.floor((end.getTime() - start.getTime()) / 60_000));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
