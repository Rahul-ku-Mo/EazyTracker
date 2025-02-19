/* eslint-disable @typescript-eslint/no-explicit-any */
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $findMatchingParent,
  $getNearestNodeOfType,
  mergeRegister,
} from "@lexical/utils";
import {
  $getSelection,
  $isRangeSelection,
  $isRootOrShadowRoot,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  UNDO_COMMAND,
} from "lexical";
import { ListNode, $isListNode } from "@lexical/list";

import { useCallback, useEffect, useState } from "react";
import { Button } from "../../../components/ui/button";
import {
  Bold,
  Italic,
  Underline,
  Undo,
  Redo,
  Stars,
  Sparkles,
  List,
  ListOrdered,
  HelpCircle,
  CheckSquare,
  Loader2,
} from "lucide-react";
import { cn } from "../../../lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../components/ui/popover";

import { formatBulletList, formatCheckList, formatNumberedList } from "./utils";

const LowPriority = 1;

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}

const ToolbarButton = ({
  onClick,
  isActive,
  disabled,
  children,
  className,
}: ToolbarButtonProps) => (
  <Button
    variant="ghost"
    size="sm"
    onClick={onClick}
    disabled={disabled}
    className={cn("h-8 w-8 p-0", isActive && "bg-muted", className)}
  >
    {children}
  </Button>
);

export const CardToolbarPlugin = ({ save }: { save: () => void }) => {
  const [editor] = useLexicalComposerContext();
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [showAIPopover, setShowAIPopover] = useState(false);
  const [showHelpPopover, setShowHelpPopover] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const [isSaving, setIsSaving] = useState(false);

  const [formats, setFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
  });

  const [lists, setLists] = useState({
    bulletList: false,
    orderedList: false,
    checkList: false,
  });

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      setFormats({
        bold: selection.hasFormat("bold"),
        italic: selection.hasFormat("italic"),
        underline: selection.hasFormat("underline"),
      });

      const anchorNode = selection.anchor.getNode();

      let element =
        anchorNode.getKey() === "root"
          ? anchorNode
          : $findMatchingParent(anchorNode, (e) => {
              const parent = e.getParent();

              return parent !== null && $isRootOrShadowRoot(parent);
            });

      if (element === null) element = anchorNode.getTopLevelElementOrThrow();

      const elementKey = element.getKey();
      const elementDOM = editor.getElementByKey(elementKey);

      if (elementDOM !== null) {
        if ($isListNode(element as any)) {
          const parentList = $getNearestNodeOfType<any>(anchorNode, ListNode);

          const type = parentList
            ? parentList.getListType()
            : (element as any).getListType();

          console.log(type);

          setLists({
            bulletList: type === "bullet",
            orderedList: type === "number",
            checkList: type === "check",
          });
        } else {
          setLists({
            bulletList: false,
            orderedList: false,
            checkList: false,
          });
        }
      }
    }
  }, [editor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar();
        });
      }),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        LowPriority
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        LowPriority
      )
    );
  }, [editor, updateToolbar]);

  const generateAIContent = async () => {
    setIsGenerating(true);
    try {
      // Implement your AI generation logic here
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log("AI content generation");
    } finally {
      setIsGenerating(false);
      setShowAIPopover(false);
    }
  };

  

  return (
    <div className="flex items-center gap-1 p-1 mb-2 rounded-md bg-background">
      <ToolbarButton
        onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
        disabled={!canUndo}
      >
        <Undo className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
        disabled={!canRedo}
      >
        <Redo className="w-4 h-4" />
      </ToolbarButton>

      <div className="w-px h-6 mx-1 bg-border" />

      <ToolbarButton
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
        isActive={formats.bold}
      >
        <Bold className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
        isActive={formats.italic}
      >
        <Italic className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}
        isActive={formats.underline}
      >
        <Underline className="w-4 h-4" />
      </ToolbarButton>

      <div className="w-px h-6 mx-1 bg-border" />

      <ToolbarButton
        onClick={() => {
          const newBulletListState = !lists.bulletList;
          setLists((prev) => ({
            ...prev,
            bulletList: newBulletListState,
          }));

          formatBulletList(editor, newBulletListState ? "bullet" : "paragraph");
        }}
        isActive={lists.bulletList}
      >
        <List className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => {
          const newOrderedListState = !lists.orderedList;
          setLists((prev) => ({
            ...prev,
            orderedList: newOrderedListState,
          }));

          formatNumberedList(
            editor,
            newOrderedListState ? "number" : "paragraph"
          );
        }}
        isActive={lists.orderedList}
      >
        <ListOrdered className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => {
          const newCheckListState = !lists.checkList;
          setLists((prev) => ({
            ...prev,
            checkList: newCheckListState,
          }));

          formatCheckList(editor, newCheckListState ? "check" : "paragraph");
        }}
        isActive={lists.checkList}
      >
        <CheckSquare className="w-4 h-4" />
      </ToolbarButton>

      <div className="w-px h-6 mx-1 bg-border" />

      <Popover open={showAIPopover} onOpenChange={setShowAIPopover}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="w-8 h-8 p-0"
            disabled={isGenerating}
          >
            <Stars className="w-4 h-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">AI Assistance</h4>
            <div className="space-y-1">
              <Button
                variant="secondary"
                size="sm"
                className="justify-start w-full"
                onClick={generateAIContent}
                disabled={isGenerating}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {isGenerating ? "Generating..." : "Improve writing"}
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Popover open={showHelpPopover} onOpenChange={setShowHelpPopover}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
            <HelpCircle className="w-4 h-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Keyboard Shortcuts</h4>
            <div className="space-y-1 text-sm">
              <p>Bold: Ctrl/⌘ + B</p>
              <p>Italic: Ctrl/⌘ + I</p>
              <p>Underline: Ctrl/⌘ + U</p>
              <p>Undo: Ctrl/⌘ + Z</p>
              <p>Redo: Ctrl/⌘ + Y</p>
              <p>Bullet List: Ctrl/⌘ + Shift + 8</p>
              <p>Numbered List: Ctrl/⌘ + Shift + 7</p>
              <p>Check List: Ctrl/⌘ + Shift + 9</p>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Button
        variant="default"
        size="sm"
        className={cn(
          "ml-auto mr-0.5 h-7 flex gap-0.5",
          !isSaving && "bg-green-500 hover:bg-green-600"
        )}
        onClick={() => { 
          setIsSaving(true);
          save();
          setTimeout(() => {
            setIsSaving(false);
          }, 1000);
        }}
      >
        {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
        {isSaving ? "Saving..." : "Save"}
      </Button>
    </div>
  );
};
