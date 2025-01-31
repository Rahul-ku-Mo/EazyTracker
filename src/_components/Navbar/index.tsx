import User from "../shared/User";
import { Filter, ArrowUpDown } from "lucide-react";
import { Button } from "../../components/ui/button";

const Navbar = ({ title }: { title?: string | React.ReactNode }) => {
  return (
    <nav className="fixed top-0 z-20 flex items-center justify-between w-full h-12 p-2 bg-white border-b shadow-md text-zinc-950 dark:bg-zinc-950 dark:text-zinc-200">
      <div className="flex items-center gap-2 pl-16">
        {typeof title === "string" ? (
          <>
            <h2 className="text-sm font-bold uppercase">{title}</h2>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="w-8 h-8">
                <Filter className="w-4 h-4" />
                <span className="sr-only">Filter board</span>
              </Button>
              <Button variant="ghost" size="icon" className="w-8 h-8">
                <ArrowUpDown className="w-4 h-4" />
                <span className="sr-only">Sort board</span>
              </Button>
            </div>
          </>
        ) : (
          <h2 className="flex items-center w-full gap-2 grow">{title}</h2>
        )}
      </div>
      <div className="flex items-center gap-2">
        <User />
      </div>
    </nav>
  );
};

export default Navbar;
