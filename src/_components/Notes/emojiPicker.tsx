import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { Laugh, X } from "lucide-react";
import {  useMemo, useCallback } from "react";

interface EmojiPickerProps {
  currentEmoji?: string;
  onEmojiSelect?: (emoji: string) => void;
  onEmojiRemove?: () => void;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function EmojiPicker({ currentEmoji, onEmojiSelect, onEmojiRemove, isOpen, setIsOpen }: EmojiPickerProps) {
  
  const handleEmojiClick = useCallback((emoji: any) => {
    console.log(emoji);
    onEmojiSelect?.(emoji.native);
    setIsOpen(false); 
  }, [onEmojiSelect, setIsOpen]);

  const handleRemove = useCallback(() => {
    onEmojiRemove?.();
    setIsOpen(false);
  }, [onEmojiRemove, setIsOpen]);

  const handleClose = useCallback(() => {
    console.log("clicked outside");
    setIsOpen(false);
  }, [setIsOpen]);

  const toggleEmojiPicker = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  }, [setIsOpen]);

  // Memoize picker props to prevent unnecessary re-renders
  const pickerProps = useMemo(() => ({
    data,
    onEmojiSelect: handleEmojiClick,
    onClickOutside: handleClose,
    theme: "auto" as const,
    previewPosition: "none" as const,
    skinTonePosition: "preview" as const,
  }), [handleEmojiClick, handleClose]);

  return (
    <div className="relative">
    {!currentEmoji && (
      <div
        onClick={toggleEmojiPicker}
        className="emoji-picker-trigger inline-flex items-center gap-2 cursor-pointer px-2 py-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
      >
        <Laugh className="w-4 h-4" />
        Add Icon
      </div>
    ) }
      {isOpen && (
        <div className={`absolute top-full left-0 z-[9999] mt-2`}>
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-2xl border border-zinc-200 dark:border-zinc-700">
            {/* Remove button if emoji exists */}
            {currentEmoji && (
              <div className="p-2 border-b border-zinc-200 dark:border-zinc-700">
                <button
                  onClick={handleRemove}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                >
                  <X className="w-4 h-4" />
                  Remove Icon
                </button>
              </div>
            )}
            <Picker {...pickerProps} />
          </div>
        </div>
      )}
    </div>
  );
}
