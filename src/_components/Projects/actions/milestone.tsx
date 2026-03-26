import { useState } from "react";
import { Plus, GripVertical } from "lucide-react";
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
import {
  TargetIcon,
  MilestoneIcon,
  TargetCompleteIcon,
} from "@/_components/shared/svg/SharedIcons";
import { updateMilestoneCompletion } from "@/apis/project";
import { cn } from "@/lib/utils";
import { MilestoneItem } from "@/apis/project";


// Props for external state management
interface MilestoneProps {
  externalMilestones?: MilestoneItem[];
  onMilestonesChange?: (milestones: MilestoneItem[]) => void;
  projectSlug?: string;
  fwdClassname?: string;
  readOnly?: boolean;
}

// Sortable milestone item component
const SortableMilestoneItem = ({
  item,
  onDelete,
  onEdit,
  onToggleComplete,
  readOnly = false,
}: {
  item: MilestoneItem;
  onDelete: (id: string) => void;
  onEdit?: (id: string, newName: string) => void;
  onToggleComplete?: (id: string, isCompleted: boolean) => void;
  readOnly?: boolean;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(item.title);

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

  const handleEdit = () => {
    if (onEdit && editValue.trim() !== item.title) {
      onEdit(item.id, editValue.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleEdit();
    } else if (e.key === "Escape") {
      setEditValue(item.title);
      setIsEditing(false);
    }
  };

  const handleToggleComplete = () => {
    if (onToggleComplete && !readOnly) {
      onToggleComplete(item.id, item.status === 'COMPLETE');
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group p-2 border flex justify-between items-center hover:bg-accent/10 transition-colors"
    >
      <div className="flex items-center gap-2 flex-1">
        {!readOnly && (
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <GripVertical className="size-3 text-muted-foreground" />
          </div>
        )}
        <div 
          className="cursor-pointer" 
          onClick={handleToggleComplete}
        >
          {item.status === 'COMPLETE' ? (
            <TargetCompleteIcon className="size-2.5 text-emerald-500" />
          ) : (
            <TargetIcon className="size-2.5" />
          )}
        </div>
        {isEditing ? (
          <input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleEdit}
            onKeyDown={handleKeyDown}
            className="text-xs font-semibold bg-transparent border-none outline-none focus:bg-accent/20 px-1 py-0.5 rounded"
            autoFocus
          />
        ) : (
          <span
            className={`text-xs font-semibold cursor-pointer hover:bg-accent/20 px-1 py-0.5 rounded ${item.status === 'COMPLETE' ? 'line-through text-muted-foreground !text-emerald-500' : ''}`}
            onClick={() => !readOnly && onEdit && setIsEditing(true)}
          >
            {item.title}
          </span>
        )}
      </div>
      {!readOnly && (
        <div>
          <Plus
            className="size-4 opacity-0 group-hover:opacity-75 cursor-pointer rotate-45 hover:text-destructive transition-all"
            strokeWidth={2}
            onClick={() => onDelete(item.id)}
          />
        </div>
      )}
    </div>
  );
};

const Milestone = ({
  externalMilestones,
  onMilestonesChange,
  projectSlug,
  readOnly = false,
  fwdClassname
}: MilestoneProps) => {
  // Internal state for standalone mode
  const [internalMilestones, setInternalMilestones] = useState<MilestoneItem[]>(
    [
      { id: "1", title: "Initial milestone", status: 'INCOMPLETE' },
      { id: "2", title: "Development phase", status: 'INCOMPLETE' },
      { id: "3", title: "Testing phase", status: 'INCOMPLETE' },
    ]
  );

  // Use external or internal state
  const milestones = externalMilestones || internalMilestones;

  const setMilestones = (newMilestones: MilestoneItem[]) => {
    if (onMilestonesChange) {
      onMilestonesChange(newMilestones);
    } else {
      setInternalMilestones(newMilestones);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    if (readOnly) return;

    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = milestones.findIndex((item) => item.id === active.id);
      const newIndex = milestones.findIndex((item) => item.id === over?.id);
      const newMilestones = arrayMove(milestones, oldIndex, newIndex);
      setMilestones(newMilestones);
    }
  };

  const addMilestone = () => {
    if (readOnly) return;

    const newMilestone: MilestoneItem = {
      id: `milestone-${Date.now()}`,
      title: `New milestone ${milestones.length + 1}`,
      status: 'INCOMPLETE',
    };
    setMilestones([...milestones, newMilestone]);
  };

  const deleteMilestone = (id: string) => {
    if (readOnly) return;

    setMilestones(milestones.filter((milestone) => milestone.id !== id));
  };

  const editMilestone = (id: string, newName: string) => {
    if (readOnly) return;

    setMilestones(
      milestones.map((milestone) =>
        milestone.id === id ? { ...milestone, title: newName } : milestone
      )
    );
  };

  const toggleMilestoneComplete = async (id: string, isCompleted: boolean) => {
    if (readOnly) return;

    // Update local state immediately for optimistic UI
    setMilestones(
      milestones.map((milestone) =>
        milestone.id === id ? { ...milestone, status: isCompleted ? 'COMPLETE' : 'INCOMPLETE' } : milestone
      )
    );

    // If projectSlug is provided, update the backend
    if (projectSlug) {
      try {
        await updateMilestoneCompletion(projectSlug, id, isCompleted);
      } catch (error) {
        console.error('Failed to update milestone completion:', error);
        // Revert the optimistic update on error
        setMilestones(
          milestones.map((milestone) =>
            milestone.id === id ? { ...milestone, status: isCompleted ? 'COMPLETE' : 'INCOMPLETE' } : milestone
          )
        );
      }
    }
  };

  return (
    <div className={cn("border border-border rounded-t-md flex flex-col", fwdClassname)}>
      <div className="bg-accent p-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MilestoneIcon className="size-3" strokeWidth={3} />
            <span className="text-sm font-semibold">Milestones</span>
          </div>
          {!readOnly && (
            <div>
              <Plus
                className="size-4 hover:opacity-75 cursor-pointer"
                strokeWidth={2}
                onClick={addMilestone}
              />
            </div>
          )}
        </div>
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
          {milestones.map((milestone) => (
            <SortableMilestoneItem
              key={milestone.id}
              item={milestone}
              onDelete={deleteMilestone}
              onEdit={editMilestone}
              onToggleComplete={toggleMilestoneComplete}
              readOnly={readOnly}
            />
          ))}
        </SortableContext>
      </DndContext>

      {milestones.length === 0 && (
        <div className="p-4 text-center text-muted-foreground text-xs">
          No milestones yet. Click the + button to add one.
        </div>
      )}
    </div>
  );
};

export default Milestone;
