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
import { Member } from "./user-columns";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Shield, User, Settings, UserX } from "lucide-react";
import clsx from "clsx";

interface UserTableProps {
  columns: ColumnDef<Member>[];
  data: Member[];
}

export function UserTable({ columns, data }: UserTableProps) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleEditPermissions = (userId: string) => {
    console.log(`Editing permissions for user: ${userId}`);
  };

  const handleDisableUser = (userId: string) => {
    console.log(`Disabling user: ${userId}`);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'destructive';
      case 'moderator':
        return 'secondary';
      case 'user':
      default:
        return 'outline';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return <Shield className="h-3 w-3" />;
      case 'moderator':
        return <Settings className="h-3 w-3" />;
      case 'user':
      default:
        return <User className="h-3 w-3" />;
    }
  };

  return (
    <div className="rounded-lg border border-border/50 overflow-hidden">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="bg-muted/30 hover:bg-muted/30">
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="font-medium text-foreground">
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row, index) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className={clsx(
                  "transition-colors hover:bg-muted/50",
                  index % 2 === 0 ? "bg-background" : "bg-muted/20"
                )}
              >
                {row.getVisibleCells().map((cell) => {
                  const value = cell.getValue();
                  const columnId = cell.column.id;

                  return (
                    <TableCell key={cell.id} className="py-4">
                      {columnId === "role" ? (
                        <Badge
                          variant={getRoleBadgeVariant(value as string)}
                          className="gap-1 text-xs font-medium"
                        >
                          {getRoleIcon(value as string)}
                          {(value as string)?.charAt(0).toUpperCase() + (value as string)?.slice(1)}
                        </Badge>
                      ) : columnId === "action" ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              className="h-8 w-8 p-0 hover:bg-muted transition-colors"
                            >
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem 
                              onClick={() => handleEditPermissions(row.original.id)}
                              className="gap-2 cursor-pointer"
                            >
                              <Settings className="h-4 w-4" />
                              Edit Permissions
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDisableUser(row.original.id)}
                              className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                            >
                              <UserX className="h-4 w-4" />
                              Disable User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <div className="flex items-center">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </div>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <User className="h-8 w-8" />
                  <p className="text-sm">No team members found.</p>
                  <p className="text-xs">Invite members to start collaborating.</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

