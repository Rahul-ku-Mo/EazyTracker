import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { useWorkspace } from "../hooks/useQueries";
import { useParams } from "react-router-dom";

import LoadingScreen from "../_components/LoadingScreen";
import ColumnWorkspace from "../_components/Column/ColumnWorkspace";

const KanbanPage = () => {
  const { slug } = useParams();

  const teamId = localStorage.getItem("teamId");
  const teamName = localStorage.getItem("teamName");
  
  const navigate = useNavigate();

  // Handle both new teamId + slug pattern and legacy slug pattern
  const workspaceIdentifier = teamId && slug ? `${teamId}/${slug}` : slug || "";
  const { data: workspaceDetail, isPending, isError } = useWorkspace(workspaceIdentifier);

  // Function to handle going back to the boards section
  const handleGoBack = () => {
    navigate(`/workspace/${teamName}`);
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
          The board you're trying to access either doesn't exist or you don't
          have permission to view it.
        </p>
        <button
          onClick={handleGoBack}
          className="mt-4 px-6 py-2 flex items-center gap-2 text-sm font-medium text-white bg-destructive rounded-md hover:bg-destructive/90 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Go Back to Workspaces
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
      <ColumnWorkspace title={workspaceDetail?.title} />
    </motion.div>
  );
};

export default KanbanPage;
