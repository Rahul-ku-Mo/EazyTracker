import Card from "./Card";
import { CardProvider } from "../../context/CardProvider";
import { Draggable } from "react-beautiful-dnd";
import { cn } from "../../lib/utils";
import { ViewOptions } from "@/store/useViewOptionsStore";

interface CardColumnsProps {
  columnName: string;
  cards: any[];
  viewOptions?: ViewOptions;
  members?: any[];
}

const CardsInColumn = ({ columnName, cards = [], viewOptions, members }: CardColumnsProps) => {
  // Ensure cards array is stable and sorted
  const sortedCards = Array.isArray(cards) ? [...cards] : [];
  
  return (
    <div className="flex flex-col rounded-md h-full overflow-y-auto px-1 pt-2 bg-transparent">
        <ol className="flex flex-col gap-1.5">
          {sortedCards.map((card, index) => {
            // Ensure card has required properties for drag and drop
            if (!card || !card.id) {
              console.warn('Card missing required properties:', card);
              return null;
            }

            return (
              <Draggable 
                key={`card-${card.id}`} 
                draggableId={card.id.toString()} 
                index={index}
                isDragDisabled={false}
              >
                {(provided, snapshot) => (
                  <li
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={cn(
                      "transition-all duration-300 ease-out",
                      snapshot.isDragging && "shadow-2xl z-50 rotate-1 scale-105 transform-gpu",
                      !snapshot.isDragging && "hover:shadow-lg",
                      // Add bottom margin only to last card and when not dragging
                      index === sortedCards.length - 1 && !snapshot.isDragging && "mb-10"
                    )}
                    style={{
                      ...provided.draggableProps.style,
                    }}
                  >
                    <CardProvider cardDetails={card}>
                      <Card
                        columnName={columnName}
                        viewOptions={viewOptions}
                        members={members}
                      />
                    </CardProvider>
                  </li>
                )}
              </Draggable>
            );
          })}
        </ol>
    </div>
  );
};

export default CardsInColumn;
