import { Button } from "@/components/ui/button";
import { Play, Pause, StopCircle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TCardContext } from "@/types/cardTypes";
import { TimeEntry, timeEntryService } from "@/services/analytics.service";
import { useToast } from "@/hooks/use-toast";

interface TimerProps {
    selectedCard: TCardContext;
    activeTimeEntryForThisCard: TimeEntry | null;
    globalActiveTimeEntry: TimeEntry | null;
}

export const Timer = ({ 
    selectedCard,
    activeTimeEntryForThisCard,
    globalActiveTimeEntry,
}: TimerProps) => {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const handleStartTimer = () => {
        if (globalActiveTimeEntry && !globalActiveTimeEntry.endTime && globalActiveTimeEntry.cardId !== selectedCard.id) {
            toast({
                title: "Another timer is already active on a different card. Please stop it first.",
                variant: "destructive",
            });
            return;
        }
        startTimer();
    };

    const { mutate: startTimer, isPending: isStarting } = useMutation({
        mutationFn: async () => {
            return timeEntryService.startTimeEntry(selectedCard.id);
        },
        onSuccess: () => {
            toast({
                title: "Timer started successfully",
                variant: "default",
            });
            queryClient.invalidateQueries({ queryKey: ["currentActiveTimeEntry"] });
            queryClient.invalidateQueries({ queryKey: ["timeEntries", selectedCard.id] });
        },
        onError: (error) => {
            console.error(error);
            toast({
                title: "Failed to start timer",
                variant: "destructive",
            });
        }
    });

    const { mutate: resumeTimer, isPending: isResuming } = useMutation({
        mutationFn: async () => {
            if (!activeTimeEntryForThisCard?.id) return null;
            return timeEntryService.resumeTimeEntry(activeTimeEntryForThisCard.id);
        },
        onSuccess: () => {
            toast({
                title: "Timer resumed",
                variant: "default",
            });
            queryClient.invalidateQueries({ queryKey: ["currentActiveTimeEntry"] });
            queryClient.invalidateQueries({ queryKey: ["timeEntries", selectedCard.id] });
        },
        onError: (error) => {
            console.error(error);
            toast({
                title: "Failed to resume timer",
                variant: "destructive",
            });
        }
    });

    const { mutate: pauseTimer, isPending: isPausing } = useMutation({
        mutationFn: async () => {
            if (!activeTimeEntryForThisCard?.id) return null;
            return timeEntryService.pauseTimeEntry(activeTimeEntryForThisCard.id);
        },
        onSuccess: () => {
            toast({
                title: "Timer paused",
                variant: "default",
            });
            queryClient.invalidateQueries({ queryKey: ["currentActiveTimeEntry"] });
            queryClient.invalidateQueries({ queryKey: ["timeEntries", selectedCard.id] });
        },
        onError: (error) => {
            console.error(error);
            toast({
                title: "Failed to pause timer",
                variant: "destructive",
            });
        }
    });

    const { mutate: stopTimer, isPending: isStopping } = useMutation({
        mutationFn: async () => {
            if (!activeTimeEntryForThisCard?.id) return null;
            return timeEntryService.stopTimeEntry(activeTimeEntryForThisCard.id);
        },
        onSuccess: () => {
            toast({
                title: "Timer stopped",
                variant: "default",
            });
            queryClient.invalidateQueries({ queryKey: ["currentActiveTimeEntry"] });
            queryClient.invalidateQueries({ queryKey: ["timeEntries", selectedCard.id] });
        },
        onError: (error: any) => {
            console.error(error);
            
            // Check if it's a minimum duration error from backend
            if (error.response?.status === 400 && error.response?.data?.message?.includes('Minimum tracking time')) {
                toast({
                    title: "Minimum Duration Required",
                    description: error.response.data.message,
                    variant: "destructive",
                });
            } else {
            toast({
                title: "Failed to stop timer",
                variant: "destructive",
            });
        }
        }
    });

    const calculateCurrentTime = (): number => {
        if (!activeTimeEntryForThisCard) return 0;
        
        if (activeTimeEntryForThisCard.isPaused || activeTimeEntryForThisCard.endTime) {
            return activeTimeEntryForThisCard.totalDuration;
        }
        
        const now = Date.now();
        const lastResumeTime = activeTimeEntryForThisCard.lastResumeTime || activeTimeEntryForThisCard.startTime;
        const currentSessionStart = new Date(lastResumeTime).getTime();
        
        const elapsedSeconds = Math.floor((now - currentSessionStart) / 1000);
        return activeTimeEntryForThisCard.totalDuration + Math.max(0, elapsedSeconds);
    };
 
    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    };

    const isTimerRunning = activeTimeEntryForThisCard && 
                          !activeTimeEntryForThisCard.isPaused && 
                          !activeTimeEntryForThisCard.endTime;

    const getTimerStatus = () => {
        if (!activeTimeEntryForThisCard) return "Ready to start";
        if (activeTimeEntryForThisCard.endTime) return "Timer stopped";
        if (activeTimeEntryForThisCard.isPaused) return "Timer paused";
        
        // If running but hasn't reached minimum duration, show remaining time
        if (isTimerRunning && !hasMinimumDuration()) {
            const remainingSeconds = getRemainingTimeForMinimum();
            const remainingMinutes = Math.ceil(remainingSeconds / 60);
            return `${remainingMinutes} min required to stop`;
        }
        
        return "Currently tracking";
    };

    // Check if timer has run for at least 2 minutes (120 seconds)
    const hasMinimumDuration = () => {
        const currentTime = calculateCurrentTime();
        return currentTime >= 120; // 2 minutes = 120 seconds
    };

    // Get remaining time to reach minimum duration
    const getRemainingTimeForMinimum = () => {
        const currentTime = calculateCurrentTime();
        const remaining = 120 - currentTime; // 120 seconds = 2 minutes
        return Math.max(0, remaining);
    };

    const handleStopTimer = () => {
        if (!hasMinimumDuration()) {
            const remainingSeconds = getRemainingTimeForMinimum();
            const remainingMinutes = Math.ceil(remainingSeconds / 60);
            toast({
                title: `Minimum 2 minutes required`,
                description: `Please track for at least ${remainingMinutes} more minute${remainingMinutes > 1 ? 's' : ''} before stopping.`,
                variant: "destructive",
            });
            return;
        }
        stopTimer();
    };

    return (
        <div className="flex flex-col items-center justify-center bg-muted dark:bg-zinc-900 rounded-lg p-4 border border-zinc-200 dark:border-zinc-800">
            <div className="text-3xl font-mono font-bold mb-2 text-foreground">
                {formatTime(calculateCurrentTime())}
            </div>
            <div className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
                {isTimerRunning && (
                    <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                )}
                {getTimerStatus()}
            </div>
            <div className="flex gap-2">
                {(!activeTimeEntryForThisCard || activeTimeEntryForThisCard.endTime) && (
                    <Button 
                        size="sm" 
                        onClick={handleStartTimer}
                        disabled={isStarting}
                        className="bg-green-600 hover:bg-green-700 text-white"
                    >
                        <Play className="h-3 w-3 mr-1" />
                        {isStarting ? "Starting..." : "Start"}
                    </Button>
                )}
                
                {activeTimeEntryForThisCard && activeTimeEntryForThisCard.isPaused && (
                    <Button 
                        size="sm" 
                        onClick={() => resumeTimer()}
                        disabled={isResuming}
                        className="bg-green-600 hover:bg-green-700 text-white"
                    >
                        <Play className="h-3 w-3 mr-1" />
                        {isResuming ? "Resuming..." : "Resume"}
                    </Button>
                )}
                
                {isTimerRunning && (
                    <Button 
                        size="sm" 
                        onClick={() => pauseTimer()}
                        disabled={isPausing}
                        variant="outline" 
                        className="border-zinc-300 dark:border-zinc-700"
                    >
                        <Pause className="h-3 w-3 mr-1" />
                        {isPausing ? "Pausing..." : "Pause"}
                    </Button>
                )}
                
                {activeTimeEntryForThisCard && !activeTimeEntryForThisCard.endTime && (
                    <Button 
                        size="sm" 
                        onClick={handleStopTimer}
                        disabled={isStopping || !hasMinimumDuration()}
                        className={
                            hasMinimumDuration() 
                                ? "bg-red-600 hover:bg-red-700 text-white"
                                : "bg-gray-400 text-gray-600 cursor-not-allowed"
                        }
                        title={
                            !hasMinimumDuration() 
                                ? `${Math.ceil(getRemainingTimeForMinimum() / 60)} more minute(s) required`
                                : "Stop timer"
                        }
                    >
                        <StopCircle className="h-3 w-3 mr-1" />
                        {isStopping ? "Stopping..." : "Stop"}
                    </Button>
                )}
            </div>
        </div>
    );
}; 