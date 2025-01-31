import {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
    TooltipProvider,
  } from "../../components/ui/tooltip";

  
const ColumnActionTooltipWrapper = ({
    handleClick,
    actionName,
    children,
  }: {
    handleClick?: () => void;
    actionName: string;
    children: React.ReactNode;
  }) => (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild className="p-1 transition-all duration-200 rounded-full cursor-pointer hover:opacity-70 hover:bg-zinc-200 dark:hover:bg-zinc-700 " onClick={handleClick}>
          {children}
        </TooltipTrigger>
        <TooltipContent className="animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2">
          <p>{actionName}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  export default ColumnActionTooltipWrapper;