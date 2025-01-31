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
        <button className="flex flex-col items-center justify-center p-2 transition-colors rounded-md cursor-pointer w-52 h-36 bg-zinc-800 hover:bg-zinc-600">
          <span className="text-sm font-bold">Create New Board</span>
          <span className="text-xs font-medium">{count} Remaining</span>
        </button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[20rem] p-2 bg-zinc-900" 
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
