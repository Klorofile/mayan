import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ReportsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Reports</CardTitle>
        <CardDescription>Reserved module for HR analytics, exports, and compliance reporting.</CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        This shell is intentionally prepared so reporting can be added without reshaping navigation.
      </CardContent>
    </Card>
  );
}
