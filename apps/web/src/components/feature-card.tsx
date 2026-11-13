import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function FeatureCard({
  title,
  value,
  helper,
  icon: Icon,
  trend
}: {
  title: string;
  value: string | number;
  helper: string;
  icon?: LucideIcon;
  trend?: string;
}) {
  return (
    <Card className="overflow-hidden border-0 bg-white/85 shadow-sm ring-1 ring-slate-200/70">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="mt-3 text-3xl font-bold">{value}</div>
          </div>
          {Icon && (
            <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
              <Icon className="h-5 w-5" />
            </div>
          )}
        </div>
        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">{helper}</p>
          {trend && <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">{trend}</span>}
        </div>
      </CardContent>
    </Card>
  );
}
