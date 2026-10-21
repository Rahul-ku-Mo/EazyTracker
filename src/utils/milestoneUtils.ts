import { MilestoneItem } from "@/apis/project";

/**
 * Validates milestone data
 */
export const validateMilestone = (milestone: Partial<MilestoneItem>): string[] => {
  const errors: string[] = [];

  if (!milestone.title?.trim()) {
    errors.push("Milestone title is required");
  }

  if (milestone.title && milestone.title.length > 100) {
    errors.push("Milestone title must be less than 100 characters");
  }

  if (milestone.description && milestone.description.length > 500) {
    errors.push("Milestone description must be less than 500 characters");
  }

  if (milestone.notes && milestone.notes.length > 1000) {
    errors.push("Milestone notes must be less than 1000 characters");
  }

  if (milestone.targetDate && milestone.targetDate < new Date()) {
    errors.push("Target date cannot be in the past");
  }

  return errors;
};

/**
 * Formats milestone for display
 */
export const formatMilestoneForDisplay = (milestone: MilestoneItem) => {
  const isOverdue = milestone.targetDate && 
    milestone.status === 'INCOMPLETE' && 
    new Date(milestone.targetDate) < new Date();
  
  const isDueSoon = milestone.targetDate && 
    milestone.status === 'INCOMPLETE' && 
    new Date(milestone.targetDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) &&
    new Date(milestone.targetDate) > new Date();

  return {
    ...milestone,
    isOverdue,
    isDueSoon,
    displayTitle: milestone.title || "Untitled Milestone",
  };
};

/**
 * Extracts budget information from milestone notes
 */
export const extractBudgetFromNotes = (notes: string): { amount: number; currency: string } | null => {
  const budgetMatch = notes.match(/Budget:\s*([$€£¥₹]?)\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/i);
  
  if (budgetMatch) {
    const currency = budgetMatch[1] || '$';
    const amount = parseFloat(budgetMatch[2].replace(/,/g, ''));
    return { amount, currency };
  }
  
  return null;
};

/**
 * Calculates project milestone statistics
 */
export const calculateMilestoneStats = (milestones: MilestoneItem[]) => {
  const total = milestones.length;
  const completed = milestones.filter(m => m.status === 'COMPLETE').length;
  const overdue = milestones.filter(m => 
    m.targetDate && m.status === 'INCOMPLETE' && new Date(m.targetDate) < new Date()
  ).length;
  const dueSoon = milestones.filter(m => 
    m.targetDate && m.status === 'INCOMPLETE' && 
    new Date(m.targetDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) &&
    new Date(m.targetDate) > new Date()
  ).length;

  const totalBudget = milestones.reduce((sum, milestone) => {
    if (milestone.notes) {
      const budget = extractBudgetFromNotes(milestone.notes);
      return sum + (budget?.amount || 0);
    }
    return sum;
  }, 0);

  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    total,
    completed,
    overdue,
    dueSoon,
    totalBudget,
    completionRate,
    remaining: total - completed,
  };
};

/**
 * Sorts milestones by priority (overdue, due soon, then by date)
 */
export const sortMilestonesByPriority = (milestones: MilestoneItem[]): MilestoneItem[] => {
  return [...milestones].sort((a, b) => {
    const aFormatted = formatMilestoneForDisplay(a);
    const bFormatted = formatMilestoneForDisplay(b);

    // Overdue items first
    if (aFormatted.isOverdue && !bFormatted.isOverdue) return -1;
    if (!aFormatted.isOverdue && bFormatted.isOverdue) return 1;

    // Due soon items next
    if (aFormatted.isDueSoon && !bFormatted.isDueSoon && !bFormatted.isOverdue) return -1;
    if (!aFormatted.isDueSoon && bFormatted.isDueSoon && !aFormatted.isOverdue) return 1;

    // Then by completion status (incomplete first)
    if (a.status !== b.status) {
      return a.status === 'INCOMPLETE' ? -1 : 1;
    }

    // Finally by target date
    if (a.targetDate && b.targetDate) {
      return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
    }

    // Items without dates go to the end
    if (a.targetDate && !b.targetDate) return -1;
    if (!a.targetDate && b.targetDate) return 1;

    // Finally by order
    return (a.order || 0) - (b.order || 0);
  });
};
