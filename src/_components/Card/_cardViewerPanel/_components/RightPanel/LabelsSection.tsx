import { X, MoreHorizontal } from "lucide-react";
import { LabelIcon, LabelStartIcon } from "@/_components/shared/svg/SharedIcons";
import { LabelDropdown } from "@/_components/shared/LabelDropdown";
import { useCardMutation } from "../../../_mutations/useCardMutations";
import { Label } from "@/apis/LabelApis";
import { Button } from "@/components/ui/button";

interface LabelsSectionProps {
  cardId: number;
  labels: Label[];
  teamId: string;
}

export const LabelsSection = ({ cardId, labels, teamId }: LabelsSectionProps) => {
  const { updateCardMutation } = useCardMutation();

  const handleRemoveLabel = (labelId: string) => {
    updateCardMutation.mutate({
      cardId,
      labelId: labelId,
    });
  };

  return (
    <div className="space-y-3 rounded-md p-2 dark:bg-[#101010]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LabelIcon className="size-4 text-primary" />
          <span className="text-xs font-medium text-primary">Labels</span>
        </div>

        <LabelDropdown
          teamId={teamId}
          action={updateCardMutation}
          cardId={cardId}
        >
          
          <Button variant="ghost" className="w-fit h-fit p-1.5">
          <MoreHorizontal />
          </Button>
        </LabelDropdown>
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          {labels?.map((label) => (
            <div
              key={label.id}
              className="flex items-center gap-1 px-1.5 py-0.5 text-xs bg-muted/50 hover:bg-muted rounded-sm border border-border transition-colors dark:border-zinc-600 group"
            >
              <LabelStartIcon className="size-3.5" color={label.color} />
              <span className="text-xs font-medium">{label.name}</span>
              <X
                strokeWidth={3}
                className="size-4 opacity-0 group-hover:opacity-100 rounded-sm p-0.5 transition-all ease-linear cursor-pointer"
                onClick={() => handleRemoveLabel(label.id)}
              />
            </div>
          ))}
        </div>
        {(!labels || labels.length === 0) && (
          <div className="text-xs text-muted-foreground py-2">
            No labels assigned
          </div>
        )}
      </div>
    </div>
  );
};
