/** Column definitions for the table */
import { ColumnDef } from "@tanstack/react-table";

export type Member = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  imageUrl: string;
  action: string;
};

export const columns: ColumnDef<Member>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Role",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "imageUrl",
    header: "Image",
  },
  {
    accessorKey: "action",
    header: "Action",
  },
];
