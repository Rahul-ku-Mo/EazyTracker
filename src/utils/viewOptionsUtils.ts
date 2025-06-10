import { ViewOptions } from '@/store/useViewOptionsStore';

export interface CardItem {
  id: number;
  title: string;
  order: number;
  description: string;
  columnId: number;
  labels: string[];
  attachments: any[];
  priority: 'low' | 'medium' | 'high' | 'urgent' | null;
  createdAt: string;
  dueDate: string | null;
  updatedAt: string;
  creatorId: number | null;
  assigneeId?: string | null;
}

export interface Column {
  id: number;
  title: string;
  order: number;
  cards: CardItem[];
}

// Filter cards based on view options
export const filterCards = (cards: CardItem[], viewOptions: ViewOptions): CardItem[] => {
  let filteredCards = [...cards];

  // Filter by priority
  if (viewOptions.activeFilters.priority.length > 0) {
    filteredCards = filteredCards.filter(card => 
      card.priority && viewOptions.activeFilters.priority.includes(card.priority)
    );
  }

  // Filter by assignee
  if (viewOptions.activeFilters.assignee.length > 0) {
    filteredCards = filteredCards.filter(card => 
      card.assigneeId && viewOptions.activeFilters.assignee.includes(card.assigneeId)
    );
  }

  // Filter by due date
  if (viewOptions.activeFilters.dueDate !== 'none') {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const monthFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    filteredCards = filteredCards.filter(card => {
      if (!card.dueDate) return false;
      const cardDueDate = new Date(card.dueDate);

      switch (viewOptions.activeFilters.dueDate) {
        case 'overdue':
          return cardDueDate < today;
        case 'today':
          return cardDueDate >= today && cardDueDate < tomorrow;
        case 'thisWeek':
          return cardDueDate >= today && cardDueDate <= weekFromNow;
        case 'thisMonth':
          return cardDueDate >= today && cardDueDate <= monthFromNow;
        default:
          return true;
      }
    });
  }

  return filteredCards;
};

// Order cards based on view options
export const orderCards = (cards: CardItem[], viewOptions: ViewOptions): CardItem[] => {
  const sortedCards = [...cards];

  const getSortValue = (card: CardItem): any => {
    switch (viewOptions.orderBy) {
      case 'title':
        return card.title.toLowerCase();
      case 'created':
        return new Date(card.createdAt).getTime();
      case 'updated':
        return new Date(card.updatedAt).getTime();
      case 'priority': {
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[card.priority as keyof typeof priorityOrder] || 0;
      }
      case 'dueDate':
        return card.dueDate ? new Date(card.dueDate).getTime() : Infinity;
      case 'manual':
      default:
        return card.order;
    }
  };

  sortedCards.sort((a, b) => {
    const aValue = getSortValue(a);
    const bValue = getSortValue(b);

    if (aValue === bValue) return 0;
    
    const comparison = aValue < bValue ? -1 : 1;
    return viewOptions.orderDirection === 'desc' ? -comparison : comparison;
  });

  return sortedCards;
};

// Group cards based on view options
export const groupCards = (cards: CardItem[], columns: Column[], viewOptions: ViewOptions) => {
  const processedCards = orderCards(filterCards(cards, viewOptions), viewOptions);

  switch (viewOptions.groupBy) {
    case 'priority':
      return groupByPriority(processedCards, viewOptions);
    case 'assignee':
      return groupByAssignee(processedCards, viewOptions);
    case 'dueDate':
      return groupByDueDate(processedCards, viewOptions);
    case 'none':
      return { 'All Cards': { id: 0, cards: processedCards } };
    case 'column':
    default:
      return groupByColumn(processedCards, columns, viewOptions);
  }
};

const groupByColumn = (cards: CardItem[], columns: Column[], viewOptions: ViewOptions) => {
  const grouped: { [key: string]: { id: number; cards: CardItem[] } } = {};

  // Initialize all columns
  columns.forEach(column => {
    grouped[column.title] = { id: column.id, cards: [] };
  });

  // Group cards by column
  cards.forEach(card => {
    const column = columns.find(col => col.id === card.columnId);
    if (column) {
      grouped[column.title].cards.push(card);
    }
  });

  // Remove empty groups if option is disabled
  if (!viewOptions.showEmptyGroups) {
    Object.keys(grouped).forEach(key => {
      if (grouped[key].cards.length === 0) {
        delete grouped[key];
      }
    });
  }

  return grouped;
};

const groupByPriority = (cards: CardItem[], viewOptions: ViewOptions) => {
  const priorities = ['urgent', 'high', 'medium', 'low', 'none'];
  const grouped: { [key: string]: { id: number; cards: CardItem[] } } = {};

  priorities.forEach((priority, index) => {
    const priorityCards = cards.filter(card => 
      priority === 'none' ? !card.priority : card.priority === priority
    );
    
    if (priorityCards.length > 0 || viewOptions.showEmptyGroups) {
      const displayName = priority === 'none' ? 'No Priority' : priority.charAt(0).toUpperCase() + priority.slice(1);
      grouped[displayName] = { id: index, cards: priorityCards };
    }
  });

  return grouped;
};

const groupByAssignee = (cards: CardItem[], viewOptions: ViewOptions) => {
  const grouped: { [key: string]: { id: number; cards: CardItem[] } } = {};
  let groupId = 0;

  // Get unique assignees
  const assignees = Array.from(new Set(cards.map(card => card.assigneeId).filter(Boolean)));
  
  assignees.forEach(assigneeId => {
    const assigneeCards = cards.filter(card => card.assigneeId === assigneeId);
    if (assigneeCards.length > 0 || viewOptions.showEmptyGroups) {
      grouped[`Assignee ${assigneeId}`] = { id: groupId++, cards: assigneeCards };
    }
  });

  // Add unassigned cards
  const unassignedCards = cards.filter(card => !card.assigneeId);
  if (unassignedCards.length > 0 || viewOptions.showEmptyGroups) {
    grouped['Unassigned'] = { id: groupId++, cards: unassignedCards };
  }

  return grouped;
};

const groupByDueDate = (cards: CardItem[], viewOptions: ViewOptions) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  const groups = [
    { name: 'Overdue', cards: [] as CardItem[] },
    { name: 'Due Today', cards: [] as CardItem[] },
    { name: 'Due This Week', cards: [] as CardItem[] },
    { name: 'Due Later', cards: [] as CardItem[] },
    { name: 'No Due Date', cards: [] as CardItem[] },
  ];

  cards.forEach(card => {
    if (!card.dueDate) {
      groups[4].cards.push(card);
      return;
    }

    const cardDueDate = new Date(card.dueDate);
    if (cardDueDate < today) {
      groups[0].cards.push(card);
    } else if (cardDueDate >= today && cardDueDate < tomorrow) {
      groups[1].cards.push(card);
    } else if (cardDueDate >= tomorrow && cardDueDate <= weekFromNow) {
      groups[2].cards.push(card);
    } else {
      groups[3].cards.push(card);
    }
  });

  const grouped: { [key: string]: { id: number; cards: CardItem[] } } = {};
  groups.forEach((group, index) => {
    if (group.cards.length > 0 || viewOptions.showEmptyGroups) {
      grouped[group.name] = { id: index, cards: group.cards };
    }
  });

  return grouped;
};

 