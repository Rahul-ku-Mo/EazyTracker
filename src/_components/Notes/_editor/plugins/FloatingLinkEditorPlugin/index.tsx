import type { JSX } from "react";

import "./index.css";

import {
  $createLinkNode,
  $isAutoLinkNode,
  $isLinkNode,
  TOGGLE_LINK_COMMAND,
} from "@lexical/link";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $findMatchingParent, mergeRegister } from "@lexical/utils";
import {
  $getSelection,
  $isLineBreakNode,
  $isNodeSelection,
  $isRangeSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_LOW,
  getDOMSelection,
  $getNearestNodeFromDOMNode,
  KEY_ESCAPE_COMMAND,
  LexicalEditor,
  SELECTION_CHANGE_COMMAND,
  $setSelection,
} from "lexical";
import { Dispatch, useCallback, useEffect, useRef, useState } from "react";
import * as React from "react";
import { createPortal } from "react-dom";

import { getSelectedNode } from "../../utils";
import { sanitizeUrl } from "../../utils/url";
import { setFloatingElemPositionForLinkEditor } from "../../utils/setFloatingElemPositionForLinkEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  EarthIcon,
  DeleteIcon,
  OpenIcon,
} from "@/_components/shared/svg/SharedIcons";
import { LinkIcon } from "@/_components/shared/svg/FormattingIcons";

function preventDefault(
  event: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent<HTMLElement>
): void {
  event.preventDefault();
}

function FloatingLinkEditor({
  editor,
  isLink,
  setIsLink,
  anchorElem,
  isLinkEditMode,
  setIsLinkEditMode,
  hoveredAnchor,
  hoveredLinkUrl,
  setHoveredAnchor,
  setIsHoveringLink,
  setHoveredLinkUrl,
}: {
  editor: LexicalEditor;
  isLink: boolean;
  setIsLink: Dispatch<boolean>;
  anchorElem: HTMLElement;
  isLinkEditMode: boolean;
  setIsLinkEditMode: Dispatch<boolean>;
  hoveredAnchor?: HTMLAnchorElement | null;
  hoveredLinkUrl?: string | null;
  setHoveredAnchor: Dispatch<HTMLAnchorElement | null>;
  setIsHoveringLink: Dispatch<boolean>;
  setHoveredLinkUrl: Dispatch<string | null>;
}): JSX.Element {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [editedLinkUrl, setEditedLinkUrl] = useState("https://");
  // No need to cache selection when editing via hover; rely on hover or current selection

  const $updateLinkEditor = useCallback(() => {
    const selection = $getSelection();

    let currenturl = "";
    const hasHoverTarget = Boolean(hoveredAnchor && hoveredLinkUrl);
    if (hasHoverTarget) {
      currenturl = hoveredLinkUrl || "";
      setLinkUrl(currenturl);
    } else if ($isRangeSelection(selection)) {
      const node = getSelectedNode(selection);
      const linkParent = $findMatchingParent(node, $isLinkNode);

      if (linkParent) {
        currenturl = linkParent.getURL();
      } else if ($isLinkNode(node)) {
        currenturl = node.getURL();
      } else {
        currenturl = "";
      }

      setLinkUrl(currenturl);
      if (isLinkEditMode) {
        setEditedLinkUrl(currenturl);
      }
    } else if ($isNodeSelection(selection)) {
      const nodes = selection.getNodes();
      if (nodes.length > 0) {
        const node = nodes[0];
        const parent = node.getParent();
        if ($isLinkNode(parent)) {
          currenturl = parent.getURL();
        } else if ($isLinkNode(node)) {
          currenturl = node.getURL();
        } else {
          currenturl = "";
        }

        setLinkUrl(currenturl);
        if (isLinkEditMode) {
          setEditedLinkUrl(currenturl);
        }
      }
    }

    const editorElem = editorRef.current;
    const nativeSelection = getDOMSelection(editor._window);
    const activeElement = document.activeElement;

    if (editorElem === null) {
      return;
    }

    const rootElement = editor.getRootElement();

    if (
      (selection !== null || hasHoverTarget) &&
      rootElement !== null &&
      editor.isEditable()
    ) {
      let domRect: DOMRect | undefined;

      if (hasHoverTarget && hoveredAnchor) {
        domRect = hoveredAnchor.getBoundingClientRect();
      } else if ($isNodeSelection(selection)) {
        const nodes = selection.getNodes();
        if (nodes.length > 0) {
          const element = editor.getElementByKey(nodes[0].getKey());
          if (element) {
            domRect = element.getBoundingClientRect();
          }
        }
      } else if (
        nativeSelection !== null &&
        rootElement.contains(nativeSelection.anchorNode)
      ) {
        domRect =
          nativeSelection.focusNode?.parentElement?.getBoundingClientRect();
      }

      if (domRect) {
        domRect.y += 40;
        setFloatingElemPositionForLinkEditor(domRect, editorElem, anchorElem);
      }
      // selection is used only for positioning; we no longer cache it for submission
    } else if (
      (!activeElement || activeElement.className !== "link-input") &&
      !isLinkEditMode
    ) {
      if (rootElement !== null) {
        setFloatingElemPositionForLinkEditor(null, editorElem, anchorElem);
      }
      setIsLinkEditMode(false);
      setLinkUrl("");
    }

    return true;
  }, [
    anchorElem,
    editor,
    setIsLinkEditMode,
    isLinkEditMode,
    hoveredAnchor,
    hoveredLinkUrl,
  ]);

  useEffect(() => {
    const scrollerElem = anchorElem.parentElement;

    const update = () => {
      editor.getEditorState().read(() => {
        $updateLinkEditor();
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
  }, [anchorElem.parentElement, editor, $updateLinkEditor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateLinkEditor();
        });
      }),

      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          $updateLinkEditor();
          return true;
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        KEY_ESCAPE_COMMAND,
        () => {
          if (isLink) {
            setIsLink(false);
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_HIGH
      )
    );
  }, [editor, $updateLinkEditor, setIsLink, isLink]);

  useEffect(() => {
    editor.getEditorState().read(() => {
      $updateLinkEditor();
    });
  }, [editor, $updateLinkEditor]);

  useEffect(() => {
    if (isLinkEditMode && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLinkEditMode, isLink]);

  const monitorInputInteraction = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter" || event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      setIsLinkEditMode(false);

      if (inputRef.current) {
        inputRef.current.blur();
      }

    }
  };

  const handleLinkSubmission = () => {
    if (editedLinkUrl === "" || editedLinkUrl === "https://") {
      setIsLinkEditMode(false);
      return;
    }

    const sanitized = sanitizeUrl(editedLinkUrl);

    // 1) If editing via hover, update that link directly (no selection restore)
    if (hoveredAnchor) {
      editor.update(() => {
        const maybeNode = $getNearestNodeFromDOMNode(hoveredAnchor);
        if (!maybeNode) return;

        const linkNode = $isLinkNode(maybeNode)
          ? maybeNode
          : $isLinkNode(maybeNode.getParent())
            ? (maybeNode.getParent() as any)
            : null;

        if (linkNode) {
          if ($isAutoLinkNode(linkNode)) {
            const newNode = $createLinkNode(sanitized, {
              rel: (linkNode as any).__rel,
              target: (linkNode as any).__target,
              title: (linkNode as any).__title,
            });
            (linkNode as any).replace(newNode, true);
          } else {
            (linkNode as any).setURL(sanitized);
          }
        }
      });

      setEditedLinkUrl("https://");
      setIsLinkEditMode(false);
      setIsHoveringLink(false);
      setHoveredAnchor(null);
      setHoveredLinkUrl(null);
      return;
    }

    // 2) Otherwise rely on current selection (if any) to toggle/update the link
    // Defer until after blur so selection isn't in a frozen/read-only state
    window.setTimeout(() => {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, sanitized);
    }, 0);
    setEditedLinkUrl("https://");
    setIsLinkEditMode(false);
  };

  const handleRemoveLink = () => {
    // Remove the link at current selection (if any)
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    // Clear selection so the floating UI hides via normal logic
    editor.update(() => {
      $setSelection(null);
    });
    // Exit edit mode and clear hover refs
    setIsLinkEditMode(false);
    setIsHoveringLink(false);
    setHoveredAnchor(null);
    setHoveredLinkUrl(null);
  };

  return (
    <div ref={editorRef} className="link-editor">
      {!isLink ? null : isLinkEditMode ? (
        <div className="bg-popover text-popover-foreground border border-border rounded-sm shadow-sm px-2 py-0.5 flex items-center gap-2 min-w-[320px] h-9">
          <EarthIcon className="size-4" />
          <div className="flex-1">
            <label htmlFor="link-input" className="sr-only">
              URL
            </label>
            <Input
              id="link-input"
              ref={inputRef}
              value={editedLinkUrl}
              placeholder="Enter URL"
              className="link-input h-6 text-xs bg-transparent shadow-none border-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0 placeholder:text-xs"
              onBlur={() => {
                handleLinkSubmission();
              }}
              onChange={(event) => setEditedLinkUrl(event.target.value)}
              onKeyDown={(event) => monitorInputInteraction(event)}
            />
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="p-0.5 text-xs h-6 rounded-[2px] w-fit"
              onMouseDown={preventDefault}
              onClick={handleRemoveLink}
              title="Remove link"
            >
              <DeleteIcon className="size-3" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-popover text-popover-foreground border border-border rounded-sm shadow-sm py-0.5 px-2 h-9 flex items-center gap-2 min-w-[260px]">
          <div
            className="flex-1 text-xs text-muted-foreground hover:underline truncate inline-flex items-center gap-1"
            title={linkUrl}
            onClick={() => {
              setEditedLinkUrl(linkUrl);
              setIsLinkEditMode(true);
            }}
          >
            <LinkIcon className="size-3 shrink-0 opacity-70 -rotate-45" />
            <span className="truncate">{linkUrl}</span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="p-0.5 text-xs h-6 rounded-[2px]"
              onClick={() => {
                setEditedLinkUrl(linkUrl);
                setIsLinkEditMode(true);
              }}
              title="Edit link"
            >
              Edit
            </Button>
            <OpenIcon
              className="size-4"
              onClick={() => window.open(sanitizeUrl(linkUrl), "_blank")}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function useFloatingLinkEditorToolbar(
  editor: LexicalEditor,
  anchorElem: HTMLElement,
  isLinkEditMode: boolean,
  setIsLinkEditMode: Dispatch<boolean>
): JSX.Element | null {
  const [activeEditor, setActiveEditor] = useState(editor);
  const [isLink, setIsLink] = useState(false);
  const [hoveredAnchor, setHoveredAnchor] = useState<HTMLAnchorElement | null>(
    null
  );
  const [hoveredLinkUrl, setHoveredLinkUrl] = useState<string | null>(null);
  const [isHoveringLink, setIsHoveringLink] = useState(false);
  const hoverTimerRef = useRef<number | null>(null);
  const pendingAnchorRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    function $updateToolbar() {
      const selection = $getSelection();
      // Keep toolbar visible during edit mode regardless of hover/selection
      if (isLinkEditMode) {
        setIsLink(true);
        return;
      }
      if (isHoveringLink) {
        setIsLink(true);
        return;
      }
      if ($isRangeSelection(selection)) {
        const focusNode = getSelectedNode(selection);
        const focusLinkNode = $findMatchingParent(focusNode, $isLinkNode);
        const focusAutoLinkNode = $findMatchingParent(
          focusNode,
          $isAutoLinkNode
        );
        if (!(focusLinkNode || focusAutoLinkNode)) {
          setIsLink(false);
          return;
        }
        const badNode = selection
          .getNodes()
          .filter((node) => !$isLineBreakNode(node))
          .find((node) => {
            const linkNode = $findMatchingParent(node, $isLinkNode);
            const autoLinkNode = $findMatchingParent(node, $isAutoLinkNode);
            return (
              (focusLinkNode && !focusLinkNode.is(linkNode)) ||
              (linkNode && !linkNode.is(focusLinkNode)) ||
              (focusAutoLinkNode && !focusAutoLinkNode.is(autoLinkNode)) ||
              (autoLinkNode &&
                (!autoLinkNode.is(focusAutoLinkNode) ||
                  autoLinkNode.getIsUnlinked()))
            );
          });
        if (!badNode) {
          setIsLink(true);
        } else {
          setIsLink(false);
        }
      } else if ($isNodeSelection(selection)) {
        const nodes = selection.getNodes();
        if (nodes.length === 0) {
          setIsLink(false);
          return;
        }
        const node = nodes[0];
        const parent = node.getParent();
        if ($isLinkNode(parent) || $isLinkNode(node)) {
          setIsLink(true);
        } else {
          setIsLink(false);
        }
      }
    }

    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_payload, newEditor) => {
          $updateToolbar();
          setActiveEditor(newEditor);
          return false;
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        CLICK_COMMAND,
        (payload) => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            const node = getSelectedNode(selection);
            const linkNode = $findMatchingParent(node, $isLinkNode);
            if ($isLinkNode(linkNode) && (payload.metaKey || payload.ctrlKey)) {
              window.open(linkNode.getURL(), "_blank");
              return true;
            }
          }
          return false;
        },
        COMMAND_PRIORITY_LOW
      )
    );
  }, [editor, isHoveringLink, isLinkEditMode]);

  useEffect(() => {
    const root = editor.getRootElement();
    if (!root) return;

    const handleMouseEnter = (e: MouseEvent) => {
      const target = e.target as Element | null;
      const anchor = target?.closest?.("a") as HTMLAnchorElement | null;
      if (!anchor || !root.contains(anchor)) return;

      // Start 300ms timer to show panel; cancel any previous
      if (hoverTimerRef.current !== null) {
        window.clearTimeout(hoverTimerRef.current);
      }
      pendingAnchorRef.current = anchor;
      hoverTimerRef.current = window.setTimeout(() => {
        if (pendingAnchorRef.current === anchor && !isLinkEditMode) {
          setIsHoveringLink(true);
          setIsLink(true);
          setHoveredAnchor(anchor);
          setHoveredLinkUrl(anchor.getAttribute("href"));
        }
      }, 300);
    };

    const handleMouseLeave = (e: MouseEvent) => {
      // While editing, do not clear hover/panel state
      if (isLinkEditMode) return;
      const target = e.target as Element | null;
      const anchor = target?.closest?.("a") as HTMLAnchorElement | null;
      const relatedTarget = e.relatedTarget as Element | null;
      const floatingEl = anchorElem.querySelector(
        ".link-editor"
      ) as HTMLElement | null;

      // If leaving a link element
      if (anchor && root.contains(anchor)) {
        // Cancel pending timer if any
        if (hoverTimerRef.current !== null) {
          window.clearTimeout(hoverTimerRef.current);
          hoverTimerRef.current = null;
        }
        if (pendingAnchorRef.current === anchor) {
          pendingAnchorRef.current = null;
        }
        // Check if we're moving to the floating panel
        const movingToFloatingPanel =
          floatingEl && relatedTarget && floatingEl.contains(relatedTarget);
        // Check if we're moving to another part of the same link
        const movingWithinSameLink = relatedTarget?.closest?.("a") === anchor;

        if (!movingToFloatingPanel && !movingWithinSameLink) {
          setIsHoveringLink(false);
          setHoveredAnchor(null);
          setHoveredLinkUrl(null);

          // Re-evaluate link state based on current selection
          editor.getEditorState().read(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              const focusNode = getSelectedNode(selection);
              const focusLinkNode = $findMatchingParent(focusNode, $isLinkNode);
              const focusAutoLinkNode = $findMatchingParent(
                focusNode,
                $isAutoLinkNode
              );
              setIsLink(Boolean(focusLinkNode || focusAutoLinkNode));
            } else if ($isNodeSelection(selection)) {
              const nodes = selection.getNodes();
              if (nodes.length === 0) {
                setIsLink(false);
              } else {
                const node = nodes[0];
                const parent = node.getParent();
                setIsLink(Boolean($isLinkNode(parent) || $isLinkNode(node)));
              }
            } else {
              setIsLink(false);
            }
          });
        }
      }
    };

    // Handle leaving the floating panel
    const handleFloatingPanelLeave = (e: MouseEvent) => {
      // While editing, keep panel visible until blur
      if (isLinkEditMode) return;
      const relatedTarget = e.relatedTarget as Element | null;
      const anchor = relatedTarget?.closest?.("a") as HTMLAnchorElement | null;

      // If not moving back to the original hovered anchor, clear hover state
      if (!anchor || anchor !== hoveredAnchor) {
        // Cancel pending timer if any
        if (hoverTimerRef.current !== null) {
          window.clearTimeout(hoverTimerRef.current);
          hoverTimerRef.current = null;
        }
        pendingAnchorRef.current = null;
        setIsHoveringLink(false);
        setHoveredAnchor(null);
        setHoveredLinkUrl(null);

        editor.getEditorState().read(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            const focusNode = getSelectedNode(selection);
            const focusLinkNode = $findMatchingParent(focusNode, $isLinkNode);
            const focusAutoLinkNode = $findMatchingParent(
              focusNode,
              $isAutoLinkNode
            );
            setIsLink(Boolean(focusLinkNode || focusAutoLinkNode));
          } else if ($isNodeSelection(selection)) {
            const nodes = selection.getNodes();
            if (nodes.length === 0) {
              setIsLink(false);
            } else {
              const node = nodes[0];
              const parent = node.getParent();
              setIsLink(Boolean($isLinkNode(parent) || $isLinkNode(node)));
            }
          } else {
            setIsLink(false);
          }
        });
      }
    };

    root.addEventListener("mouseenter", handleMouseEnter, true);
    root.addEventListener("mouseleave", handleMouseLeave, true);

    // Add listener to floating panel when it exists
    const observer = new MutationObserver(() => {
      const floatingEl = anchorElem.querySelector(
        ".link-editor"
      ) as HTMLElement | null;
      if (floatingEl) {
        floatingEl.addEventListener("mouseleave", handleFloatingPanelLeave);
      }
    });

    observer.observe(anchorElem, { childList: true, subtree: true });

    return () => {
      root.removeEventListener("mouseenter", handleMouseEnter, true);
      root.removeEventListener("mouseleave", handleMouseLeave, true);

      const floatingEl = anchorElem.querySelector(
        ".link-editor"
      ) as HTMLElement | null;
      if (floatingEl) {
        floatingEl.removeEventListener("mouseleave", handleFloatingPanelLeave);
      }

      if (hoverTimerRef.current !== null) {
        window.clearTimeout(hoverTimerRef.current);
        hoverTimerRef.current = null;
      }
      pendingAnchorRef.current = null;
      observer.disconnect();
    };
  }, [editor, anchorElem, isHoveringLink, hoveredAnchor, isLinkEditMode]);

  return createPortal(
    <FloatingLinkEditor
      editor={activeEditor}
      isLink={isLink}
      anchorElem={anchorElem}
      setIsLink={setIsLink}
      isLinkEditMode={isLinkEditMode}
      setIsLinkEditMode={setIsLinkEditMode}
      hoveredAnchor={hoveredAnchor}
      hoveredLinkUrl={hoveredLinkUrl}
      setHoveredAnchor={setHoveredAnchor}
      setIsHoveringLink={setIsHoveringLink}
      setHoveredLinkUrl={setHoveredLinkUrl}
    />,
    anchorElem
  );
}

export function FloatingLinkEditorPlugin({
  anchorElem = document.body,
  isLinkEditMode,
  setIsLinkEditMode,
}: {
  anchorElem?: HTMLElement;
  isLinkEditMode: boolean;
  setIsLinkEditMode: Dispatch<boolean>;
}): JSX.Element | null {
  const [editor] = useLexicalComposerContext();
  return useFloatingLinkEditorToolbar(
    editor,
    anchorElem,
    isLinkEditMode,
    setIsLinkEditMode
  );
}
