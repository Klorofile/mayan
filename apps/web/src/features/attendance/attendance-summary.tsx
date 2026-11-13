import { CalendarCheck, Clock3, TimerReset } from "lucide-react";
import { FeatureCard } from "@/components/feature-card";
import type { AttendanceRecord } from "./types";

export function AttendanceSummary({ records }: { records: AttendanceRecord[] }) {
  const present = records.filter((record) => record.status === "PRESENT").length;
  const late = records.filter((record) => record.status === "LATE").length;
  const workingMinutes = records.reduce((total, record) => total + (record.workingMinutes ?? 0), 0);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <FeatureCard title="Present" value={present} helper="Total tepat waktu" icon={CalendarCheck} />
      <FeatureCard title="Late" value={late} helper="Perlu perhatian" icon={TimerReset} />
      <FeatureCard title="Working Hours" value={`${Math.floor(workingMinutes / 60)}h`} helper="Akumulasi jam kerja" icon={Clock3} />
    </div>
  );
}
