import { describe, expect, it } from "vitest";
import { employeeSchema } from "./employee-form";

describe("employeeSchema", () => {
  it("accepts valid employee form values", () => {
    const result = employeeSchema.safeParse({
      employeeNumber: "MYN-1001",
      fullName: "QA Employee",
      email: "qa.employee@mayan.test",
      hireDate: "2026-05-01",
      status: "ACTIVE"
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid email and empty join date", () => {
    const result = employeeSchema.safeParse({
      employeeNumber: "MYN-1001",
      fullName: "QA Employee",
      email: "not-an-email",
      hireDate: "",
      status: "ACTIVE"
    });

    // Validasi form dipisah supaya bug UI tidak lolos saat schema kontrak berubah.
    expect(result.success).toBe(false);
  });
});
