import { useState } from "react";
import { Diamond, MilestoneIcon, Plus, GripVertical } from "lucide-react";
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
import {
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Interface for milestone item
interface MilestoneItem {
  id: string;
  name: string;
}

// Props for external state management
interface MilestoneProps {
  externalMilestones?: string[];
  onMilestonesChange?: (milestones: string[]) => void;
  readOnly?: boolean;
}

// Sortable milestone item component
const SortableMilestoneItem = ({ 
  item, 
  onDelete, 
  onEdit,
  readOnly = false 
}: { 
  item: MilestoneItem; 
  onDelete: (id: string) => void;
  onEdit?: (id: string, newName: string) => void;
  readOnly?: boolean;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(item.name);

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
    if (onEdit && editValue.trim() !== item.name) {
      onEdit(item.id, editValue.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEdit();
    } else if (e.key === 'Escape') {
      setEditValue(item.name);
      setIsEditing(false);
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
        <Diamond className="size-2.5" />
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
            className="text-xs font-semibold cursor-pointer hover:bg-accent/20 px-1 py-0.5 rounded"
            onClick={() => !readOnly && onEdit && setIsEditing(true)}
          >
            {item.name}
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

const Milestone = ({ externalMilestones, onMilestonesChange, readOnly = false }: MilestoneProps) => {
  // Convert external milestones to internal format
  const convertToMilestoneItems = (milestones: string[]): MilestoneItem[] => {
    return milestones.map((milestone, index) => ({
      id: `milestone-${index}`,
      name: milestone,
    }));
  };

  // Convert internal format to external format
  const convertToStringArray = (items: MilestoneItem[]): string[] => {
    return items.map(item => item.name);
  };

  // Internal state for standalone mode
  const [internalMilestones, setInternalMilestones] = useState<MilestoneItem[]>([
    { id: "1", name: "Initial milestone" },
    { id: "2", name: "Development phase" },
    { id: "3", name: "Testing phase" },
  ]);

  // Use external or internal state
  const milestones = externalMilestones 
    ? convertToMilestoneItems(externalMilestones)
    : internalMilestones;

  const setMilestones = (newMilestones: MilestoneItem[]) => {
    if (onMilestonesChange) {
      onMilestonesChange(convertToStringArray(newMilestones));
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
      name: `New milestone ${milestones.length + 1}`,
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
        milestone.id === id ? { ...milestone, name: newName } : milestone
      )
    );
  };

  return (
    <div className="w-full mx-auto max-w-2xl border border-border rounded-t-md flex flex-col mb-4">
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
        <SortableContext items={milestones} strategy={verticalListSortingStrategy}>
          {milestones.map((milestone) => (
            <SortableMilestoneItem
              key={milestone.id}
              item={milestone}
              onDelete={deleteMilestone}
              onEdit={editMilestone}
              readOnly={readOnly}
            />
          ))}
        </SortableContext>
      </DndContext>
      
      {milestones.length === 0 && (
        <div className="p-4 text-center text-muted-foreground text-sm">
          No milestones yet. Click the + button to add one.
        </div>
      )}
    </div>
  );
};

export default Milestone;
