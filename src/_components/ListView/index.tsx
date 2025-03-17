import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, ArrowRightIcon, TagIcon, DatabaseZap, Library } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import ListViewContextMenu from './ListViewContextMenu';

interface CardItem {
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
}

interface ListViewProps {
  data: {
    [key: string]: CardItem[];
  };
  onEditItem?: (itemId: number) => void;
  onDeleteItem?: (itemId: number) => void;
  onMoveItem?: (itemId: number) => void;
  onScheduleItem?: (itemId: number) => void;
}

// Priority color mapping
const priorityConfig = {
  'low': { label: 'Low', color: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400' },
  'medium': { label: 'Medium', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' },
  'high': { label: 'High', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' }, 
  'urgent': { label: 'Urgent', color: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' },
};

const listVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      type: "spring",
      stiffness: 300,
      damping: 24
    }
  }
};

const ListView = ({ 
  data,
  onEditItem,
  onDeleteItem,
  onMoveItem,
  onScheduleItem 
}: ListViewProps) => {
  return (
    <motion.div 
      className="flex flex-1 flex-col"
      initial="hidden"
      animate="visible"
      variants={listVariants}
    >
      {Object.entries(data).map(([columnTitle, items]) => (
        <div key={columnTitle} className="mb-6">
          <h2 className="text-sm flex items-center gap-2 font-bold px-4 py-2 text-zinc-900 dark:text-zinc-100 w-full border dark:bg-zinc-800 bg-zinc-100 border-zinc-200 dark:border-zinc-800">
           <Library strokeWidth={2} className="size-4 " />
                {columnTitle}
          </h2>
          
          {items.map((item) => (
            <ListViewContextMenu
              key={item.id}
              cardId={item.id}
              onEdit={() => onEditItem?.(item.id)}
              onDelete={() => onDeleteItem?.(item.id)}
              onMove={() => onMoveItem?.(item.id)}
              onSchedule={() => onScheduleItem?.(item.id)}
            >
              <motion.div
                variants={itemVariants}
                whileHover={{ 
                  x: 1,
                  transition: { duration: 0.2 }
                }}
                className="group flex items-center justify-between px-4 py-2.5 border hover:border-zinc-200 dark:hover:border-zinc-800 cursor-pointer"
              >
                <div className="flex items-center gap-3 flex-grow min-w-0">
                  {/* Title */}
                  <DatabaseZap className="size-4 text-zinc-500 dark:text-zinc-400" />

                  <span className="text-sm text-zinc-500 dark:text-zinc-200 font-bold font-gt-walsheim ">
                      {`${columnTitle.substring(0, 2).toUpperCase()} - ${item.id}`}
                  </span>

                  <div className="flex-grow truncate font-medium text-xs text-zinc-900 dark:text-zinc-100">
                    {item.title}
                  </div>
                  
                  {/* Priority */}
                  {item.priority && (
                    <Badge className={`text-xs px-1.5 py-0.5 ${priorityConfig[item.priority].color}`}>
                      {priorityConfig[item.priority].label}
                    </Badge>
                  )}
                  
                  {/* Labels/Tags */}
                  {item.labels && item.labels.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <TagIcon className="h-3 w-3 text-zinc-400" />
                      <div className="flex gap-1">
                        {item.labels.slice(0, 2).map((tag, index) => (
                          <Badge 
                            key={index} 
                            variant="outline" 
                            className="text-xs px-1.5 py-0.5 bg-transparent text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {item.labels.length > 2 && (
                          <span className="text-xs text-zinc-400">+{item.labels.length - 2}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                  {/* Due date */}
                  {item.dueDate && (
                    <div className="flex items-center text-xs text-zinc-500 dark:text-zinc-400">
                      <CalendarIcon className="mr-1 h-3 w-3" />
                      {formatDistanceToNow(new Date(item.dueDate), { addSuffix: true })}
                    </div>
                  )}
                  
                  {/* Arrow icon (visible on hover) */}
                  <ArrowRightIcon className="h-4 w-4 text-zinc-400 dark:text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.div>
            </ListViewContextMenu>
          ))}
          
          {/* Empty state for each column */}
          {items.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-16 text-zinc-500 dark:text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-700 rounded-md"
            >
              <p className="text-sm">No items in {columnTitle}</p>
            </motion.div>
          )}
        </div>
      ))}
      
      {/* Empty state when no data at all */}
      {Object.keys(data).length === 0 && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center h-32 text-zinc-500 dark:text-zinc-400"
        >
          <p>No items found</p>
        </motion.div>
      )}
    </motion.div>
    
  );
};

export default ListView;
