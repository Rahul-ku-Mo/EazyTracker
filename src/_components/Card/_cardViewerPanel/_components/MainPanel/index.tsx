import { Button } from "@/components/ui/button";
import { CardDetailsEditor } from "../../../_editor/editor.tsx";
import { Lock, Unlock } from "lucide-react";
import { useContext } from "react";
import { CardContext } from "@/context/CardProvider.tsx";
import { TCardContext } from "@/types/cardTypes";
import { Badge } from "@/components/ui/badge.tsx";

const MainPanel = ({
  columnName,
  isLocked,
  setIsLocked,
}: {
  columnName: string;
  isLocked: boolean;
  setIsLocked: (locked: boolean) => void;
}) => {
  const cardDetails = useContext(CardContext);

  const { description, id: cardId, title } = cardDetails as TCardContext;

  return (
    <div className="relative p-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2 flex-col">
          <Badge className="rounded-full bg-transparent w-fit text-muted-foreground border-muted-foreground dark:text-white dark:border-white hover:bg-muted-foreground hover:text-background dark:hover:bg-white dark:hover:text-black">{columnName}</Badge>
          <h2 className=" text-lg font-bold">{title}</h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsLocked(!isLocked)}
        >
          {isLocked ? (
            <Lock className="w-4 h-4" />
          ) : (
            <Unlock className="w-4 h-4" />
          )}
        </Button>
      </div>

      <CardDetailsEditor cardId={cardId} description={description as string} />
    </div>
  );
};

export default MainPanel;
