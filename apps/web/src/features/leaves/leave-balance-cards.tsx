import { CalendarDays } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { LeaveBalance } from "./types";

export function LeaveBalanceCards({ balances }: { balances: LeaveBalance[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {balances.map((balance) => (
        <Card key={balance.id} className="border-0 bg-white/85 shadow-sm ring-1 ring-slate-200/70">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{balance.leaveType.name}</p>
                <p className="mt-2 text-3xl font-bold">{Number(balance.remaining).toLocaleString("id-ID")}</p>
              </div>
              <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
                <CalendarDays className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Used {balance.used} / Accrued {balance.accrued}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
