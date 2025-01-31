import ColumnBoard from "../_components/Column/ColumnBoard";
import { useBoard } from "../hooks/useQueries";
import { useParams } from "react-router-dom";
import Cookies from "js-cookie";
import LoadingScreen from "../_components/LoadingScreen";


const KanbanPage = () => {
  const { id } = useParams();

  const accessToken: string = Cookies.get("accessToken") || "";

  const { data: boardDetail, isPending } = useBoard(accessToken, id || "");

  if (isPending) {
    return <LoadingScreen />;
  }

  return (
    <>
     
        <img
          className="fixed inset-0 object-cover h-full w-full bg-gradient-to-t from-black to-transparent z-[-1]"
          src={boardDetail?.imageFullUrl}
          alt="Dashboard"
        />
        <ColumnBoard title={boardDetail?.title} />
    
    </>
  );
};

export default KanbanPage;
