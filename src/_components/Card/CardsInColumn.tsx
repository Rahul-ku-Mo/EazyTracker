import { cn } from "../../lib/utils";
import { ScrollArea } from "../../components/ui/scroll-area";
import Card from "./Card";
import { CardProvider } from "../../Context/CardProvider";
import { TCardContext } from "../../types/cardTypes";

interface CardColumnsProps {
  columnName: string;
  cards?: TCardContext[];
}

const CardsInColumn = ({ columnName, cards = [] }: CardColumnsProps) => {
  const sortedCards = [...cards].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  if (sortedCards.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col h-full w-[272px] ">
      <ScrollArea className={cn("flex-1", "rounded-md", "p-1")}>
        <ol className="space-y-2">
          {sortedCards.map((card) => (
            <li key={card.id}>
              <CardProvider cardDetails={card}>
                <Card columnName={columnName} />
              </CardProvider>
            </li>
          ))}
        </ol>
      </ScrollArea>
    </div>
  );
};

export default CardsInColumn;
