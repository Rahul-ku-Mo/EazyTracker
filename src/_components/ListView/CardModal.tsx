import { useQuery } from "@tanstack/react-query";
import { getCardDetails } from "@/apis/CardApis";
import { CardProvider } from "@/context/CardProvider";
import CardView from "@/_components/Card/_cardViewerPanel/CardView";
import LoadingScreen from "@/_components/LoadingScreen";

interface CardModalProps {
  cardId: number | null;
  isOpen: boolean;
  onClose: () => void;
  columnName?: string;
}

const CardModal = ({ cardId, isOpen, onClose, columnName = "Unknown" }: CardModalProps) => {
  const { data: cardDetails, isLoading, isError } = useQuery({
    queryKey: ["cardDetails", cardId],
    queryFn: () => getCardDetails(cardId!),
    enabled: !!cardId && isOpen,
  });

  if (!isOpen || !cardId) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
        <LoadingScreen />
      </div>
    );
  }

  if (isError || !cardDetails) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
        <div className="bg-background p-6 rounded-lg">
          <h3 className="text-lg font-medium mb-2">Error Loading Card</h3>
          <p className="text-muted-foreground mb-4">Unable to load card details.</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // Transform the card details to match TCardContext type
  const transformedCardDetails = {
    ...cardDetails,
    // Ensure dueDate is a Date object if it exists
    dueDate: cardDetails.dueDate ? new Date(cardDetails.dueDate) : undefined,
  };

  return (
    <CardProvider cardDetails={transformedCardDetails}>
      <CardView 
        isOpen={isOpen} 
        closeModal={onClose} 
        columnName={columnName} 
      />
    </CardProvider>
  );
};

export default CardModal; 