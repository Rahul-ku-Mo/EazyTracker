import { motion } from "framer-motion";
import ColumnWorkspace from "../_components/Column/ColumnWorkspace";
import { useKanban } from "../context/KanbanProvider";

const KanbanPage = () => {
  // Get workspace data from context
  const { workspace } = useKanban();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative w-full h-full"
    >
      <ColumnWorkspace title={workspace?.title} />
    </motion.div>
  );
};

export default KanbanPage;
