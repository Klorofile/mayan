import { EmptyState } from "@/components/ui/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export type TableColumn<T> = {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
};

export function ReusableTable<T>({
  columns,
  data,
  emptyTitle = "No data available"
}: {
  columns: TableColumn<T>[];
  data: T[];
  emptyTitle?: string;
}) {
  if (!data.length) {
    return <EmptyState title={emptyTitle} description="Data akan tampil di sini setelah tersedia." />;
  }

  // Column render function menjaga table tetap reusable untuk data shape apa pun di modul HRIS.
  return (
    <div className="overflow-hidden rounded-2xl border bg-white">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50/80">
            {columns.map((column) => (
              <TableHead key={column.key}>{column.header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {columns.map((column) => (
                <TableCell key={column.key}>{column.render(row)}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
