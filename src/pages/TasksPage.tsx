import { useState } from "react";
import { DataTable } from "@/components/Table/data-table";
import { KanbanBoard } from "@/components/KanbanBoard";
import { ViewToggle } from "@/components/ViewToggle";
import { columns } from "@/components/Table/columns";
import { Task } from "@/components/Table/columns";

export default function TasksPage() {
  const [view, setView] = useState<"table" | "kanban">("table");
  const [tasks, setTasks] = useState<Task[]>([]); // Your tasks data here

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <ViewToggle view={view} onViewChange={setView} />
      </div>

      {view === "table" ? (
        <DataTable columns={columns} data={tasks} />
      ) : (
        <KanbanBoard tasks={tasks} />
      )}
    </div>
  );
}
