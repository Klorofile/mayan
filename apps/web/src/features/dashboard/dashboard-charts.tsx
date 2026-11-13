"use client";

import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const colors = ["#10b981", "#22c55e", "#84cc16", "#14b8a6", "#64748b"];

export function WeeklyAttendanceChart({ data }: { data: Array<{ label: string; attendance: number }> }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} />
        <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
        <Tooltip />
        <Bar dataKey="attendance" radius={[10, 10, 0, 0]} fill="#10b981" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function DistributionChart({ data }: { data: Array<{ name: string; value: number }> }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        {/* Donut chart memudahkan HR membaca proporsi department/lokasi tanpa tabel panjang. */}
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={58} outerRadius={95} paddingAngle={4}>
          {data.map((_, index) => (
            <Cell key={index} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}
