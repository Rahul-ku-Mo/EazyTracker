/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  BookOpen,
  Bot,
  User,
  Tag,
  CheckSquare,
  Clock,
  Share2,
  Copy,
  Eye,
  Lock,
  Unlock,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "../../components/ui/button";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "../../components/ui/sheet";
import { ScrollArea } from "../../components/ui/scroll-area";
import { CardDetails } from "./_tabComponents/CardDetails";
import { useState } from "react";

interface CardViewProps {
  cardId: string;
  columnName: string;
  title: string;
  isOpen: boolean;
  closeModal: () => void;
}

const ActionButton = ({ icon: Icon, label }: { icon: any; label: string }) => (
  <Button variant="outline" size="sm" className="justify-start h-8 text-xs">
    <Icon className="w-3 h-3 mr-2" />
    {label}
  </Button>
);

const CardView = ({
  cardId,
  columnName,
  title,
  isOpen,
  closeModal,
}: CardViewProps) => {
  const [isLocked, setIsLocked] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={() => !isLocked && closeModal()}>
      <SheetContent side="right" className="sm:max-w-3xl p-0">
        <SheetHeader className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <SheetTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="w-5 h-5" />
                <span className="truncate">{title}</span>
              </SheetTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                in list <span className="underline">{columnName}</span>
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsLocked(!isLocked)}
              className="shrink-0"
            >
              {isLocked ? (
                <Lock className="w-4 h-4" />
              ) : (
                <Unlock className="w-4 h-4" />
              )}
            </Button>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-80px)] px-6 py-6 ">
          <div className=" space-y-6">
            {/* Details Section */}
            <CardDetails cardId={cardId} />

            {/* Activity Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Activity</h2>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-start space-x-4">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full",
                        "bg-muted flex items-center justify-center",
                        "text-muted-foreground"
                      )}
                    >
                      U{i}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">User {i}</p>
                      <p className="text-sm text-muted-foreground">
                        Added a comment: "This is a placeholder comment."
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        2 hours ago
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Summary Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">AI Summary</h2>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-4">
                  <Bot className="w-5 h-5 text-primary" />
                  <h3 className="text-sm font-semibold">AI Analysis</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  This task involves implementing a new feature for the user
                  dashboard. Key points: - Requires backend API changes -
                  Frontend updates needed in React components - Estimated
                  completion time: 3-5 days - High priority due to client
                  request
                </p>
              </div>
            </div>

            {/* Actions Section */}
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Add to card</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { icon: User, label: "Members" },
                    { icon: Tag, label: "Labels" },
                    { icon: CheckSquare, label: "Checklist" },
                    { icon: Clock, label: "Dates" },
                  ].map((action) => (
                    <ActionButton key={action.label} {...action} />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Actions</h3>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { icon: Share2, label: "Share" },
                    { icon: Copy, label: "Copy" },
                    { icon: Eye, label: "Watch" },
                  ].map((action) => (
                    <ActionButton key={action.label} {...action} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default CardView;
