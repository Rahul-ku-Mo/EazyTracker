type TCardData = {
  title: string;
  description?: string;
  columnId?: string;
  labels?: string[];
  attachments?: string[];
  dueDate?: Date;
  order?: number;
  priority?: string;
  assigneeId?: string;
};

type TCreateCardProps = {
  accessToken: string;
  cardData: TCardData;
  columnId: string;
};

type TCardContext = {
  id: string;
  title: string;
  description?: string;
  dueDate?: Date;
  priority?: string;
  order?: number;
  labels?: string[];
};
export type { TCardData, TCreateCardProps, TCardContext };
