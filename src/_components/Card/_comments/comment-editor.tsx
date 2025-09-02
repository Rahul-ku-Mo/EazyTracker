import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { cn } from "@/lib/utils";

// Lexical imports
import {
  LexicalComposer,
  InitialConfigType,
} from "@lexical/react/LexicalComposer";
import { EditorState } from "lexical";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
// Lexical nodes and utilities
import { $getRoot, $createParagraphNode, $insertNodes } from "lexical";
import { LinkNode } from "@lexical/link";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { CodeNode, CodeHighlightNode } from "@lexical/code";
import { ListNode, ListItemNode } from "@lexical/list";
import { HorizontalRuleNode } from "@lexical/react/LexicalHorizontalRuleNode";
// Removed unused markdown imports
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import { MARKDOWN_TRANSFORMERS as TRANSFORMERS } from "../_editor/MARKDOWN_TRANSFORMERS.ts";

// Custom nodes
import { ImageNode } from "../_editor/ImageNode/index.tsx";
import { MentionNode } from "../_editor/MentionNode/index.tsx";

// Plugins
import { ImagesPlugin } from "../_editor/Plugins/ImagePlugin.tsx";
import { CopyImagePlugin } from "../_editor/Plugins/CopyImagePlugin.tsx";
import ComponentPickerPlugin from "../_editor/Plugins/ComponentPicketPlugin.tsx";
import { FloatingLinkEditorPlugin } from "@/_components/Notes/_editor/plugins/FloatingLinkEditorPlugin";
import { FloatingTextFormatToolbarPlugin } from "@/_components/Notes/_editor/plugins/FloatingTextFormatToolbarPlugin";
import MentionsPlugin from "../_editor/Plugins/MentionsPlugin.tsx";

import "../_editor/ImageNode/styles.css";
import "@/styles/editor.styles.css";
import { EditorRefPlugin } from "@lexical/react/LexicalEditorRefPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { theme as commentTheme } from "@/_components/shared/Editor/editor-theme.ts";
import { SendIcon } from "@/_components/shared/svg/SharedIcons.tsx";

// Plugin to handle content changes and submissions
function OnChangePlugin({
  onChange,
  onSubmit,
  onCancel,
}: {
  onChange: (content: string) => void;
  onSubmit?: () => void;
  onCancel?: () => void;
}) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        let htmlString = $generateHtmlFromNodes(editor, null);
        htmlString = htmlString.replace(/^(<p[^>]*><br><\/p>)+/, "");
        htmlString = htmlString.replace(/(<p[^>]*><br><\/p>)+$/, "");
        onChange(htmlString);
      });
    });
  }, [editor, onChange]);

  useEffect(() => {
    const removeKeyDownListener = editor.registerRootListener(
      (rootElement, prevRootElement) => {
        if (prevRootElement !== null) {
          prevRootElement.removeEventListener("keydown", onKeyDown);
        }
        if (rootElement !== null) {
          rootElement.addEventListener("keydown", onKeyDown);
        }
      }
    );

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        onSubmit?.();
      } else if (event.key === "Escape") {
        event.preventDefault();
        onCancel?.();
      }
    }

    return removeKeyDownListener;
  }, [editor, onSubmit, onCancel]);

  return null;
}

// Plugin to set initial HTML content
function InitialHTMLContentPlugin({
  initialContent,
}: {
  initialContent: string;
}) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (initialContent) {
      editor.update(() => {
        const parser = new DOMParser();
        const dom = parser.parseFromString(initialContent, "text/html");
        const nodes = $generateNodesFromDOM(editor, dom);
        const root = $getRoot();
        root.clear();
        $insertNodes(nodes);
      });
    }
  }, [editor, initialContent]);

  return null;
}

// Plugin to clear editor content
function ClearEditorPlugin({
  shouldClear,
  onClear,
}: {
  shouldClear: boolean;
  onClear: () => void;
}) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (shouldClear) {
      editor.update(() => {
        const root = $getRoot();
        root.clear();
        const paragraph = $createParagraphNode();
        root.append(paragraph);
        paragraph.select();
      });
      onClear();
    }
  }, [editor, shouldClear, onClear]);

  return null;
}

// Placeholder plugin similar to new-card-description-editor
export interface PlaceholderPluginProps {
  placeholder: string;
}

export function PlaceholderPlugin({ placeholder }: PlaceholderPluginProps) {
  const [editor] = useLexicalComposerContext();
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    return editor.registerUpdateListener(
      ({ editorState }: { editorState: EditorState }) => {
        editorState.read(() => {
          const root = $getRoot();
          const children = root.getChildren();

          // Check if the editor is truly empty
          const isEditorEmpty =
            children.length === 0 ||
            (children.length === 1 &&
              children[0].getType() === "paragraph" &&
              children[0].getTextContent().trim() === "");

          setIsEmpty(isEditorEmpty);
        });
      }
    );
  }, [editor]);

  useEffect(() => {
    const rootElement = editor.getRootElement() as HTMLElement;
    if (rootElement) {
      if (isEmpty) {
        rootElement.setAttribute("data-empty-text", placeholder);
      } else {
        rootElement.removeAttribute("data-empty-text");
      }
    }
  }, [editor, isEmpty, placeholder]);

  return null;
}

interface CommentLexicalEditorProps {
  onSubmit: (content: string) => void;
  onCancel?: () => void;
  placeholder?: string;
  initialContent?: string;
  isReply?: boolean;
  isEditing?: boolean;
  userAvatar?: string;
  userName?: string;
  autoFocus?: boolean;
  isSubmitting?: boolean;
  id?: string | number;
}

export const CommentLexicalEditor = ({
  onSubmit,
  onCancel,
  placeholder = "Write a comment...",
  initialContent = "",
  isReply = false,
  isEditing = false,
  userAvatar,
  userName,
  autoFocus = false,
  isSubmitting = false,
  id,
}: CommentLexicalEditorProps) => {
  const [content, setContent] = useState("");
  const [shouldClear, setShouldClear] = useState(false);

  const [floatingAnchorElem, setFloatingAnchorElem] =
    useState<HTMLDivElement | null>(null);
  const [isLinkEditMode, setIsLinkEditMode] = useState(false);

  const editorRef = useRef(null);

  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  };

  const initialConfig: InitialConfigType = {
    namespace: "CommentEditor",
    theme: commentTheme,
    editorState: undefined,
    onError: (error) => console.error("Lexical error:", error),
    nodes: [
      HeadingNode,
      QuoteNode,
      CodeNode,
      CodeHighlightNode,
      LinkNode,
      ListNode,
      ListItemNode,
      HorizontalRuleNode,
      ImageNode,
      MentionNode,
    ],
  };

  const handleSubmit = () => {
    const trimmedContent = content.trim();
    if (trimmedContent) {
      onSubmit(trimmedContent);
      if (!isEditing) {
        setShouldClear(true);
      }
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <>
      <div
        className={cn(
          "flex items-start gap-3 rounded-lg border border-border/40",
          "bg-background",
          "hover:border-border/60",
          isReply && "bg-transparent border-none",
          isReply && isEditing && "bg-transparent border-none"
        )}
      >
        {isReply && !isEditing && (
          <Avatar className="w-7 h-7 shrink-0 mt-0.5">
            <AvatarImage src={userAvatar} alt={userName} />
            <AvatarFallback className="text-xs">
              {userName?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        )}

        <div className="flex-1 min-w-0">
          <LexicalComposer initialConfig={initialConfig}>
            <RichTextPlugin
              contentEditable={
                <div className="min-h-[60px] max-w-full resize-y outline-0 border-0 z-0 flex">
                  <div
                    className="relative flex-auto max-w-full resize-y"
                    ref={onRef}
                  >
                    <ContentEditable
                      id={
                        isReply ? `reply-editor-${id}` : `comment-editor-${id}`
                      }
                      className={cn(
                        "h-full editor-root",
                        "focus:outline-none focus-visible:outline-none",
                        "px-3 py-2",
                        // Styles for the placeholder
                        "[&[data-empty-text]]:before:content-[attr(data-empty-text)]",
                        "[&[data-empty-text]]:before:text-muted-foreground/60",
                        "[&[data-empty-text]]:before:absolute",
                        "[&[data-empty-text]]:before:left-3",
                        "[&[data-empty-text]]:before:top-2",
                        "[&[data-empty-text]]:before:pt-2",
                        "[&[data-empty-text]]:before:pointer-events-none",

                        "[&[data-empty-text]]:before:opacity-100",
                        "[&[data-empty-text]]:before:text-sm",
                        isReply &&
                          "!p-0 !pt-0.5 [&[data-empty-text]]:before:left-0 [&[data-empty-text]]:before:top-0",
                        isReply &&
                          isEditing &&
                          "!p-0 [&[data-empty-text]]:before:left-0 [&[data-empty-text]]:before:top-0"
                      )}
                    />
                  </div>
                </div>
              }
              ErrorBoundary={LexicalErrorBoundary}
            />
            <HistoryPlugin />
            <LinkPlugin />
            <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
            <TabIndentationPlugin />
            <ListPlugin />
            <CheckListPlugin />
            <ImagesPlugin />
            <EditorRefPlugin editorRef={editorRef} />
            <CopyImagePlugin ref={editorRef} />
            <ComponentPickerPlugin />
            <MentionsPlugin />
            {autoFocus && <AutoFocusPlugin />}
            <PlaceholderPlugin placeholder={placeholder} />

            <OnChangePlugin
              onChange={setContent}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />

            {floatingAnchorElem && (
              <>
                <FloatingTextFormatToolbarPlugin
                  anchorElem={floatingAnchorElem ?? undefined}
                  setIsLinkEditMode={setIsLinkEditMode}
                />
              </>
            )}
            {
              <FloatingLinkEditorPlugin
                anchorElem={floatingAnchorElem ?? undefined}
                isLinkEditMode={isLinkEditMode}
                setIsLinkEditMode={setIsLinkEditMode}
              />
            }
            <InitialHTMLContentPlugin initialContent={initialContent} />
            <ClearEditorPlugin
              shouldClear={shouldClear}
              onClear={() => setShouldClear(false)}
            />
          </LexicalComposer>

          <div
            className={cn(
              "flex items-center justify-between mt-3 p-2 border-t border-border/30",
              isReply && "px-3 pb-2",
              isEditing && "px-3 pb-2"
            )}
          >
            <div className="flex items-center gap-1 flex-1" />

            <div className="flex items-center gap-2">
              {(isEditing || onCancel) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                  className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </Button>
              )}
              <Button
                onClick={handleSubmit}
                disabled={!content.trim() || isSubmitting}
                size="sm"
                className={cn(
                  "h-7 px-1.5 text-xs",
                  "bg-primary/90 hover:bg-primary text-primary-foreground",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {isSubmitting ? (
                  <div className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  <SendIcon className="size-3.5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {isReply && !isEditing && (
        <div className="text-xs text-muted-foreground/50 mt-2 text-right">
          ⌘ + Enter to send • Escape to cancel
        </div>
      )}
    </>
  );
};
