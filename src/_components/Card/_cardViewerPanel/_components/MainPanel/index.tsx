import { Button } from "../../../../../components/ui/button";
import { CardDetailsEditor } from "../../../_tabComponents/CardDetailsEditor";
import { Lock, Unlock } from "lucide-react";
import { useContext } from "react";
import { CardContext } from "../../../../../context/CardProvider";
import { TCardContext } from "../../../../../types/cardTypes";

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
      <div className="flex items-center justify-between w-full">
        <Button className="p-2 text-sm">{columnName}</Button>
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
      <h2 className="py-4 text-3xl font-bold">{title}</h2>
      <CardDetailsEditor cardId={cardId} description={description as string} />
    </div>
  );
};

export default MainPanel;
