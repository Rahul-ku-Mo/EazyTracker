import Card from "./Card";
import { CardProvider } from "../../context/CardProvider";
import { TCardContext } from "../../types/cardTypes";

interface CardColumnsProps {
  columnName: string;
  cards?: TCardContext[];
}

const CardsInColumn = ({ columnName, cards = [] }: CardColumnsProps) => {
  const sortedCards = [...cards].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  );

  if (sortedCards.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col rounded-md h-full overflow-y-auto">
      <ol className="space-y-2">
        {sortedCards.map((card, index) => (
          <li key={card.id}>
            <CardProvider cardDetails={card}>
              <Card
                columnName={columnName}
                index={index}
                totalCards={sortedCards.length}
              />
            </CardProvider>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default CardsInColumn;
