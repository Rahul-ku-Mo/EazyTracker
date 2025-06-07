import { CardProvider } from "@/context/CardProvider";
import CardView from "@/_components/Card/_cardViewerPanel/CardView";

interface CardModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: any;
}

const CardModal = ({ isOpen, onClose, card }: CardModalProps) => {
  if (!isOpen || !card) {
    return null;
  }

  // Transform the card details to match TCardContext type
  const transformedCardDetails = {
    ...card,
    // Ensure dueDate is a Date object if it exists
    dueDate: card.dueDate ? new Date(card.dueDate) : undefined,
  };

  return (
    <CardProvider cardDetails={transformedCardDetails}>
      <CardView 
        isOpen={isOpen} 
        closeModal={onClose} 
        columnName="List View" 
      />
    </CardProvider>
  );
};

export default CardModal; 