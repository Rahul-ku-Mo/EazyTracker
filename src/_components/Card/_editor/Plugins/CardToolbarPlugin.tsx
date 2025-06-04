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
  $getRoot,
  $createTextNode,
} from "lexical";
import { ListNode, $isListNode } from "@lexical/list";
import {
  $isHeadingNode,
} from "@lexical/rich-text";
import { useCallback, useEffect, useState } from "react";
import { Button } from "../../../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../../components/ui/dropdown-menu";
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
  //Image,
} from "lucide-react";
import { cn } from "../../../../lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../../components/ui/popover";

import {
  formatBulletList,
  formatCheckList,
  formatNumberedList,
  formatHeading,
  convertToMarkdown,
} from "../utils";
import {
  Tooltip,
  TooltipTrigger,
  TooltipProvider,
  TooltipContent,
} from "../../../../components/ui/tooltip";
//import { INSERT_IMAGE_COMMAND } from "../ImageNode";

import { useImproveWriting } from "../../_cardViewerPanel/_components/LeftPanel/useGeminiStream";
import { toast } from "sonner";

const blockTypeToBlockName = {
  h1: "Heading 1",
  h2: "Heading 2",
  h3: "Heading 3",
  h4: "Heading 4",
  h5: "Heading 5",
  h6: "Heading 6",
};

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
  const [isSaving, setIsSaving] = useState(false);

  // AI improve writing hook
  const { improvedText, isImproving, error, improveText, stopImproving } = useImproveWriting();

  const [formats, setFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
  });

  const [headings, setHeadings] = useState({
    h1: false,
    h2: false,
    h3: false,
    h4: false,
    h5: false,
    h6: false,
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

          setLists({
            bulletList: type === "bullet",
            orderedList: type === "number",
            checkList: type === "check",
          });

          setHeadings({
            h1: false,
            h2: false,
            h3: false,
            h4: false,
            h5: false,
            h6: false,
          });
        } else {
          const type = $isHeadingNode(element)
            ? element.getTag()
            : element.getType();
          if (type in blockTypeToBlockName) {
            setHeadings((prev) => ({
              ...prev,
              [type]: true,
            }));
          }

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
    editor.update(() => {
      const selection = $getSelection();
      
      if ($isRangeSelection(selection)) {
        const selectedText = selection.getTextContent();
        
        if (!selectedText.trim()) {
          toast.error("Please select some text to improve");
          return;
        }
        
        // Start the improvement process
        improveText(selectedText);
      } else {
        // If no selection, get all text content
        const root = $getRoot();
        const allText = root.getTextContent();
        
        if (!allText.trim()) {
          toast.error("No content to improve");
          return;
        }
        
        improveText(allText);
      }
    });
    
    setShowAIPopover(false);
  };

  // Handle improved text result
  useEffect(() => {
    if (improvedText && !isImproving) {
      editor.update(() => {
        const selection = $getSelection();
        
        if ($isRangeSelection(selection)) {
          // Replace selected text with improved version
          const selectedText = selection.getTextContent();
          if (selectedText.trim()) {
            selection.insertText(improvedText);
          } else {
            // If no selection, replace all content
            const root = $getRoot();
            root.clear();
            const textNode = $createTextNode(improvedText);
            root.append(textNode);
          }
        } else {
          // Replace all content if no selection
          const root = $getRoot();
          root.clear();
          const textNode = $createTextNode(improvedText);
          root.append(textNode);
        }
      });
      
      toast.success("Text improved successfully!");
    }
  }, [improvedText, isImproving, editor]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(`Failed to improve text: ${error.message}`);
    }
  }, [error]);

  // const insertImage = () => {
  //   editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
  //     src: "https://picsum.photos/300/200",
  //     altText: "A random image",
  //     showCaption: true,
  //   });
  // };

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

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <span className="text-sm font-bold cursor-pointer ">Heading</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={() => formatHeading(editor, "h1")}
            className={cn("font-bold text-xl", headings.h1 && "bg-accent")}
          >
            Heading 1
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => formatHeading(editor, "h2")}
            className={cn("font-bold text-lg", headings.h2 && "bg-accent")}
          >
            Heading 2
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => formatHeading(editor, "h3")}
            className={cn("font-bold text-base", headings.h3 && "bg-accent")}
          >
            Heading 3
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => formatHeading(editor, "h4")}
            className={cn("font-bold text-sm", headings.h4 && "bg-accent")}
          >
            Heading 4
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => formatHeading(editor, "h5")}
            className={cn("font-bold text-xs", headings.h5 && "bg-accent")}
          >
            Heading 5
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => formatHeading(editor, "h6")}
            className={cn("font-bold text-xs", headings.h6 && "bg-accent")}
          >
            Heading 6
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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

      {/* <ToolbarButton onClick={insertImage}>
        <Image className="w-4 h-4" />
      </ToolbarButton> */}

      <div className="w-px h-6 mx-1 bg-border" />

      <Popover open={showAIPopover} onOpenChange={setShowAIPopover}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="w-8 h-8 p-0"
            disabled={isImproving}
          >
            {isImproving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Stars className="w-4 h-4" />
            )}
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
                disabled={isImproving}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {isImproving ? "Improving..." : "Improve writing"}
              </Button>
              {isImproving && (
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start w-full"
                  onClick={stopImproving}
                >
                  Stop
                </Button>
              )}
            </div>
            {isImproving && (
              <div className="text-xs text-muted-foreground">
                Analyzing and improving your text...
              </div>
            )}
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

      <ToolbarButton onClick={() => convertToMarkdown(editor)}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>M</TooltipTrigger>
            <TooltipContent>
              <p>Toggle Markdown View</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </ToolbarButton>
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
