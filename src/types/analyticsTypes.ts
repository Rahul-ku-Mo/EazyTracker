export interface TimeSegment {
    id: string;
    startTime: string;
    endTime: string | null;
    duration: number;
}

export interface TimeEntry {
    id: string;
    userId: string;
    cardId: string;
    startTime: string;
    endTime: string | null;
    totalDuration: number;
    isPaused: boolean;
    segments: TimeSegment[];
    card?: {
        title: string;
        description: string;
    };
} 