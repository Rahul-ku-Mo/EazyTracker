
import { CardDetailsEditor } from "./CardDetailsEditor";
import { useQuery } from "@tanstack/react-query";
import { getCardDetails } from "../../../apis/CardApis";
import { CardLabels } from "./CardLabels";
import { CardAttachments } from "./CardAttachments";

export const CardDetails = ({ cardId } : {cardId: string }) => {
  const { data, isPending } = useQuery({
    queryKey: ["card", "card-details", cardId],
    queryFn: async () => await getCardDetails(cardId),
  });

  const onSave = () => {
    console.log("saved");
  };

  if (isPending) return <div>Loading...</div>;

  return (
    <>
      <div className="flex flex-col gap-2">
        <h3 className="mb-2 text-sm font-semibold dark:text-zinc-100">
          Description
        </h3>
        <CardDetailsEditor
          cardId={cardId}
          description={data?.description}
        />
      </div>
      <CardAttachments cardId={cardId} onSave={onSave} />
      <CardLabels />
    </>
  );
};
