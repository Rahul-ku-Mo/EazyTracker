# Clear Due Date Functionality

## Overview
Users can now clear due dates in two locations:
1. **Cards in Column View** - Using the calendar popover in the card footer
2. **Right Panel** - Using multiple options in the card details panel

## Implementation Details

### 1. Cards in Column (Card.tsx)
**Location**: Card footer due date popover
**Implementation**: 
- Click on the due date area in any card
- A calendar popover opens
- "Clear due date" button is always visible at the bottom of the popover
- Clicking it removes the due date instantly

**Code**:
```typescript
<div className="p-3 border-t">
  <Button
    variant="outline"
    size="sm"
    className="w-full"
    onClick={(e) => {
      e.stopPropagation();
      updateDueDate(null);
    }}
  >
    Clear due date
  </Button>
</div>
```

### 2. Right Panel (RightPanel/index.tsx)
**Location**: Due Date section in the card details panel
**Implementation**: 
- **Option 1**: Clear button next to other due date options (visible only when a due date is set)
- **Option 2**: Clear button inside the calendar popover (when using Custom date picker)

**Clear Button (Primary)**:
```typescript
{dueDate && (
  <Button
    variant="ghost"
    className="rounded-full text-xs py-1 px-4 h-auto text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
    onClick={() => updateCardMutation.mutate({ cardId, dueDate: null })}
  >
    <X className="w-3 h-3 mr-1" />
    Clear
  </Button>
)}
```

**Clear Button (In Calendar)**:
```typescript
{dueDate && (
  <div className="p-3 border-t">
    <Button
      variant="outline"
      size="sm"
      className="w-full"
      onClick={() => updateCardMutation.mutate({ cardId, dueDate: null })}
    >
      Clear due date
    </Button>
  </div>
)}
```

## User Experience

### Cards in Column
1. **Set Due Date**: Click the calendar icon → Select date
2. **View Due Date**: Due date appears as text (readable or calendar format based on settings)
3. **Clear Due Date**: Click due date → Click "Clear due date" button

### Right Panel
1. **Set Due Date**: Use Today/Tomorrow buttons or Custom calendar picker
2. **View Due Date**: Due date badge shows with appropriate styling (Today/Tomorrow/Date)
3. **Clear Due Date**: 
   - **Quick**: Click the red "Clear" button next to other options
   - **From Calendar**: Click Custom → Click "Clear due date" button

## Visual Feedback

### Due Date Display
- **Today**: Red background with "Today" text
- **Tomorrow**: Yellow background with "Tomorrow" text
- **Other Dates**: Gray background with formatted date
- **No Due Date**: Calendar icon only (in cards) or no badge (in panel)

### Clear Button Styling
- **Cards**: Clean outline button in calendar popover
- **Right Panel**: Red ghost button with X icon for quick access
- **Calendar Popover**: Full-width outline button at bottom

## Accessibility
- All buttons have proper hover states
- Clear buttons are clearly labeled
- Click events prevent event bubbling to avoid accidental actions
- Keyboard accessible through standard button navigation

## Notes
- Clearing due date sets the value to `null`
- Changes are immediately saved via `updateCardMutation`
- Both locations use the same mutation for consistency
- Clear functionality respects the existing date format preference (readable vs calendar)
- All clear actions provide immediate visual feedback 