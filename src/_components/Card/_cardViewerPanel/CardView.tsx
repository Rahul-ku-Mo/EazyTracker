 

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "../../../components/ui/sheet";

import { useState, useContext } from "react";



import { CardContext } from "../../../context/CardProvider";
import { TCardContext } from "../../../types/cardTypes";

//import LeftPanel from "./_components/LeftPanel";
import RightPanel from "./_components/RightPanel";
import MainPanel from "./_components/MainPanel";

interface CardViewProps {
  columnName: string;
  isOpen: boolean;
  closeModal: () => void;
}


const CardView = ({ columnName, isOpen, closeModal }: CardViewProps) => {
  const [isLocked, setIsLocked] = useState(false);

  const cardDetails = useContext(CardContext);

  const { title } = cardDetails as TCardContext;

  // Handle modal close - save card description if needed
  const handleModalClose = () => {
    if (!isLocked) {
      // Call the card editor close handler to save content
      const closeHandler = (window as any).__cardEditorCloseHandler;
      if (closeHandler && typeof closeHandler === 'function') {
        closeHandler();
      }
      closeModal();
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleModalClose}>
      <SheetHeader>
        <SheetTitle>
          <div className="sr-only">{title}</div>
        </SheetTitle>
      </SheetHeader>
      <SheetContent
        side="bottom"
        className="m-4 p-0 h-[90%] bg-white dark:bg-zinc-800 rounded-lg"
        isCloseButtonNotHidden={false}
      >
        <div className="h-full flex flex-wrap">   
          <div className="w-full md:w-4/5">
            <MainPanel
              columnName={columnName}
              isLocked={isLocked}
              setIsLocked={setIsLocked}
            />
          </div>
          <div className="w-full md:w-1/5">
            <RightPanel />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CardView;
