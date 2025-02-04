import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import ColumnBoard from "../_components/Column/ColumnBoard";
import { useBoard } from "../hooks/useQueries";
import { useParams } from "react-router-dom";
import Cookies from "js-cookie";
import LoadingScreen from "../_components/LoadingScreen";

const KanbanPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const accessToken: string = Cookies.get("accessToken") || "";

  const { data: boardDetail, isPending, isError } = useBoard(accessToken, id || "");

  // Function to handle going back to the boards section
  const handleGoBack = () => {
    navigate("/boards");
  };

  if (isPending) {
    return <LoadingScreen />;
  }

  if (isError) {
    return (
      <motion.div
        className="absolute inset-0 w-full h-full flex flex-col items-center justify-center gap-4 bg-background"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <h2 className="text-lg font-medium text-destructive">Access Error</h2>
        <p className="text-sm text-muted-foreground text-center">
          The board you're trying to access either doesn't exist or you don't have permission to view it.
        </p>
        <button
          onClick={handleGoBack}
          className="mt-4 px-6 py-2 flex items-center gap-2 text-sm font-medium text-white bg-destructive rounded-md hover:bg-destructive/90 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Go Back to Boards
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative w-full h-full"
    >
      {/* Optional: Background image */}
      {/* <img
        className="fixed inset-0 object-cover h-full w-full bg-gradient-to-t from-black to-transparent z-[-1]"
        src={boardDetail?.imageFullUrl}
        alt="Dashboard"
      /> */}

      {/* Back button */}
      <button
        onClick={handleGoBack}
        className="absolute top-4 left-4 px-4 py-2 flex items-center gap-2 text-sm font-medium text-foreground bg-background rounded-md hover:bg-accent transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
        Back to Boards
      </button>

      {/* Column Board */}
      <ColumnBoard title={boardDetail?.title} />
    </motion.div>
  );
};

export default KanbanPage;