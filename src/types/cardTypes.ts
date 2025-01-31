
type TCardData = {
  title: string;
  description?: string;
  columnId?: string;
  labels?: TLabel[];
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


type TLabel = {
  id: string;
  name: string;
  color: string;
};

type TCardContext = {
  id: string;
  title: string;
  description?: string;
  dueDate?: Date;
  priority?: string;
  order?: number;
  labels?: TLabel[];
};

export type { TCardData, TCreateCardProps, TCardContext, TLabel };
