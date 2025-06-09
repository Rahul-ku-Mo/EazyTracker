import { useViewOptionsStore } from '@/store/useViewOptionsStore';
import { Button } from '@/components/ui/button';
import ViewOptionsPanel from './ViewOptionsPanel';

const TestViewOptions = () => {
  const { 
    viewOptions, 
    isPanelOpen, 
    updateViewOptions, 
    openPanel, 
    closePanel 
  } = useViewOptionsStore();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">View Options Test</h1>
      
      <Button onClick={openPanel} className="mb-4">
        Open View Options Panel
      </Button>

      <div className="space-y-2 text-sm">
        <div>Current View: {viewOptions.groupBy}</div>
        <div>Show Completed Cards: {viewOptions.showCompletedCards ? 'Yes' : 'No'}</div>
        <div>Show Card IDs: {viewOptions.showCardIds ? 'Yes' : 'No'}</div>
        <div>Priority Display: {viewOptions.displayProperties.priority ? 'On' : 'Off'}</div>
      </div>

      <ViewOptionsPanel
        isOpen={isPanelOpen}
        onClose={closePanel}
        currentView="kanban"
        onViewChange={(view) => console.log('View changed to:', view)}
        viewOptions={viewOptions}
        onOptionsChange={updateViewOptions}
      />
    </div>
  );
};

export default TestViewOptions; 