import Card from "./Card";
import { CardProvider } from "../../context/CardProvider";
import { TCardContext } from "../../types/cardTypes";

interface CardColumnsProps {
  columnName: string;
  cards?: TCardContext[];
}

const CardsInColumn = ({ columnName, cards = [] }: CardColumnsProps) => {
  // Don't sort here - use the cards as they are passed (already sorted by parent)
  if (cards.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col rounded-md h-full overflow-y-auto">
      <ol className="space-y-2">
        {cards.map((card, index) => (
          <li key={card.id}>
            <CardProvider cardDetails={card}>
              <Card
                columnName={columnName}
                index={index}
                totalCards={cards.length}
              />
            </CardProvider>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default CardsInColumn;
