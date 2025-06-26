import type { JSX } from "react";

import "./index.css";

import { $isCodeHighlightNode } from "@lexical/code";
import {$isLinkNode, TOGGLE_LINK_COMMAND} from '@lexical/link';
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
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
import { $setBlocksType } from "@lexical/selection";
import { $createHeadingNode, $isHeadingNode, HeadingTagType } from "@lexical/rich-text";
import { useCallback, useEffect, useRef, useState } from "react";

import { createPortal } from "react-dom";

import {
  getDOMRangeRect,
  getSelectedNode,
  setFloatingElemPosition,
} from "../../utils";
import {
  BoldIcon,
  CodeIcon,
  ItalicIcon,
  LinkIcon,
  StrikethroughIcon,
  SubscriptIcon,
  SuperscriptIcon,
  UnderlineIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
// import {INSERT_INLINE_COMMAND} from '../CommentPlugin';

function TextFormatFloatingToolbar({
  editor,
  anchorElem,
   isLink,
  isBold,
  isItalic,
  isUnderline,
  //   isUppercase,
  //   isLowercase,
  //   isCapitalize,
  isCode,
  isStrikethrough,
  isSubscript,
  isSuperscript,
  isHeading,
  isParagraph,
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
    return 'T';
  };

  return (
    <div ref={popupCharStylesEditorRef} className="floating-text-format-popup dark:bg-zinc-800 bg-white border border-border rounded-md h-fit">
      {editor !== null && (
        <>
          <button
            type="button"
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
            }}
            className={"popup-item spaced " + (isBold ? "active" : "")}
            title="Format text as bold"
            aria-label="Format text as bold"
          >
            <BoldIcon
              className={cn(
                "w-4 h-4",
                isBold ? "text-white" : "text-black dark:text-white"
              )}
            />
          </button>
          <button
            type="button"
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
            }}
            className={"popup-item spaced " + (isItalic ? "active" : "")}
            title="Format text as italics"
            aria-label="Format text as italics"
          >
            <ItalicIcon
              className={cn(
                "w-4 h-4",
                isItalic ? "text-white" : "text-black dark:text-white"
              )}
            />
          </button>
          <button
            type="button"
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
            }}
            className={"popup-item spaced " + (isUnderline ? "active" : "")}
            title="Format text to underlined"
            aria-label="Format text to underlined"
          >
            <UnderlineIcon
              className={cn(
                "w-4 h-4",
                isUnderline ? "text-white" : "text-black dark:text-white"
              )}
            />
          </button>
          <button
            type="button"
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough");
            }}
            className={"popup-item spaced " + (isStrikethrough ? "active" : "")}
            title="Format text with a strikethrough"
            aria-label="Format text with a strikethrough"
          >
            <StrikethroughIcon
              className={cn(
                "w-4 h-4",
                isStrikethrough ? "text-white" : "text-black dark:text-white"
              )}
            />
          </button>
          <button
            type="button"
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, "subscript");
            }}
            className={"popup-item spaced " + (isSubscript ? "active" : "")}
            title="Format Subscript"
            aria-label="Format Subscript"
          >
            <SubscriptIcon
              className={cn(
                "w-4 h-4",
                isSubscript ? "text-white" : "text-black dark:text-white"
              )}
            />
          </button>
          <button
            type="button"
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, "superscript");
            }}
            className={"popup-item spaced " + (isSuperscript ? "active" : "")}
            title="Format Superscript"
            aria-label="Format Superscript"
          >
            <SuperscriptIcon
              className={cn(
                "w-4 h-4",
                isSuperscript ? "text-white" : "text-black dark:text-white"
              )}
            />
          </button>
         <div className="flex border-r border-zinc-200 dark:border-zinc-800 pr-1">
          {/* Text Style Dropdown */}
          <div className="relative group">
            <button
              type="button"
              className={`popup-item m-0.5 text-xs font-medium px-2 py-1 flex items-center gap-1 ${
                Object.values(isHeading).some(Boolean) || isParagraph ? 'active' : ''
              }`}
              title="Text style options"
              aria-label="Text style options"
            >
              {getCurrentTextStyle()}
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* Dropdown Menu */}
            <div className="absolute top-full left-0 mt-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 min-w-[160px]">
              {/* Paragraph Option */}
              <button
                type="button"
                onClick={() => {
                  editor.update(() => {
                    const selection = $getSelection();
                    if ($isRangeSelection(selection)) {
                      $setBlocksType(selection, () => $createParagraphNode());
                    }
                  });
                }}
                className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center justify-between hover:bg-zinc-100 dark:hover:bg-zinc-700 ${
                  isParagraph
                    ? "bg-blue-500 text-white hover:bg-blue-600"
                    : "text-zinc-700 dark:text-zinc-300"
                }`}
                title="Paragraph"
                aria-label="Format as paragraph"
              >
                <span className="flex items-center gap-2">
                  <span style={{ fontSize: '14px', fontWeight: 'normal' }}>P</span>
                  Paragraph
                </span>
                {isParagraph && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              
              {/* Separator */}
              <div className="border-t border-zinc-200 dark:border-zinc-700 my-1"></div>
              
              {/* Heading Options in Flex Layout */}
              <div className="p-2">
                <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-2 px-1">Headings</div>
                <div className="grid grid-cols-3 gap-1">
                  {['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].map((headingType) => {
                    const isActive = isHeading[headingType as keyof typeof isHeading];
                    const headingNum = headingType.charAt(1);
                    return (
                      <button
                        key={headingType}
                        type="button"
                        onClick={() => {
                          editor.update(() => {
                            const selection = $getSelection();
                            if ($isRangeSelection(selection)) {
                              $setBlocksType(selection, () => $createHeadingNode(headingType as HeadingTagType));
                            }
                          });
                        }}
                        className={`px-2 py-1.5 text-xs font-bold rounded transition-colors ${
                          isActive
                            ? "bg-blue-500 text-white"
                            : "bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600"
                        }`}
                        title={`Heading ${headingNum}`}
                        aria-label={`Format text as heading ${headingNum}`}
                      >
                        H{headingNum}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
         </div>
          <button
            type="button"
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code");
            }}
            className={"popup-item m-0.5 " + (isCode ? "active" : "")}
            title="Insert code block"
            aria-label="Insert code block"
          >
            <CodeIcon
              className={cn(
                "w-4 h-4",
                isCode ? "text-white" : "text-black dark:text-white"
              )}
            />
          </button>
          <button
            type="button"
            onClick={insertLink}
            className={`popup-item m-0.5 ${isLink ? 'active' : ''}`}
            title="Insert link"
            aria-label="Insert link">
            <LinkIcon 
              className={cn(
                "w-4 h-4",
                isLink ? "text-white" : "text-black dark:text-white"
              )} 
            />
          </button>
        </>
      )}
    </div>
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

      // Update links - COMMENTED OUT
      const parent = node.getParent();
      if ($isLinkNode(parent) || $isLinkNode(node)) {
        setIsLink(true);
      } else {
        setIsLink(false);
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
