import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import BoardForm from "./BoardForm";
import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import { useFeatureGating } from "@/hooks/useFeatureGating";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import clsx from "clsx";
import { LockIcon, PlusIcon, Crown, ArrowRight } from "lucide-react";

interface BoardPopoverProps {
  count: number;
}

const BoardPopover = ({ count }: BoardPopoverProps) => {
  const { role } = useContext(AuthContext);
  const { getUpgradeMessage } = useFeatureGating();
  
  const canCreateBoards = count > 0;
  const isUnlimited = count === -1; // -1 indicates unlimited for Pro/Enterprise plans
  
  // If user can't create more boards, show upgrade prompt instead of popover
  if (!canCreateBoards && !isUnlimited) {
    return (
      <Card className="w-52 h-36 border-dashed border-2 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10 flex flex-col justify-center">
        <CardHeader className="text-center pb-2 pt-4">
          <div className="w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center bg-blue-100 dark:bg-blue-900/30">
            <Crown className="w-4 h-4 text-blue-500" />
          </div>
          <Badge className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 mx-auto">
            Professional Required
          </Badge>
        </CardHeader>
        <CardContent className="pt-0 text-center">
          <CardTitle className="text-sm mb-1">Project Limit Reached</CardTitle>
          <CardDescription className="text-xs mb-3">
            {getUpgradeMessage('projects')}
          </CardDescription>
          <Link to="/workspace/billing">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-xs h-7">
              Upgrade
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Popover>
      <PopoverTrigger asChild disabled={role !== "ADMIN" || (!canCreateBoards && !isUnlimited)}>
        <button 
          className={clsx(
            `relative flex flex-col items-center justify-center p-2 rounded-md cursor-pointer w-52 h-36 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-600 border border-zinc-200 dark:border-zinc-700 transition-all duration-200 ease-in-out`, 
            role === "ADMIN" && canCreateBoards && "bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700",
            (!canCreateBoards && !isUnlimited) && "cursor-not-allowed opacity-50"
          )}
        >
          <PlusIcon className="w-8 h-8 mb-2 text-zinc-900 dark:text-white" />
          <span className="text-sm font-bold text-zinc-900 dark:text-white">Create New Board</span>
          <span className="text-xs font-medium text-zinc-600 dark:text-white">
            {isUnlimited ? "Unlimited" : `${count} Remaining`}
          </span>
          
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
