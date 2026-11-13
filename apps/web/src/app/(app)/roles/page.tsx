"use client";

import { useQuery } from "@tanstack/react-query";
import { DataTableShell } from "@/components/data-table-shell";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api";

type RoleRow = {
  id: string;
  code: string;
  name: string;
  description?: string;
  permissions: { permission: { code: string } }[];
};

export default function RolesPage() {
  const { data = [] } = useQuery({
    queryKey: ["roles"],
    queryFn: async () => (await api.get<RoleRow[]>("/rbac/roles")).data
  });

  return (
    <DataTableShell title="Role Permission" description="RBAC roles mapped to granular feature permissions.">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Role</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Permissions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((role) => (
            <TableRow key={role.id}>
              <TableCell>
                <div className="font-medium">{role.name}</div>
                <div className="text-xs text-muted-foreground">{role.code}</div>
              </TableCell>
              <TableCell>{role.description ?? "-"}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-2">
                  {role.permissions.slice(0, 8).map(({ permission }) => (
                    <Badge key={permission.code}>{permission.code}</Badge>
                  ))}
                  {role.permissions.length > 8 && <Badge>+{role.permissions.length - 8}</Badge>}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </DataTableShell>
  );
}
