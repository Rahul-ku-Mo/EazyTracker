import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, FileText, Info } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { TCardContext } from "@/types/cardTypes"
import { useQuery } from "@tanstack/react-query"
import { timeEntryService, TimeEntry } from "@/services/analytics.service"
import { Timer } from "./Timer"

export const TimeTracker = (selectedCard: TCardContext) => {
  
    // Always fetch the current active time entry to know its state
    const { data: globalCurrentActiveTimeEntry } = useQuery({
        queryKey: ["currentActiveTimeEntry"],
        queryFn: async () => {
            return timeEntryService.getCurrentActiveTimeEntry();
        },
        // Only refetch when there's an active timer running, with longer intervals
        refetchInterval: (query) => {
            const data = query.state.data;
            const hasActiveTimer = data && !data.endTime && !data.isPaused;
            return hasActiveTimer ? 30000 : false; // 30 seconds when active, no refetch when idle
        },
    });

    const { data: timeEntries = [], isPending, isError } = useQuery({
        queryKey: ["timeEntries", selectedCard.id],
        queryFn: async () => {
            return timeEntryService.getTimeEntries(selectedCard.id);
        },
        enabled: !!selectedCard.id
    });

    const formatRelativeTime = (date: Date) => {
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
        
        if (diffInSeconds < 60) return 'just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return date.toLocaleDateString();
    };

    const formatTimeRange = (start: Date, end: Date) => {
        const options: Intl.DateTimeFormatOptions = {
            hour: '2-digit',
            minute: '2-digit',
        };
        const startTime = start.toLocaleTimeString([], options);
        const endTime = end.toLocaleTimeString([], options);
        return `${startTime} - ${endTime}`;
    };

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    };

    // Check if current timer is for the selected card
    const isCurrentCardActive = globalCurrentActiveTimeEntry?.cardId === selectedCard.id;
    const activeTimeEntryForThisCard = isCurrentCardActive ? globalCurrentActiveTimeEntry : null;

    return (
        <Card className="bg-card border shadow-md dark:shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock size={16} className="text-blue-500 dark:text-blue-400" />
                Time Tracker
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Track time spent on the selected card
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Timer 
                    activeTimeEntryForThisCard={activeTimeEntryForThisCard}
                    globalActiveTimeEntry={globalCurrentActiveTimeEntry}
                    selectedCard={selectedCard}
                />

                <div className="md:col-span-2">
                  <div className="text-xs font-medium mb-2 text-foreground">Currently tracking time for:</div>
                  <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-950 rounded-lg mb-3">
                    <FileText className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                    <div>
                      <div className="text-sm font-medium text-foreground">{selectedCard.title}</div>
                      
                    </div>
                  </div>

                  <div className="text-xs font-medium mb-2 text-foreground">Recent time entries:</div>
                  <div className="max-h-[300px] overflow-y-auto space-y-2">
                    {isPending ? (
                      <div className="text-xs text-muted-foreground text-center p-2">Loading...</div>
                    ) : isError ? (
                      <div className="text-xs text-red-500 text-center p-2">Failed to load time entries.</div>
                    ) : timeEntries.length > 0 ? (
                      timeEntries.map((entry: TimeEntry, index: number) => {
                        const startDate = new Date(entry.startTime);
                        const endDate = entry.endTime ? new Date(entry.endTime) : new Date();
                        
                        // Calculate duration for display - use totalDuration if available and > 0
                        let displayDuration = entry.totalDuration || 0;
                        
                        // If totalDuration is 0 but we have start/end times, calculate it as fallback
                        if (displayDuration === 0 && entry.endTime) {
                          const calculatedDuration = Math.floor((endDate.getTime() - startDate.getTime()) / 1000);
                          displayDuration = Math.max(0, calculatedDuration);
                        }
                        
                        // For active timers (no endTime), show ongoing duration
                        if (!entry.endTime && displayDuration === 0) {
                          const ongoingDuration = Math.floor((new Date().getTime() - startDate.getTime()) / 1000);
                          displayDuration = Math.max(0, ongoingDuration);
                        }
                        
                        return (
                          <div key={entry.id || index} className="space-y-2">
                            <div className="flex justify-between items-center p-2 bg-muted dark:bg-zinc-900 rounded-lg text-xs border border-zinc-200 dark:border-zinc-800">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <div className="flex flex-col">
                                    <span className="text-muted-foreground">
                                      {formatRelativeTime(startDate)}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {entry.endTime ? formatTimeRange(startDate, endDate) : `Started at ${startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                                    </span>
                                    {!entry.endTime && (
                                      <span className="text-xs text-green-600 font-medium">
                                        {entry.isPaused ? "Paused" : "Active"}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <Badge variant="outline" className="border-zinc-300 dark:border-zinc-700">
                                {formatTime(displayDuration)}
                              </Badge>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-xs text-muted-foreground text-center p-2">
                        No time entries yet. Start tracking to record time.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-xs text-muted-foreground">
                <Info className="h-3 w-3 inline mr-1" />
                Time tracked will be added to the card's total time spent
              </p>
            </CardFooter>
          </Card>
    );
};