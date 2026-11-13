export type AttendanceStatus = "PRESENT" | "LATE" | "ABSENT" | "LEAVE" | "SICK" | "PERMISSION";
export type CorrectionStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export type AttendanceRecord = {
  id: string;
  attendanceDate: string;
  clockInAt?: string | null;
  clockOutAt?: string | null;
  lateMinutes: number;
  workingMinutes: number;
  status: AttendanceStatus;
  employee?: {
    id: string;
    fullName: string;
    employeeNumber: string;
    department?: { name: string } | null;
  };
  corrections?: AttendanceCorrection[];
};

export type AttendanceListResponse = {
  data: AttendanceRecord[];
  meta: { page: number; limit: number; total: number; totalPages: number };
};

export type AttendanceCorrection = {
  id: string;
  reason: string;
  requestedClockInAt?: string | null;
  requestedClockOutAt?: string | null;
  status: CorrectionStatus;
  reviewedAt?: string | null;
  reviewerNote?: string | null;
  employee?: { fullName: string; employeeNumber: string };
  attendance?: AttendanceRecord | null;
};
