import { Button } from "./ui/button";
import { LayoutGrid, Table } from "lucide-react";
import useToggleViewStore from "../store/toggleViewStore";
import { useStore } from "zustand";

export function ViewToggle() {
  const { view, toggleView } = useStore(useToggleViewStore);

  return (
    <Button variant="outline" size="icon" onClick={toggleView}>
      {view === "listview" ? (
        <Table className="h-[1.2rem] w-[1.2rem]  transition-all " />
      ) : (
        <LayoutGrid className=" h-[1.2rem] w-[1.2rem]  transition-all  " />
      )}
      <span className="sr-only">Toggle view</span>
    </Button>
  );
}
