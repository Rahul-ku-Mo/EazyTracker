import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronDown,
  Eye,
  Calendar,
  User,
  Flag,
  Settings,
  List,
  Grid3x3,
  Columns3,
  Tag,
  Clock,
  Milestone,
  BarChart3,
  Link,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface ViewOptionsProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: 'kanban' | 'listview';
  onViewChange: (view: 'kanban' | 'listview') => void;
  viewOptions: ViewOptions;
  onOptionsChange: (options: Partial<ViewOptions>) => void;
}

export interface ViewOptions {
  // Grouping
  groupBy: 'column' | 'priority' | 'assignee' | 'dueDate' | 'none';
  subGroupBy: 'none' | 'priority' | 'assignee';
  orderBy: 'manual' | 'created' | 'updated' | 'priority' | 'dueDate' | 'title';
  orderDirection: 'asc' | 'desc';
  
  // Visibility
  showCompletedCards: boolean;
  showEmptyGroups: boolean;
  showEmptyColumns: boolean;
  showCardIds: boolean;
  
  // Date Format
  dateFormat: 'readable' | 'calendar';
  
  // Display Properties
  displayProperties: {
    priority: boolean;
    assignee: boolean;
    dueDate: boolean;
    labels: boolean;
    description: boolean;
    attachments: boolean;
    createdDate: boolean;
    updatedDate: boolean;
    milestone: boolean;
    estimate: boolean;
  };
  
  // Filters
  activeFilters: {
    priority: string[];
    assignee: string[];
    labels: string[];
    dueDate: 'overdue' | 'today' | 'thisWeek' | 'thisMonth' | 'none';
  };
}

const ViewOptionsPanel = ({ 
  isOpen, 
  onClose, 
  currentView, 
  onViewChange, 
  viewOptions, 
  onOptionsChange 
}: ViewOptionsProps) => {
  const [expandedSections, setExpandedSections] = useState<string[]>([
    'view', 'grouping', 'display'
  ]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const handlePropertyToggle = (property: keyof ViewOptions['displayProperties']) => {
    console.log('Toggling property:', property, 'from', viewOptions.displayProperties[property], 'to', !viewOptions.displayProperties[property]);
    onOptionsChange({
      displayProperties: {
        ...viewOptions.displayProperties,
        [property]: !viewOptions.displayProperties[property]
      }
    });
  };

  const SectionHeader = ({ 
    title, 
    icon: Icon, 
    sectionKey 
  }: { 
    title: string; 
    icon: any; 
    sectionKey: string;
  }) => (
    <button
      onClick={() => toggleSection(sectionKey)}
      className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors border-b border-zinc-100 dark:border-zinc-800"
    >
      <div className="flex items-center gap-3">
        <Icon className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
        <span className="font-medium text-sm text-zinc-900 dark:text-zinc-100">{title}</span>
      </div>
      <ChevronDown 
        className={cn(
          "h-4 w-4 text-zinc-400 dark:text-zinc-500 transition-transform duration-200",
          expandedSections.includes(sectionKey) && "rotate-180"
        )} 
      />
    </button>
  );

  const PropertyToggle = ({ 
    label, 
    icon: Icon, 
    property 
  }: { 
    label: string; 
    icon: any; 
    property: keyof ViewOptions['displayProperties'];
  }) => (
    <div className="flex items-center justify-between px-4 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
      <div className="flex items-center gap-3">
        <Icon className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500" />
        <span className="text-sm text-zinc-700 dark:text-zinc-300">{label}</span>
      </div>
      <Switch
        checked={viewOptions.displayProperties[property]}
        onCheckedChange={() => handlePropertyToggle(property)}
      />
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40"
            onClick={onClose}
          />
          
          {/* Panel */}
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-80 bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 z-50 overflow-y-auto shadow-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <h2 className="font-semibold">View Options</h2>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>

                        <div>
              {/* View Toggle */}
              <SectionHeader title="View" icon={Eye} sectionKey="view" />
              {expandedSections.includes('view') && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-4 py-3 bg-zinc-50/50 dark:bg-zinc-800/30"
                >
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={currentView === 'listview' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => onViewChange('listview')}
                      className="flex items-center gap-2 text-xs"
                    >
                      <List className="h-3.5 w-3.5" />
                      List
                    </Button>
                    <Button
                      variant={currentView === 'kanban' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => onViewChange('kanban')}
                      className="flex items-center gap-2 text-xs"
                    >
                      <Grid3x3 className="h-3.5 w-3.5" />
                      Board
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Grouping */}
              <SectionHeader title="Grouping" icon={Columns3} sectionKey="grouping" />
              {expandedSections.includes('grouping') && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-4 py-3 space-y-4 bg-zinc-50/50 dark:bg-zinc-800/30"
                >
                  <div>
                    <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2 block">
                      Group by
                    </label>
                    <Select
                      value={viewOptions.groupBy}
                      onValueChange={(value: any) => onOptionsChange({ groupBy: value })}
                    >
                      <SelectTrigger className="w-full h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="column">Column</SelectItem>
                        <SelectItem value="priority">Priority</SelectItem>
                        <SelectItem value="assignee">Assignee</SelectItem>
                        <SelectItem value="dueDate">Due Date</SelectItem>
                        <SelectItem value="none">No grouping</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2 block">
                      Order by
                    </label>
                    <Select
                      value={viewOptions.orderBy}
                      onValueChange={(value: any) => onOptionsChange({ orderBy: value })}
                    >
                      <SelectTrigger className="w-full h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">Manual</SelectItem>
                        <SelectItem value="created">Created</SelectItem>
                        <SelectItem value="updated">Updated</SelectItem>
                        <SelectItem value="priority">Priority</SelectItem>
                        <SelectItem value="dueDate">Due Date</SelectItem>
                        <SelectItem value="title">Title</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </motion.div>
              )}

              {/* Options */}
              <SectionHeader title="Options" icon={Settings} sectionKey="options" />
              {expandedSections.includes('options') && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-zinc-50/50 dark:bg-zinc-800/30"
                >
                  <div className="flex items-center justify-between px-4 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                    <span className="text-sm text-zinc-700 dark:text-zinc-300">Show completed cards</span>
                    <Switch
                      checked={viewOptions.showCompletedCards}
                      onCheckedChange={(checked) => onOptionsChange({ showCompletedCards: checked })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between px-4 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                    <span className="text-sm text-zinc-700 dark:text-zinc-300">Show empty groups</span>
                    <Switch
                      checked={viewOptions.showEmptyGroups}
                      onCheckedChange={(checked) => onOptionsChange({ showEmptyGroups: checked })}
                    />
                  </div>

                  {currentView === 'kanban' && (
                    <div className="flex items-center justify-between px-4 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                      <span className="text-sm text-zinc-700 dark:text-zinc-300">Show empty columns</span>
                      <Switch
                        checked={viewOptions.showEmptyColumns}
                        onCheckedChange={(checked) => onOptionsChange({ showEmptyColumns: checked })}
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between px-4 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                    <span className="text-sm text-zinc-700 dark:text-zinc-300">Show card IDs</span>
                    <Switch
                      checked={viewOptions.showCardIds}
                      onCheckedChange={(checked) => onOptionsChange({ showCardIds: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between px-4 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                    <span className="text-sm text-zinc-700 dark:text-zinc-300">Readable date format</span>
                    <Switch
                      checked={viewOptions.dateFormat === 'readable'}
                      onCheckedChange={(checked) => onOptionsChange({ dateFormat: checked ? 'readable' : 'calendar' })}
                    />
                  </div>
                </motion.div>
              )}

              {/* Display Properties */}
              <SectionHeader title="Display Properties" icon={BarChart3} sectionKey="display" />
              {expandedSections.includes('display') && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-zinc-50/50 dark:bg-zinc-800/30"
                >
                  <PropertyToggle label="Priority" icon={Flag} property="priority" />
                  <PropertyToggle label="Assignee" icon={User} property="assignee" />
                  <PropertyToggle label="Due Date" icon={Calendar} property="dueDate" />
                  <PropertyToggle label="Labels" icon={Tag} property="labels" />
                  <PropertyToggle label="Description" icon={BarChart3} property="description" />
                  <PropertyToggle label="Attachments" icon={Link} property="attachments" />
                  <PropertyToggle label="Created Date" icon={Clock} property="createdDate" />
                  <PropertyToggle label="Updated Date" icon={Clock} property="updatedDate" />
                  <PropertyToggle label="Milestone" icon={Milestone} property="milestone" />
                  <PropertyToggle label="Estimate" icon={BarChart3} property="estimate" />
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ViewOptionsPanel; 