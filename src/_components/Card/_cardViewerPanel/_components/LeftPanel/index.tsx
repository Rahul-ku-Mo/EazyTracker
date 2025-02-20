import { Button } from "../../../../../components/ui/button";
import { Plus } from "lucide-react";

const LeftPanel = () => {
  return (
    <div className="h-full border-r border-border dark:border-zinc-700">
      <div className="p-4">
        <h3 className="mb-4 text-sm font-semibold dark:text-zinc-200">
          Mind Maps
        </h3>
        <Button className="justify-start w-full text-sm" variant="ghost">
          <Plus className="w-4 h-4 mr-2" />
          Add new mind map
        </Button>
        <div className="mt-4 space-y-3">
          <div className="p-3 border border-dashed rounded-lg cursor-move hover:border-primary dark:border-zinc-700 dark:hover:border-zinc-500">
            <h4 className="text-sm font-medium dark:text-zinc-200">
              Project Overview
            </h4>
            <div className="mt-2 space-y-1">
              <div className="inline-block w-2 h-2 mr-2 bg-blue-500 rounded-full" />
              <span className="text-xs text-muted-foreground">3 nodes</span>
            </div>
          </div>

          <div className="p-3 border border-dashed rounded-lg cursor-move hover:border-primary dark:border-zinc-700 dark:hover:border-zinc-500">
            <h4 className="text-sm font-medium dark:text-zinc-200">
              Feature Breakdown
            </h4>
            <div className="mt-2 space-y-1">
              <div className="inline-block w-2 h-2 mr-2 bg-green-500 rounded-full" />
              <span className="text-xs text-muted-foreground">5 nodes</span>
            </div>
          </div>

          <div className="p-3 border border-dashed rounded-lg cursor-move hover:border-primary dark:border-zinc-700 dark:hover:border-zinc-500">
            <h4 className="text-sm font-medium dark:text-zinc-200">
              Dependencies
            </h4>
            <div className="mt-2 space-y-1">
              <div className="inline-block w-2 h-2 mr-2 rounded-full bg-amber-500" />
              <span className="text-xs text-muted-foreground">2 nodes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeftPanel;
