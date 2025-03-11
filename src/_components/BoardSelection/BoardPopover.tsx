import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";
import BoardForm from "./BoardForm";

interface BoardPopoverProps {
  count: number;
}

const BoardPopover = ({ count }: BoardPopoverProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="flex flex-col items-center justify-center p-2 rounded-md cursor-pointer w-52 h-36 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-600 border border-zinc-200 dark:border-zinc-700 transition-all duration-200 ease-in-out">
          <span className="text-sm font-bold text-zinc-900 dark:text-white">Create New Board</span>
          <span className="text-xs font-medium text-zinc-600 dark:text-white">{count} Remaining</span>
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
