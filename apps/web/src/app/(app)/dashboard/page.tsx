"use client";

import { useQuery } from "@tanstack/react-query";
import { Banknote, CalendarCheck, Clock3, FileWarning, MapPin, Users } from "lucide-react";
import type { ReactNode } from "react";
import { FeatureCard } from "@/components/feature-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { getDashboardSummary } from "@/features/dashboard/api";
import { DistributionChart, WeeklyAttendanceChart } from "@/features/dashboard/dashboard-charts";

const fallback = {
  totals: { totalEmployees: 0, todayAttendance: 0, activeLeaves: 0, currentMonthPayroll: "0" },
  weeklyAttendance: [],
  latestLeaveRequests: [],
  employeesByDepartment: [],
  employeesByLocation: [],
  payrollReminder: null,
  expiringContracts: []
};

export default function DashboardPage() {
  const { data = fallback, isLoading } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: getDashboardSummary,
    // Dashboard tetap render fallback agar shell bisa dibuka saat API belum login/aktif.
    retry: false
  });

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl bg-slate-950 p-6 text-white shadow-xl">
        <div className="relative">
          <div className="absolute -right-10 -top-16 h-44 w-44 rounded-full bg-emerald-400/30 blur-3xl" />
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-300">MAYAN Command Center</p>
          <h1 className="mt-4 max-w-3xl text-3xl font-bold tracking-tight md:text-5xl">Dashboard utama untuk ritme HR enterprise.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
            Pantau karyawan, absensi, cuti, payroll, distribusi organisasi, reminder, dan kontrak dalam satu layar.
          </p>
        </div>
      </section>

      {isLoading ? (
        <LoadingState />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <FeatureCard title="Total Karyawan" value={data.totals.totalEmployees} helper="Active + probation" icon={Users} />
          <FeatureCard title="Kehadiran Hari Ini" value={data.totals.todayAttendance} helper="Attendance records today" icon={Clock3} />
          <FeatureCard title="Cuti Aktif" value={data.totals.activeLeaves} helper="Approved leave today" icon={CalendarCheck} />
          <FeatureCard title="Payroll Bulan Ini" value={formatCurrency(data.totals.currentMonthPayroll)} helper="Total net payroll" icon={Banknote} />
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <Card className="border-0 bg-white/85 shadow-sm ring-1 ring-slate-200/70">
          <CardHeader>
            <CardTitle>Grafik Kehadiran Mingguan</CardTitle>
            <CardDescription>Jumlah attendance record dalam 7 hari terakhir.</CardDescription>
          </CardHeader>
          <CardContent>
            <WeeklyAttendanceChart data={data.weeklyAttendance} />
          </CardContent>
        </Card>

        <Card className="border-0 bg-white/85 shadow-sm ring-1 ring-slate-200/70">
          <CardHeader>
            <CardTitle>Reminder Payroll</CardTitle>
            <CardDescription>Periode payroll yang perlu ditindaklanjuti.</CardDescription>
          </CardHeader>
          <CardContent>
            {data.payrollReminder ? (
              <div className="rounded-2xl bg-emerald-50 p-5">
                <p className="font-semibold">{data.payrollReminder.name}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Payment date: {data.payrollReminder.paymentDate ? new Date(data.payrollReminder.paymentDate).toLocaleDateString() : "-"}
                </p>
                <Badge className="mt-4">{data.payrollReminder.status}</Badge>
              </div>
            ) : (
              <EmptyState title="Tidak ada reminder" description="Payroll reminder akan tampil jika ada periode open/processed." />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <DistributionCard title="Distribusi per Department" data={data.employeesByDepartment} icon={<Users className="h-5 w-5" />} />
        <DistributionCard title="Karyawan berdasarkan Lokasi" data={data.employeesByLocation} icon={<MapPin className="h-5 w-5" />} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="border-0 bg-white/85 shadow-sm ring-1 ring-slate-200/70">
          <CardHeader>
            <CardTitle>Pengajuan Cuti Terbaru</CardTitle>
            <CardDescription>5 request cuti terbaru dari API summary.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.latestLeaveRequests.length ? (
              data.latestLeaveRequests.map((leave) => (
                <div key={leave.id} className="flex items-center justify-between gap-3 rounded-2xl border bg-slate-50/70 p-4">
                  <div>
                    <p className="font-medium">{leave.employeeName}</p>
                    <p className="text-sm text-muted-foreground">
                      {leave.leaveType} • {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge>{leave.status}</Badge>
                </div>
              ))
            ) : (
              <EmptyState title="Belum ada pengajuan" description="Request cuti terbaru akan tampil di sini." />
            )}
          </CardContent>
        </Card>

        <Card className="border-0 bg-white/85 shadow-sm ring-1 ring-slate-200/70">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileWarning className="h-5 w-5 text-amber-600" />
              Kontrak Akan Berakhir
            </CardTitle>
            <CardDescription>Kontrak aktif yang berakhir dalam 30 hari.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.expiringContracts.length ? (
              data.expiringContracts.map((contract) => (
                <div key={contract.id} className="rounded-2xl border bg-amber-50/70 p-4">
                  <p className="font-medium">{contract.employeeName}</p>
                  <p className="text-sm text-muted-foreground">
                    {contract.contractNumber} • Ends {contract.endDate ? new Date(contract.endDate).toLocaleDateString() : "-"}
                  </p>
                </div>
              ))
            ) : (
              <EmptyState title="Tidak ada kontrak urgent" description="Kontrak yang mendekati akhir akan tampil di sini." />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DistributionCard({ title, data, icon }: { title: string; data: Array<{ name: string; value: number }>; icon: ReactNode }) {
  return (
    <Card className="border-0 bg-white/85 shadow-sm ring-1 ring-slate-200/70">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length ? <DistributionChart data={data} /> : <EmptyState title="Data kosong" description="Distribusi akan tampil setelah data employee tersedia." />}
      </CardContent>
    </Card>
  );
}

function formatCurrency(value: string | number) {
  return `Rp ${Number(value).toLocaleString("id-ID")}`;
}
