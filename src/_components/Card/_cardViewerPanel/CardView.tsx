 

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "../../../components/ui/sheet";

import { useState, useContext } from "react";


import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../../../components/ui/resizable";
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

  return (
    <Sheet open={isOpen} onOpenChange={() => !isLocked && closeModal()}>
      <SheetHeader>
        <SheetTitle>
          <div className="sr-only">{title}</div>
        </SheetTitle>
      </SheetHeader>
      <SheetContent
        side="bottom"
        className="w-full p-0 h-[90%] bg-white dark:bg-zinc-800"
        isCloseButtonNotHidden={false}
      >
        <ResizablePanelGroup direction="horizontal" className="h-full">
          <ResizablePanel defaultSize={40} minSize={30}>
            {/* <LeftPanel /> */}
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel
            defaultSize={40}
            minSize={30}
            className="shadow-xl dark:shadow-zinc-900 dark:bg-zinc-900"
          >
            <MainPanel
              columnName={columnName}
              isLocked={isLocked}
              setIsLocked={setIsLocked}
            />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={20} minSize={15}>
            <RightPanel />
          </ResizablePanel>
        </ResizablePanelGroup>
      </SheetContent>
    </Sheet>
  );
};

export default CardView;
