import { useEffect, useRef, useState } from "react";
import { EditorState, ParagraphNode } from "lexical";

import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLexicalIsTextContentEmpty } from "@lexical/react/useLexicalIsTextContentEmpty";
import { $generateHtmlFromNodes } from "@lexical/html";
import { cn } from "../../lib/utils";
import { ListItemNode, ListNode } from "@lexical/list";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { EditorRefPlugin } from "@lexical/react/LexicalEditorRefPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { LinkNode } from "@lexical/link";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { HorizontalRuleNode } from "@lexical/react/LexicalHorizontalRuleNode";
import { CodeNode, CodeHighlightNode } from "@lexical/code";
import { FloatingLinkEditorPlugin } from "@/_components/Notes/_editor/plugins/FloatingLinkEditorPlugin";
import { theme } from "../shared/Editor/editor-theme";
import { ImageNode } from "../Card/_editor/ImageNode";
import { MARKDOWN_TRANSFORMERS } from "../Card/_editor/MARKDOWN_TRANSFORMERS";
import "@/styles/editor.styles.css";
import ComponentPickerMenuPlugin from "../Card/_editor/Plugins/ComponentPicketPlugin";
import { FloatingTextFormatToolbarPlugin } from "../Notes/_editor/plugins/FloatingTextFormatToolbarPlugin";

interface ProjectDescriptionEditorProps {
  setDescription: (description: string) => void;
  description: string;
  dimensions: "small" | "large";
}

function onError(error: Error) {
  console.error("Lexical editor error:", error);
}

function PlaceholderPlugin({ placeholder }: { placeholder: string }) {
  const [editor] = useLexicalComposerContext();
  const isEmpty = useLexicalIsTextContentEmpty(editor);

  return (
    <div
      className={cn(
        "absolute left-[1px] top-[1px] pointer-events-none select-none text-muted-foreground/60 text-base",
        !isEmpty && "hidden"
      )}
    >
      {placeholder}
    </div>
  );
}

// OnChangePlugin removed - using TransformToHTMLPlugin instead

// HTML transformation plugin
function TransformToHTMLPlugin({
  setDescription,
}: {
  setDescription: (description: string) => void;
}) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const unregister = editor.registerUpdateListener(
      ({ editorState }: { editorState: EditorState }) => {
        editorState.read(() => {
          try {
            let htmlString = $generateHtmlFromNodes(editor, null);
            htmlString = htmlString.replace(/^(<p[^>]*><br><\/p>)+/, "");
            htmlString = htmlString.replace(/(<p[^>]*><br><\/p>)+$/, "");
            setDescription(htmlString);
          } catch (error) {
            console.error("Error generating HTML:", error);
            setDescription("");
          }
        });
      }
    );

    return unregister;
  }, [editor, setDescription]);

  return null;
}

export const NewProjectDescriptionEditor = ({
  setDescription,
  dimensions,
}: ProjectDescriptionEditorProps): JSX.Element => {
  const editorRef = useRef(null);
  const anchorElemRef = useRef<HTMLDivElement>(null);
  const [isLinkEditMode, setIsLinkEditMode] = useState(false);

  const initialConfig = {
    namespace: "ProjectDescriptionEditor",
    theme,
    onError,
    nodes: [
      ListNode,
      ListItemNode,
      ParagraphNode,
      HorizontalRuleNode,
      CodeNode,
      CodeHighlightNode,
      LinkNode,
      HeadingNode,
      QuoteNode,
      ImageNode,
    ] as any,
  };

  return (
    <div className="relative px-4 flex-1 overflow-y-auto">
      <LexicalComposer initialConfig={initialConfig}>
        <div ref={anchorElemRef} className="h-full">
          <div className="relative">
            <RichTextPlugin
              contentEditable={
                <div
                  className={cn(
                    "",
                    dimensions === "small" ? "max-h-[350px]" : "max-h-[650px]",
                  )}
                >
                  <ContentEditable
                    id="project-description-editor"
                    className={cn(
                      "w-full",
                      "text-foreground",
                      "focus:outline-none border-none",
                      "relative",
                      "px-0 py-0 !p-0",
                      // Styles for the placeholder
                      "[&[data-empty-text]]:before:content-[attr(data-empty-text)]",
                      "[&[data-empty-text]]:before:text-muted-foreground/60",
                      "[&[data-empty-text]]:before:absolute",
                      "[&[data-empty-text]]:before:left-[1px]",
                      "[&[data-empty-text]]:before:top-[1px]",
                      "[&[data-empty-text]]:before:pointer-events-none",
                      "[&[data-empty-text]]:before:text-sm",
                      "[&[data-empty-text]]:before:transition-opacity",
                      "[&[data-empty-text]]:before:duration-100",
                      "[&[data-empty-text]]:before:opacity-100",
                      "[&[data-empty-text]]:before:empty:opacity-0"
                    )}
                  />
                </div>
              }
              ErrorBoundary={LexicalErrorBoundary}
            />
            <PlaceholderPlugin placeholder="Add project description..." />
            <TransformToHTMLPlugin setDescription={setDescription} />
            <HistoryPlugin />
            <ListPlugin />
            <CheckListPlugin />
            <MarkdownShortcutPlugin transformers={MARKDOWN_TRANSFORMERS} />
            <LinkPlugin />

            {anchorElemRef.current && (
              <FloatingTextFormatToolbarPlugin
                anchorElem={anchorElemRef.current}
                setIsLinkEditMode={setIsLinkEditMode}
              />
            )}
            <ComponentPickerMenuPlugin />
            {anchorElemRef.current && (
              <FloatingLinkEditorPlugin
                anchorElem={anchorElemRef.current}
                isLinkEditMode={isLinkEditMode}
                setIsLinkEditMode={setIsLinkEditMode}
              />
            )}
            <ComponentPickerMenuPlugin />
            <EditorRefPlugin editorRef={editorRef} />
          </div>
        </div>
      </LexicalComposer>
    </div>
  );
};
