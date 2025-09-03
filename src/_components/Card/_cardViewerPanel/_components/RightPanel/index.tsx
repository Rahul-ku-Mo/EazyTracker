import { Calendar } from "@/components/ui/calendar";
import { X, Share, Copy, Link } from "lucide-react";

import { CardContext } from "@/context/CardProvider";
import { TCardContext } from "@/types/cardTypes";
import { useContext } from "react";

import { useCardMutation } from "../../../_mutations/useCardMutations";
import { DateCreatedIcon } from "@/_components/shared/svg/ViewOptionsIcons";
import { DueDateDropdown } from "./DueDateDropdown";
import { PriorityDropdown } from "./PriorityDropdown";
import { AssigneesDropdown } from "./AssigneesDropdown";
import { LabelsSection } from "./LabelsSection";
import { AdditionalInfoSection } from "./AdditionalInfoSection";
import { TableOfContentsSection } from "./TableOfContentsSection";
import { AttachmentsSection } from "./AttachmentsSection";

const isToday = (date?: Date | string | null) => {
  if (!date) return false;
  const dateObj = date instanceof Date ? date : new Date(date);
  if (isNaN(dateObj.getTime())) return false; // Check for invalid date
  const today = new Date();
  return dateObj.toDateString() === today.toDateString();
};

const isTomorrow = (date?: Date | string | null) => {
  if (!date) return false;
  const dateObj = date instanceof Date ? date : new Date(date);
  if (isNaN(dateObj.getTime())) return false; // Check for invalid date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return dateObj.toDateString() === tomorrow.toDateString();
};

const formatDate = (date?: Date | string | null) => {
  if (!date) return "";
  const dateObj = date instanceof Date ? date : new Date(date);
  if (isNaN(dateObj.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(dateObj);
};

const RightPanel = () => {
  const cardDetails = useContext(CardContext);
  const teamId = localStorage.getItem("teamId") || "";
  const {
    priority = "low",
    dueDate,
    labels = [],
    id: cardId,
    slug,
    assignees,
    storyPoints = 0,
  } = cardDetails as TCardContext;
  const { updateCardMutation } = useCardMutation();

  // Find assigned members - use assignees array if available
  const assignedMembers = assignees || [];

  return (
    <div className="h-full lg:flex flex-col fixed right-0 w-[310px] hidden">
      <div className="p-4 px-2.5 flex flex-col gap-2.5 flex-1 border-r border border-border">
        {/* Task Details Header */}
        <h2 className="text-sm font-semibold rounded-md p-2">
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="text-sm font-semibold text-primary">{slug}</span>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Share
                strokeWidth={3}
                className="size-4 hover:text-primary hover:cursor-pointer hover:bg-primary/10 p-0.5 rounded-sm"
              />
              <Copy
                strokeWidth={3}
                className="size-4 hover:text-primary hover:cursor-pointer hover:bg-primary/10 p-0.5 rounded-sm"
              />
              <Link
                strokeWidth={3}
                className="size-4 hover:text-primary hover:cursor-pointer hover:bg-primary/10 p-0.5 rounded-sm"
              />
            </div>
          </div>
        </h2>

        {/* Priority Section */}
        <PriorityDropdown cardId={cardId} priority={priority} />

        {/* Due Date Section */}
        <div className="flex justify-between items-center rounded-md p-2 dark:bg-[#101010]">
          <div className="flex items-center gap-2">
            <DateCreatedIcon />
            <span className="text-xs font-medium text-primary">Due Date</span>
          </div>

          {dueDate ? (
            <div className="flex items-center gap-2">
              <div
                className={`px-3 py-1 text-xs font-medium rounded-md inline-flex gap-1.5 ${
                  isToday(dueDate)
                    ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                    : isTomorrow(dueDate)
                      ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                }`}
              >
                {isToday(dueDate)
                  ? "Today"
                  : isTomorrow(dueDate)
                    ? "Tomorrow"
                    : formatDate(dueDate)}
              </div>
              <X
                className="size-4 cursor-pointer rounded-sm p-0.5 hover:bg-muted/50 transition-colors"
                strokeWidth={3}
                onClick={() =>
                  updateCardMutation.mutate({ cardId, dueDate: null })
                }
              />
            </div>
          ) : (
            <DueDateDropdown cardId={cardId} currentDueDate={dueDate}>
              <Calendar
                mode="single"
                selected={dueDate ? new Date(dueDate) : undefined}
                onSelect={(date) => {
                  updateCardMutation.mutate({ cardId, dueDate: date });
                }}
                className="bg-white rounded-md dark:bg-zinc-900"
              />
            </DueDateDropdown>
          )}
        </div>

        {/* Labels Section */}
        <LabelsSection cardId={cardId} labels={labels} teamId={teamId} />

        {/* Assignees Section */}
        <AssigneesDropdown cardId={cardId} assignees={assignedMembers} />

        {/* Table of Contents Section */}
        <TableOfContentsSection cardId={cardId} />

        {/* Attachments Section */}
        <AttachmentsSection slug={slug} />
        {/* Additional Info Section */}
        <AdditionalInfoSection cardId={cardId} storyPoints={storyPoints} />
      </div>
    </div>
  );
};

export default RightPanel;
