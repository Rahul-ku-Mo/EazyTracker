import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import BoardForm from "./BoardForm";
import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import clsx from "clsx";
import { LockIcon } from "lucide-react";

interface BoardPopoverProps {
  count: number;
}

const BoardPopover = ({ count }: BoardPopoverProps) => {
  const { role } = useContext(AuthContext);

  console.log(role)

  return (
    <Popover>
      <PopoverTrigger asChild disabled={role !== "ADMIN"}>
        <button 
          className={clsx(
            `relative flex flex-col items-center justify-center p-2 rounded-md cursor-pointer w-52 h-36 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-600 border border-zinc-200 dark:border-zinc-700 transition-all duration-200 ease-in-out`, 
            role === "ADMIN" && "bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
          )}
        >
          <span className="text-sm font-bold text-zinc-900 dark:text-white">Create New Board</span>
          <span className="text-xs font-medium text-zinc-600 dark:text-white">{count} Remaining</span>
          
          {role !== "ADMIN" && (
            <div 
              className="absolute inset-0 flex items-center justify-center dark:bg-black/80 bg-white/80 rounded-md opacity-0 hover:opacity-100 transition-opacity duration-200"
            >
              <LockIcon className="w-8 h-8 dark:text-white text-black" />
            </div>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[20rem] p-2 bg-zinc-50 dark:bg-zinc-900 transition-colors duration-200" 
        align="start"
        side="right"
        sideOffset={5}
      >
        <BoardForm count={count} />
      </PopoverContent>
    </Popover>
  );
};

export default BoardPopover;
