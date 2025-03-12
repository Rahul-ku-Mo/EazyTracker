import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Task } from "./columns";

import { Badge } from "@/components/ui/badge";

interface DataTableProps {
  columns: ColumnDef<Task>[];
  data: Task[];
}

export function DataTable({ columns, data }: DataTableProps) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className="transition-colors hover:bg-muted/50"
              >
                {row.getVisibleCells().map((cell) => {
                  const value = cell.getValue();
                  const columnId = cell.column.id;

                  return (
                    <TableCell key={cell.id}>
                      {columnId === "priority" ? (
                        <Badge
                          variant={
                            value === "urgent"
                              ? "destructive"
                              : value === "high"
                              ? "default"
                              : value === "medium"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {value as string}
                        </Badge>
                      ) : columnId === "dueDate" ? (
                        new Date(value as string).toLocaleDateString()
                      ) : columnId === "createdAt" ||
                        columnId === "updatedAt" ? (
                        new Date(value as string).toLocaleString()
                      ) : (
                        flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No tasks found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
