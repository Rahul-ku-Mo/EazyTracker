import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
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
      if (closeHandler && typeof closeHandler === "function") {
        closeHandler();
      }
      closeModal();
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleModalClose}>
      <SheetTitle className="sr-only">
       {title}
      </SheetTitle>
      <SheetDescription className="sr-only">
      Card details and comments for {title}
      </SheetDescription>
      <SheetContent
        side="right"
        id="editor-wrapper"
        className="!sm:max-w-[calc(100%-16rem)] !w-[calc(100%-16rem)] p-0 bg-white dark:bg-zinc-800 border-l border-gray-200 dark:border-border "
        isCloseButtonNotHidden={false}
      >
        <div className="flex dark:bg-[#181818] bg-[#fafafa] h-full">
          <MainPanel
            columnName={columnName}
            isLocked={isLocked}
            setIsLocked={setIsLocked}
          />
          <RightPanel />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CardView;
