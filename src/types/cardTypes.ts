import { Label } from "../apis/LabelApis";

type TCardData = {
  title: string;
  description?: string;
  columnId?: string;
  labelIds?: string[];
  attachments?: string[];
  dueDate?: Date;
  order?: number;
  priority?: string;
  assigneeId?: string;
  storyPoints?: number;
  assignees?: Array<{
    id: string;
    name: string;
    email: string;
    username?: string;
    imageUrl?: string;
  }>;
};

type TCreateCardProps = {
  accessToken: string;
  cardData: TCardData;
  columnId: string;
};

type TCardContext = {
  id: number;
  title: string;
  description?: string;
  dueDate?: Date;
  priority?: string;
  order?: number;
  labels?: Label[];
  assigneeId?: string;
  storyPoints?: number;
  slug: string;
  assignees?: Array<{
    id: string;
    name: string;
    email: string;
    username?: string;
    imageUrl?: string;
  }>;
  completedAt?: Date | null;
  isOnTime?: boolean | null;
  status?: {
    isCompleted: boolean;
    isOverdue: boolean;
    isOnTime: boolean | null;
    daysOverdue: number;
  };
};

export type { TCardData, TCreateCardProps, TCardContext };
