/** Column definitions for the table */
import { ColumnDef } from "@tanstack/react-table";

export type Task = {
  id: string;
  taskId: string;
  title: string;
  priority?: "urgent" | "high" | "medium" | "low";
  dueDate: string;
};

export const columns: ColumnDef<Task>[] = [
  {
    accessorKey: "taskId",
    header: "Task ID",
  },
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "priority",
    header: "Priority",
  },
  {
    accessorKey: "dueDate",
    header: "Due Date",
  },
];
