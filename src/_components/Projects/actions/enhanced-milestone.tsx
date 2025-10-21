import { useState, useEffect } from "react";
import { Plus, Calendar, DollarSign, FileText, Target, CheckCircle, Edit3, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MilestoneItem, createMilestone, updateMilestone, deleteMilestone as deleteMilestoneAPI, reorderMilestones } from "@/apis/project";
import { validateMilestone, calculateMilestoneStats, formatMilestoneForDisplay } from "@/utils/milestoneUtils";

interface EnhancedMilestoneProps {
  externalMilestones?: MilestoneItem[];
  onMilestonesChange?: (milestones: MilestoneItem[]) => void;
  projectSlug?: string;
  fwdClassname?: string;
  readOnly?: boolean;
}

// Predefined milestone templates
const MILESTONE_TEMPLATES = [
  {
    title: "Project Setup",
    description: "Initial project setup and configuration",
    notes: "Budget: $5,000 - Setup development environment, configure CI/CD pipeline",
    targetDate: 7, // days from now
  },
  {
    title: "Core Development",
    description: "Develop the main features",
    notes: "Budget: $15,000 - Implement user authentication, main functionality",
    targetDate: 30,
  },
  {
    title: "Testing & QA",
    description: "Comprehensive testing and quality assurance",
    notes: "Budget: $8,000 - Unit tests, integration tests, user acceptance testing",
    targetDate: 45,
  },
  {
    title: "Deployment",
    description: "Production deployment and go-live",
    notes: "Budget: $3,000 - Deploy to production, handover documentation",
    targetDate: 60,
  },
];

// Sortable milestone item component
const SortableMilestoneItem = ({
  item,
  onUpdate,
  onDelete,
  readOnly = false,
}: {
  item: MilestoneItem;
  onUpdate: (id: string, updates: Partial<MilestoneItem>) => void;
  onDelete: (id: string) => void;
  readOnly?: boolean;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: item.title || "",
    description: item.description || "",
    notes: item.notes || "",
    targetDate: item.targetDate,
  });

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleSave = () => {
    const validationErrors = validateMilestone({
      title: editData.title,
      description: editData.description,
      notes: editData.notes,
      targetDate: editData.targetDate,
    });

    if (validationErrors.length > 0) {
      // You could show these errors in a toast or inline
      console.warn('Milestone validation errors:', validationErrors);
      // For now, we'll still save but log the warnings
    }

    onUpdate(item.id, {
      title: editData.title,
      description: editData.description,
      notes: editData.notes,
      targetDate: editData.targetDate,
      status: item.status,
    });
    setIsEditing(false);
  };

  const handleToggleComplete = async () => {
    if (readOnly) return;
    
    const newStatus = item.status === 'COMPLETE' ? 'INCOMPLETE' : 'COMPLETE';
    onUpdate(item.id, {
      status: newStatus,
     
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      handleSave();
    } else if (e.key === "Escape") {
      setEditData({
        title: item.title || "",
        description: item.description || "",
        notes: item.notes || "",
        targetDate: item.targetDate,
      });
      setIsEditing(false);
    }
  };

  const formattedItem = formatMilestoneForDisplay(item);
  const { isOverdue, isDueSoon } = formattedItem;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "group transition-all duration-200",
        item.status === 'COMPLETE' && "opacity-75 bg-green-50 dark:bg-green-950/20",
        isOverdue && "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20",
        isDueSoon && "border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/20"
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          {!readOnly && (
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity mt-1"
            >
              <GripVertical className="size-4 text-muted-foreground" />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={handleToggleComplete}
                className="flex-shrink-0 p-1 rounded-full hover:bg-accent transition-colors"
                disabled={readOnly}
              >
                {item.status === 'COMPLETE' ? (
                  <CheckCircle className="size-5 text-green-500" />
                ) : (
                  <Target className="size-5 text-muted-foreground hover:text-primary" />
                )}
              </button>
              
              {isEditing ? (
                <div className="flex-1 space-y-2">
                  <Input
                    value={editData.title}
                    onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                    onKeyDown={handleKeyDown}
                    className="font-semibold"
                    placeholder="Milestone title"
                    autoFocus
                  />
                  <Textarea
                    value={editData.description}
                    onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                    onKeyDown={handleKeyDown}
                    placeholder="Description (optional)"
                    rows={2}
                    className="text-sm"
                  />
                </div>
              ) : (
                <div className="flex-1">
                  <div 
                    className="flex items-center gap-2 cursor-pointer hover:bg-accent/50 p-1 rounded transition-colors"
                    onClick={() => !readOnly && setIsEditing(true)}
                  >
                    <h4 className={cn(
                      "font-semibold text-sm",
                      item.status === 'COMPLETE' && "line-through text-muted-foreground"
                    )}>
                      {item.title || "Untitled Milestone"}
                    </h4>
                    {!readOnly && <Edit3 className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />}
                  </div>
                  
                  {item.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap pl-9">
              {item.targetDate && (
                <Badge 
                  variant={isOverdue ? "destructive" : isDueSoon ? "secondary" : "outline"}
                  className="text-xs"
                >
                  <Calendar className="size-3 mr-1" />
                  {format(new Date(item.targetDate), "MMM dd, yyyy")}
                </Badge>
              )}
              
              {item.notes && item.notes.includes("Budget:") && (
                <Badge variant="outline" className="text-xs">
                  <DollarSign className="size-3 mr-1" />
                  Budget
                </Badge>
              )}
              
              {item.notes && !item.notes.includes("Budget:") && (
                <Badge variant="outline" className="text-xs">
                  <FileText className="size-3 mr-1" />
                  Notes
                </Badge>
              )}
            </div>

            {isEditing && (
              <div className="mt-3 space-y-3">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Target Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal text-xs h-8",
                          !editData.targetDate && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="mr-2 h-3 w-3" />
                        {editData.targetDate ? format(editData.targetDate, "PPP") : "Set target date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={editData.targetDate}
                        onSelect={(date) => setEditData(prev => ({ ...prev, targetDate: date }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Notes (Budget, Tasks, etc.)</label>
                  <Textarea
                    value={editData.notes}
                    onChange={(e) => setEditData(prev => ({ ...prev, notes: e.target.value }))}
                    onKeyDown={handleKeyDown}
                    placeholder="e.g., Budget: $5,000 - Setup development environment"
                    rows={3}
                    className="text-xs"
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="button" size="sm" onClick={handleSave} className="text-xs">
                    Save
                  </Button>
                  <Button 
                    type="button"
                    size="sm" 
                    variant="outline" 
                    onClick={() => {
                      setEditData({
                        title: item.title || "",
                        description: item.description || "",
                        notes: item.notes || "",
                        targetDate: item.targetDate,
                      });
                      setIsEditing(false);
                    }}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {!isEditing && item.notes && (
              <div className="mt-2 p-2 bg-accent/50 rounded text-xs text-muted-foreground">
                {item.notes}
              </div>
            )}
          </div>

          {!readOnly && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onDelete(item.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
            >
              <Trash2 className="size-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const EnhancedMilestone = ({
  externalMilestones,
  onMilestonesChange,
  projectSlug,
  readOnly = false,
  fwdClassname
}: EnhancedMilestoneProps) => {
  const [milestones, setMilestones] = useState<MilestoneItem[]>(
    externalMilestones || []
  );

  useEffect(() => {
    if (externalMilestones) {
      setMilestones(externalMilestones);
    }
  }, [externalMilestones]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    if (readOnly) return;

    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = milestones.findIndex((item) => item.id === active.id);
      const newIndex = milestones.findIndex((item) => item.id === over?.id);
      const newMilestones = arrayMove(milestones, oldIndex, newIndex);
      
      // Update order property
      const updatedMilestones = newMilestones.map((milestone, index) => ({
        ...milestone,
        order: index + 1,
      }));
      
      setMilestones(updatedMilestones);
      onMilestonesChange?.(updatedMilestones);

      // Only update backend if projectSlug is provided (existing project)
      if (projectSlug) {
        try {
          const milestoneIds = updatedMilestones.map(m => m.id);
          await reorderMilestones(projectSlug, milestoneIds);
        } catch (error) {
          console.error('Failed to reorder milestones:', error);
          // Revert on error
          setMilestones(milestones);
          onMilestonesChange?.(milestones);
        }
      }
      // If no projectSlug, reordering stays local only
    }
  };

  const addMilestone = async (template?: typeof MILESTONE_TEMPLATES[0]) => {
    if (readOnly) return;

    const targetDate = template?.targetDate 
      ? new Date(Date.now() + template.targetDate * 24 * 60 * 60 * 1000)
      : undefined;

    const newMilestoneData: Partial<MilestoneItem> = {
      title: template?.title || `New milestone ${milestones.length + 1}`,
      description: template?.description || "",
      notes: template?.notes || "",
      status: 'INCOMPLETE',
      targetDate,
      order: milestones.length + 1,
    };

    // Create milestone with temporary ID for local mode
    const tempMilestone: MilestoneItem = {
      id: `temp-milestone-${Date.now()}`,
      ...newMilestoneData,
    } as MilestoneItem;

    const updatedMilestones = [...milestones, tempMilestone];
    setMilestones(updatedMilestones);
    onMilestonesChange?.(updatedMilestones);

    // Only create in backend if projectSlug is provided (existing project)
    if (projectSlug) {
      try {
        const createdMilestone = await createMilestone(projectSlug, newMilestoneData);
        // Replace temp milestone with real one
        const finalMilestones = updatedMilestones.map(m => 
          m.id === tempMilestone.id ? createdMilestone : m
        );
        setMilestones(finalMilestones);
        onMilestonesChange?.(finalMilestones);
      } catch (error) {
        console.error('Failed to create milestone:', error);
        // Revert on error
        setMilestones(milestones);
        onMilestonesChange?.(milestones);
      }
    }
    // If no projectSlug, milestone stays as temp milestone (local mode)
  };

  const updateMilestoneLocal = async (id: string, updates: Partial<MilestoneItem>) => {
    if (readOnly) return;

    // Update locally
    const updatedMilestones = milestones.map((milestone) =>
      milestone.id === id ? { ...milestone, ...updates } : milestone
    );
    
    setMilestones(updatedMilestones);
    onMilestonesChange?.(updatedMilestones);

    // Only update backend if projectSlug is provided (existing project)
    if (projectSlug) {
      try {
        await updateMilestone(projectSlug, id, updates);
      } catch (error) {
        console.error('Failed to update milestone:', error);
        // Revert on error
        setMilestones(milestones);
        onMilestonesChange?.(milestones);
      }
    }
    // If no projectSlug, update stays local only
  };

  const deleteMilestoneLocal = async (id: string) => {
    if (readOnly) return;

    // Delete locally
    const updatedMilestones = milestones.filter((milestone) => milestone.id !== id);
    setMilestones(updatedMilestones);
    onMilestonesChange?.(updatedMilestones);

    // Only delete from backend if projectSlug is provided (existing project)
    if (projectSlug) {
      try {
        await deleteMilestoneAPI(projectSlug, id);
      } catch (error) {
        console.error('Failed to delete milestone:', error);
        // Revert on error
        setMilestones(milestones);
        onMilestonesChange?.(milestones);
      }
    }
    // If no projectSlug, deletion stays local only
  };

  const stats = calculateMilestoneStats(milestones);

  return (
    <div className={cn("space-y-3", fwdClassname)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="size-4 text-primary" />
          <h3 className="font-semibold text-sm">Milestones</h3>
          {stats.total > 0 && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="outline" className="text-xs">
                {stats.completed}/{stats.total} Complete
              </Badge>
              {stats.overdue > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {stats.overdue} Overdue
                </Badge>
              )}
              {stats.dueSoon > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {stats.dueSoon} Due Soon
                </Badge>
              )}
            </div>
          )}
        </div>
        
        {!readOnly && (
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button type="button" variant="outline" size="sm" className="text-xs">
                  <Plus className="size-3" />
                  Templates
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-2">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Quick Add Templates</h4>
                  {MILESTONE_TEMPLATES.map((template, index) => (
                    <Button
                      key={index}
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-left h-auto p-3"
                      onClick={() => addMilestone(template)}
                    >
                      <div className="flex flex-col items-start">
                        <span className="font-medium text-sm">{template.title}</span>
                        <span className="text-xs text-muted-foreground">{template.description}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            
            <Button type="button" size="sm" onClick={() => addMilestone()} className="text-xs">
              Add Milestone
            </Button>
          </div>
        )}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={milestones}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2 max-h-[230px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800">
            {milestones.map((milestone) => (
              <SortableMilestoneItem
                key={milestone.id}
                item={milestone}
                onUpdate={updateMilestoneLocal}
                onDelete={deleteMilestoneLocal}
                readOnly={readOnly}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {milestones.length === 0 && (
        <Card className="border-dashed max-h-[400px]">
          <CardContent className="p-8 text-center">
            <Target className="size-8 text-muted-foreground mx-auto mb-2" />
            <h4 className="font-medium text-sm mb-1">No milestones yet</h4>
            <p className="text-xs text-muted-foreground mb-4">
              Break down your project into manageable milestones with deadlines and budgets.
            </p>
            {!readOnly && (
              <div className="flex gap-2 justify-center">
                <Button type="button" size="sm" variant="outline" onClick={() => addMilestone()}>
                  Add First Milestone
                </Button>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button type="button" size="sm">
                      Use Template
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-2">
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Quick Start Templates</h4>
                      {MILESTONE_TEMPLATES.map((template, index) => (
                        <Button
                          key={index}
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-left h-auto p-3"
                          onClick={() => addMilestone(template)}
                        >
                          <div className="flex flex-col items-start">
                            <span className="font-medium text-sm">{template.title}</span>
                            <span className="text-xs text-muted-foreground">{template.description}</span>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedMilestone;
