import type { JSX } from "react";

import "./index.css";

import { $createCodeNode, $isCodeHighlightNode } from "@lexical/code";
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_CHECK_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
  ListNode,
  $isListNode,
} from "@lexical/list";
import {$isLinkNode, TOGGLE_LINK_COMMAND} from '@lexical/link';
import { mergeRegister } from "@lexical/utils";
import {
  $createParagraphNode,
  $getSelection,
  $isParagraphNode,
  $isRangeSelection,
  $isTextNode,
  COMMAND_PRIORITY_LOW,
  FORMAT_TEXT_COMMAND,
  getDOMSelection,
  LexicalEditor,
  SELECTION_CHANGE_COMMAND,
} from "lexical";
import { $getNearestNodeOfType } from "@lexical/utils";
import { $setBlocksType } from "@lexical/selection";
import { $createHeadingNode, $isHeadingNode } from "@lexical/rich-text";
import { useCallback, useEffect, useRef , useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { createPortal } from "react-dom";
import {
  getDOMRangeRect,
  getSelectedNode,
  setFloatingElemPosition,
} from "../../utils";
import {
  BoldIcon,
  InlineCodeIcon,
  CodeBlockIcon,
  ItalicIcon,
  LinkIcon,
  StrikethroughIcon,
  SubscriptIcon,
  SuperscriptIcon,
  UnderlineIcon,
  OrderedListIcon,
  UnorderedListIcon,
  CheckListIcon,
} from "@/_components/shared/svg/FormattingIcons";
import { cn } from "@/lib/utils";
//import { convertToMarkdown } from "@/_components/Card/_editor/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
// import {INSERT_INLINE_COMMAND} from '../CommentPlugin';

function TextFormatFloatingToolbar({
  editor,
  anchorElem,
   isLink,
  isBold,
  isItalic,
  isUnderline,
  isCode,
  isStrikethrough,
  isSubscript,
  isSuperscript,
  isHeading,
  isParagraph,
  isBulletList,
  isOrderedList,
  isCheckList,
  setIsLinkEditMode,
}: // setIsLinkEditMode,
{
  editor: LexicalEditor;
  anchorElem: HTMLElement;
  isBold: boolean;
  isCode: boolean;
  isItalic: boolean;
  isLink: boolean; 
  isUppercase?: boolean;
  isLowercase?: boolean;
  isCapitalize?: boolean;
  isStrikethrough: boolean;
  isSubscript: boolean;
  isSuperscript: boolean;
  isUnderline: boolean;
  isHeading: {
    h1: boolean;
    h2: boolean;
    h3: boolean;
    h4: boolean;
    h5: boolean;
    h6: boolean;
  };
  isParagraph: boolean;
  isBulletList: boolean;
  isOrderedList: boolean;
  isCheckList: boolean;
  setIsLinkEditMode: React.Dispatch<React.SetStateAction<boolean>>;
}): JSX.Element {
  const popupCharStylesEditorRef = useRef<HTMLDivElement | null>(null);

  const insertLink = useCallback(() => {
    if (!isLink) {
      setIsLinkEditMode(true);
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, 'https://');
    } else {
      setIsLinkEditMode(false);
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  }, [editor, isLink, setIsLinkEditMode]);

    // const insertComment = () => {
    //   editor.dispatchCommand(INSERT_INLINE_COMMAND, undefined);
    // };

  function mouseMoveListener(e: MouseEvent) {
    if (
      popupCharStylesEditorRef?.current &&
      (e.buttons === 1 || e.buttons === 3)
    ) {
      if (popupCharStylesEditorRef.current.style.pointerEvents !== "none") {
        const x = e.clientX;
        const y = e.clientY;
        const elementUnderMouse = document.elementFromPoint(x, y);

        if (!popupCharStylesEditorRef.current.contains(elementUnderMouse)) {
          // Mouse is not over the target element => not a normal click, but probably a drag
          popupCharStylesEditorRef.current.style.pointerEvents = "none";
        }
      }
    }
  }
  function mouseUpListener() {
    if (popupCharStylesEditorRef?.current) {
      if (popupCharStylesEditorRef.current.style.pointerEvents !== "auto") {
        popupCharStylesEditorRef.current.style.pointerEvents = "auto";
      }
    }
  }

  useEffect(() => {
    if (popupCharStylesEditorRef?.current) {
      document.addEventListener("mousemove", mouseMoveListener);
      document.addEventListener("mouseup", mouseUpListener);

      return () => {
        document.removeEventListener("mousemove", mouseMoveListener);
        document.removeEventListener("mouseup", mouseUpListener);
      };
    }
  }, [popupCharStylesEditorRef]);

  const $updateTextFormatFloatingToolbar = useCallback(() => {
    const selection = $getSelection();

    const popupCharStylesEditorElem = popupCharStylesEditorRef.current;
    const nativeSelection = getDOMSelection(editor._window);

    if (popupCharStylesEditorElem === null) {
      return;
    }

    const rootElement = editor.getRootElement();
    if (
      selection !== null &&
      nativeSelection !== null &&
      !nativeSelection.isCollapsed &&
      rootElement !== null &&
      rootElement.contains(nativeSelection.anchorNode)
    ) {
      const rangeRect = getDOMRangeRect(nativeSelection, rootElement);

      setFloatingElemPosition(
        rangeRect,
        popupCharStylesEditorElem,
        anchorElem,
         isLink,
        0 // Default to false since link feature is commented out
      );
    }
  }, [editor, anchorElem, isLink]);

  useEffect(() => {
    const scrollerElem = anchorElem.parentElement;

    const update = () => {
      editor.getEditorState().read(() => {
        $updateTextFormatFloatingToolbar();
      });
    };

    window.addEventListener("resize", update);
    if (scrollerElem) {
      scrollerElem.addEventListener("scroll", update);
    }

    return () => {
      window.removeEventListener("resize", update);
      if (scrollerElem) {
        scrollerElem.removeEventListener("scroll", update);
      }
    };
  }, [editor, $updateTextFormatFloatingToolbar, anchorElem]);

  useEffect(() => {
    editor.getEditorState().read(() => {
      $updateTextFormatFloatingToolbar();
    });
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateTextFormatFloatingToolbar();
        });
      }),

      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          $updateTextFormatFloatingToolbar();
          return false;
        },
        COMMAND_PRIORITY_LOW
      )
    );
  }, [editor, $updateTextFormatFloatingToolbar]);

  const getCurrentTextStyle = () => {
    if (isParagraph) return 'P';
    const activeHeading = Object.keys(isHeading).find(key => isHeading[key as keyof typeof isHeading]);
    if (activeHeading) return activeHeading.toUpperCase();
    return 'Text';
  };

  return (
    <TooltipProvider>
      <div ref={popupCharStylesEditorRef} className="floating-text-format-popup dark:bg-black bg-white border border-border rounded-md h-fit">
        {editor !== null && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => {
                    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
                  }}
                  className={"popup-item spaced " + (isBold ? "active" : "")}
                  aria-label="Format text as bold"
                >
                  <BoldIcon 
                   className={cn(
                    "w-4 h-4",
                    isBold ? "text-white" : "text-black dark:text-white"
                   )}
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent className="mb-0.5">
                <p>Bold</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => {
                    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
                  }}
                  className={"popup-item spaced " + (isItalic ? "active" : "")}
                  aria-label="Format text as italics"
                >
                  <ItalicIcon
                    className={cn(
                      "w-4 h-4",
                      isItalic ? "text-white" : "text-black dark:text-white"
                    )}
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent className="mb-0.5">
                <p>Italic</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => {
                    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
                  }}
                  className={"popup-item spaced " + (isUnderline ? "active" : "")}
                  aria-label="Format text to underlined"
                >
                  <UnderlineIcon
                    className={cn(
                      "w-4 h-4",
                      isUnderline ? "text-white" : "text-black dark:text-white"
                    )}
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent className="mb-0.5">
                <p>Underline</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => {
                    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough");
                  }}
                  className={"popup-item spaced " + (isStrikethrough ? "active" : "")}
                  aria-label="Format text with a strikethrough"
                >
                  <StrikethroughIcon
                    className={cn(
                      "w-4 h-4",
                      isStrikethrough ? "text-white" : "text-black dark:text-white"
                    )}
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent className="mb-0.5">
                <p>Strikethrough</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => {
                    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "subscript");
                  }}
                  className={"popup-item spaced " + (isSubscript ? "active" : "")}
                  aria-label="Format Subscript"
                >
                  <SubscriptIcon
                    className={cn(
                      "w-4 h-4",
                      isSubscript ? "text-white" : "text-black dark:text-white"
                    )}
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent className="mb-0.5">
                <p>Subscript</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => {
                    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "superscript");
                  }}
                  className={"popup-item spaced " + (isSuperscript ? "active" : "")}
                  aria-label="Format Superscript"
                >
                  <SuperscriptIcon
                    className={cn(
                      "w-4 h-4",
                      isSuperscript ? "text-white" : "text-black dark:text-white"
                    )}
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent className="mb-0.5">
                <p>Superscript</p>
              </TooltipContent>
            </Tooltip>
         <div className="flex border-r border-border pr-1">
           <DropdownMenu>
             <Tooltip>
               <TooltipTrigger asChild>
                 <DropdownMenuTrigger asChild>
                   <button
                     type="button"
                     className={`popup-item text-xs font-medium px-2 py-1 flex items-center gap-1 ${
                       (isHeading.h1 || isHeading.h2 || isHeading.h3 || isParagraph) ? 'active' : ''
                     }`}
                     aria-label="Text style options"
                   >
                     {getCurrentTextStyle()}
                     <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                     </svg>
                   </button>
                 </DropdownMenuTrigger>
               </TooltipTrigger>
               <TooltipContent className="mb-0.5">
                 <p>Text Style</p>
               </TooltipContent>
             </Tooltip>
             <DropdownMenuContent align="start" sideOffset={4} className="min-w-[160px]">
               <DropdownMenuItem
                 onClick={() => {
                   editor.update(() => {
                     const selection = $getSelection();
                     if ($isRangeSelection(selection)) {
                       $setBlocksType(selection, () => $createParagraphNode());
                     }
                   });
                 }}
                 className={cn(
                   "text-sm",
                   isParagraph && "bg-blue-500 text-white focus:bg-blue-500 focus:text-white"
                 )}
               >
                 Paragraph
               </DropdownMenuItem>
               <DropdownMenuSeparator />
               <DropdownMenuItem
                 onClick={() => {
                   editor.update(() => {
                     const selection = $getSelection();
                     if ($isRangeSelection(selection)) {
                       $setBlocksType(selection, () => $createHeadingNode('h1'));
                     }
                   });
                 }}
                 className={cn(
                   "font-bold text-sm",
                   isHeading.h1 && "bg-blue-500 text-white focus:bg-blue-500 focus:text-white"
                 )}
               >
                 Heading 1
               </DropdownMenuItem>
               <DropdownMenuItem
                 onClick={() => {
                   editor.update(() => {
                     const selection = $getSelection();
                     if ($isRangeSelection(selection)) {
                       $setBlocksType(selection, () => $createHeadingNode('h2'));
                     }
                   });
                 }}
                 className={cn(
                   "font-bold text-sm",
                   isHeading.h2 && "bg-blue-500 text-white focus:bg-blue-500 focus:text-white"
                 )}
               >
                 Heading 2
               </DropdownMenuItem>
               <DropdownMenuItem
                 onClick={() => {
                   editor.update(() => {
                     const selection = $getSelection();
                     if ($isRangeSelection(selection)) {
                       $setBlocksType(selection, () => $createHeadingNode('h3'));
                     }
                   });
                 }}
                 className={cn(
                   "font-bold text-sm",
                   isHeading.h3 && "bg-blue-500 text-white focus:bg-blue-500 focus:text-white"
                 )}
               >
                 Heading 3
               </DropdownMenuItem>
             </DropdownMenuContent>
           </DropdownMenu>
         </div>
          {/* List buttons */}
          <div className="flex border-r border-border pr-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => {
                    if (isBulletList) {
                      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
                    } else {
                      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
                    }
                  }}
                  className={"popup-item  " + (isBulletList ? "active" : "")}
                  aria-label="Toggle bulleted list"
                >
                  <UnorderedListIcon
                    className={cn(
                      "w-4 h-4",
                      isBulletList ? "text-white" : "text-black dark:text-white"
                    )}
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent className="mb-0.5">
                <p>Bullet List</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => {
                    if (isOrderedList) {
                      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
                    } else {
                      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
                    }
                  }}
                  className={"popup-item " + (isOrderedList ? "active" : "")}
                  aria-label="Toggle numbered list"
                >
                  <OrderedListIcon
                    className={cn(
                      "w-4 h-4",
                      isOrderedList ? "text-white" : "text-black dark:text-white"
                    )}
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent className="mb-0.5">
                <p>Numbered List</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => {
                    if (isCheckList) {
                      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
                    } else {
                      editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined);
                    }
                  }}
                  className={"popup-item " + (isCheckList ? "active" : "")}
                  aria-label="Toggle checklist"
                >
                  <CheckListIcon
                    className={cn(
                      "w-4 h-4",
                      isCheckList ? "text-white" : "text-black dark:text-white"
                    )}
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent className="mb-0.5">
                <p>Check List</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => {
                  // Insert a code block at current selection
                  editor.update(() => {
                    const selection = $getSelection();
                    if ($isRangeSelection(selection)) {
                      if (selection.isCollapsed()) {
                        $setBlocksType(selection, () => $createCodeNode());
                      } else {
                        const textContent = selection.getTextContent();
                        const codeNode = $createCodeNode();
                        selection.insertNodes([codeNode]);
                        selection.insertRawText(textContent);
                      }
                    }
                  });
                }}
                className="popup-item"
                aria-label="Insert code block"
              >
                <CodeBlockIcon
                  className={cn(
                    "w-4 h-4",
                    "text-black dark:text-white"
                  )}
                />
              </button>
            </TooltipTrigger>
            <TooltipContent className="mb-0.5">
              <p>Code Block</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => {
                  editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code");
                }}
                className={"popup-item " + (isCode ? "active" : "")}
                aria-label="Toggle inline code"
              >
                <InlineCodeIcon
                  className={cn(
                    "w-4 h-4",
                    isCode ? "text-white" : "text-black dark:text-white"
                  )}
                />
              </button>
            </TooltipTrigger>
            <TooltipContent className="mb-0.5">
              <p>Inline Code</p>
            </TooltipContent>
          </Tooltip>
          {/* <div className="flex border-r border-border pr-1">
            <button
              type="button"
              onClick={() => convertToMarkdown(editor)}
              className={"popup-item m-0.5"}
              title="Toggle Markdown view"
              aria-label="Toggle Markdown view"
            >
              <span className="w-4 h-4 inline-flex items-center justify-center font-mono text-xs">M</span>
            </button>
          </div> */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={insertLink}
                className={`popup-item ${isLink ? 'active' : ''}`}
                aria-label="Insert link">
                 <span className="text-xs mr-1">Link</span>
                <LinkIcon 
                  className={cn(
                    "w-4 h-4 -rotate-45",
                    isLink ? "text-white" : "text-black dark:text-white"
                  )} 
                />
                
              </button>
            </TooltipTrigger>
            <TooltipContent className="mb-0.5">
              <p>Link</p>
            </TooltipContent>
          </Tooltip>
        </>
      )}
      </div>
    </TooltipProvider>
  );
}

function useFloatingTextFormatToolbar(
  editor: LexicalEditor,
  anchorElem: HTMLElement,
   setIsLinkEditMode: React.Dispatch<React.SetStateAction<boolean>>,
): JSX.Element | null {
  const [isText, setIsText] = useState(false);
   const [isLink, setIsLink] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  //   const [isUppercase, setIsUppercase] = useState(false);
  //   const [isLowercase, setIsLowercase] = useState(false);
  //   const [isCapitalize, setIsCapitalize] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isSubscript, setIsSubscript] = useState(false);
  const [isSuperscript, setIsSuperscript] = useState(false);
  const [isCode, setIsCode] = useState(false);
  const [isHeading, setIsHeading] = useState({
    h1: false,
    h2: false,
    h3: false,
    h4: false,
    h5: false,
    h6: false,
  });
  const [isParagraph, setIsParagraph] = useState(false);
  const [isBulletList, setIsBulletList] = useState(false);
  const [isOrderedList, setIsOrderedList] = useState(false);
  const [isCheckList, setIsCheckList] = useState(false);

  const updatePopup = useCallback(() => {
    editor.getEditorState().read(() => {
      // Should not to pop up the floating toolbar when using IME input
      if (editor.isComposing()) {
        return;
      }
      const selection = $getSelection();
      const nativeSelection = getDOMSelection(editor._window);
      const rootElement = editor.getRootElement();

      if (
        nativeSelection !== null &&
        (!$isRangeSelection(selection) ||
          rootElement === null ||
          !rootElement.contains(nativeSelection.anchorNode))
      ) {
        setIsText(false);
        return;
      }

      if (!$isRangeSelection(selection)) {
        return;
      }

      const node = getSelectedNode(selection);

      // Update text format
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
      //   setIsUppercase(selection.hasFormat('uppercase'));
      //   setIsLowercase(selection.hasFormat('lowercase'));
      //   setIsCapitalize(selection.hasFormat('capitalize'));
      setIsStrikethrough(selection.hasFormat("strikethrough"));
      setIsSubscript(selection.hasFormat("subscript"));
      setIsSuperscript(selection.hasFormat("superscript"));
      setIsCode(selection.hasFormat("code"));

      // Update heading and paragraph state
      const headingState = {
        h1: false,
        h2: false,
        h3: false,
        h4: false,
        h5: false,
        h6: false,
      };
      
      let paragraphState = false;
      
      if ($isHeadingNode(node)) {
        const headingTag = node.getTag();
        headingState[headingTag as keyof typeof headingState] = true;
      } else if ($isParagraphNode(node)) {
        paragraphState = true;
      }
      
      setIsHeading(headingState);
      setIsParagraph(paragraphState);

      // Update links
      const parent = node.getParent();
      if ($isLinkNode(parent) || $isLinkNode(node)) {
        setIsLink(true);
      } else {
        setIsLink(false);
      }

      // Update list state
      const anchorNode = selection.anchor.getNode();
      const parentList = $getNearestNodeOfType(anchorNode, ListNode);
      if (parentList && $isListNode(parentList)) {
        const listType = parentList.getListType();
        setIsBulletList(listType === 'bullet');
        setIsOrderedList(listType === 'number');
        setIsCheckList(listType === 'check');
      } else {
        setIsBulletList(false);
        setIsOrderedList(false);
        setIsCheckList(false);
      }

      if (
        !$isCodeHighlightNode(selection.anchor.getNode()) &&
        selection.getTextContent() !== ""
      ) {
        setIsText($isTextNode(node) || $isParagraphNode(node));
      } else {
        setIsText(false);
      }

      const rawTextContent = selection.getTextContent().replace(/\n/g, "");
      if (!selection.isCollapsed() && rawTextContent === "") {
        setIsText(false);
        return;
      }
    });
  }, [editor]);

  useEffect(() => {
    document.addEventListener("selectionchange", updatePopup);
    return () => {
      document.removeEventListener("selectionchange", updatePopup);
    };
  }, [updatePopup]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(() => {
        updatePopup();
      }),
      editor.registerRootListener(() => {
        if (editor.getRootElement() === null) {
          setIsText(false);
        }
      })
    );
  }, [editor, updatePopup]);

  if (!isText) {
    return null;
  }

  return createPortal(
    <TextFormatFloatingToolbar
      editor={editor}
      anchorElem={anchorElem}
       isLink={isLink}
      isBold={isBold}
      isItalic={isItalic}
      //   isUppercase={isUppercase}
      //   isLowercase={isLowercase}
      //   isCapitalize={isCapitalize}
      isStrikethrough={isStrikethrough}
      isSubscript={isSubscript}
      isSuperscript={isSuperscript}
      isUnderline={isUnderline}
      isCode={isCode}
      isHeading={isHeading}
      isParagraph={isParagraph}
      isBulletList={isBulletList}
      isOrderedList={isOrderedList}
      isCheckList={isCheckList}
      setIsLinkEditMode={setIsLinkEditMode}
    />,
    anchorElem
  );
}

export function FloatingTextFormatToolbarPlugin({
  anchorElem = document.body,
  setIsLinkEditMode,
}: 
{
  anchorElem?: HTMLElement;
   setIsLinkEditMode: React.Dispatch<React.SetStateAction<boolean>>;
}): JSX.Element | null {
  const [editor] = useLexicalComposerContext();
  return useFloatingTextFormatToolbar(editor, anchorElem, setIsLinkEditMode);
}
