import Card from "./Card";
import { CardProvider } from "../../context/CardProvider";
import { Draggable } from "react-beautiful-dnd";
import { cn } from "../../lib/utils";

interface CardColumnsProps {
  columnName: string;
  cards: any[];
}

const CardsInColumn = ({ columnName, cards = [] }: CardColumnsProps) => {
  // Ensure cards array is stable and sorted
  const sortedCards = Array.isArray(cards) ? [...cards] : [];
  
  if (sortedCards.length === 0) {
    return (
      <div className="flex flex-col rounded-md h-full overflow-y-auto px-2 pt-2">
        <div className="flex flex-col items-center justify-center min-h-[200px] text-center text-sm text-muted-foreground py-6 border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-lg transition-all duration-300 hover:border-emerald-300 dark:hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10">
          <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-3 transition-colors duration-300">
            <svg className="w-5 h-5 text-zinc-400 dark:text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <div className="text-zinc-400 dark:text-zinc-500 font-medium">Drop cards here</div>
          <div className="text-xs text-zinc-300 dark:text-zinc-600 mt-1">Drag any card to this column</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-md h-full overflow-y-auto px-1 pt-2 bg-transparent">
      <ol className="flex flex-col gap-4">
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
