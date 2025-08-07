import { useEffect, useRef, useState } from "react";
import { EditorState, ParagraphNode, $getRoot } from "lexical";

import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
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
// Floating toolbar imports
import { FloatingTextFormatToolbarPlugin } from "@/_components/Notes/_editor/plugins/FloatingTextFormatToolbarPlugin";
import { FloatingLinkEditorPlugin } from "@/_components/Notes/_editor/plugins/FloatingLinkEditorPlugin";

// Image-related imports
import { ImageNode } from "./_editor/ImageNode";
import { ImagesPlugin } from "./_editor/Plugins/ImagePlugin";
import { CopyImagePlugin } from "./_editor/Plugins/CopyImagePlugin";

// Import markdown transformers
import { MARKDOWN_TRANSFORMERS } from "./_editor/MARKDOWN_TRANSFORMERS";

// Import image styles
import "./_editor/ImageNode/styles.css";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import MentionsPlugin from "./_editor/Plugins/MentionsPlugin";
import { MentionNode } from "./_editor/MentionNode";

interface EditorTheme {
  root: string;
  paragraph: string;
  text: {
    bold: string;
    italic: string;
    underline: string;
    strikethrough: string;
    underlineStrikethrough: string;
  };
  list: {
    ul: string;
    ol: string;
    checklist: string;
    listitem: string;
    listitemChecked: string;
    listitemUnchecked: string;
    nested: {
      list: string;
      listitem: string;
    };
  };
  link: string;
}
const theme: EditorTheme = {
  root: cn(
    "editor-root bg-background text-foreground relative outline-none p-0"
  ),
  paragraph: "editor-paragraph",
  text: {
    bold: "editor-text-bold",
    italic: "editor-text-italic",
    underline: "editor-text-underline",
    strikethrough: "editor-text-strikethrough",
    underlineStrikethrough: "editor-text-underline-strikethrough",
  },
  list: {
    ul: "editor-list-ul",
    ol: "editor-list-ol",
    checklist: "editor-list-checklist",
    listitem: "editor-list-item",
    listitemChecked: "editor-list-item-checked",
    listitemUnchecked: "editor-list-item-unchecked",
    nested: {
      list: "editor-nested-list",
      listitem: "editor-nested-list-item",
    },
  },
  link: "editor-link",
};

function onError(error: Error): void {
  console.error(error);
}

interface PlaceholderPluginProps {
  placeholder: string;
}

function PlaceholderPlugin({ placeholder }: PlaceholderPluginProps) {
  const [editor] = useLexicalComposerContext();
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    return editor.registerUpdateListener(
      ({ editorState }: { editorState: EditorState }) => {
        editorState.read(() => {
          const root = $getRoot();
          const children = root.getChildren();
          
          // Check if the editor is truly empty
          const isEditorEmpty = children.length === 0 || 
            (children.length === 1 && 
             children[0].getType() === 'paragraph' && 
             children[0].getTextContent().trim() === '');
          
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

interface CustomTransformLexicalToHTMLProps {
  setEditorState: (state: string) => void;
}

function CustomTransformLexicalToHTML({
  setEditorState,
}: CustomTransformLexicalToHTMLProps): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerUpdateListener(
      ({ editorState }: { editorState: EditorState }) => {
        editorState.read(() => {
          let htmlString = $generateHtmlFromNodes(editor, null);

          // Remove empty <p><br></p> elements
          htmlString = htmlString.replace(/^(<p[^>]*><br><\/p>)+/, "");
          htmlString = htmlString.replace(/(<p[^>]*><br><\/p>)+$/, "");

          setEditorState(htmlString);
        });
      }
    );
  }, [editor, setEditorState]);

  return null;
}

interface CardDescriptionEditorProps {
  description?: string;
  dimensions: "small" | "large";
  setDescription: React.Dispatch<React.SetStateAction<string>>;
}

export const NewCardDescriptionEditor = ({
  setDescription,
  dimensions,
}: CardDescriptionEditorProps): JSX.Element => {
  const editorRef = useRef(null);
  const [isLinkEditMode, setIsLinkEditMode] = useState(false);
  const anchorElemRef = useRef<HTMLDivElement>(null);

  const initialConfig = {
    namespace: "CardDescriptionEditor",
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
      MentionNode
    ] as any,
  };

  return (
    <div className="relative px-4 flex-1">
      <LexicalComposer initialConfig={initialConfig}>
        <div className="editor-container" ref={anchorElemRef}>
          <div className="relative editor-inner">
            <RichTextPlugin
              contentEditable={
                <ContentEditable
                  id="card-description-editor"
                  className={cn(
                    "min-h-[150px] w-full overflow-y-auto",
                    dimensions === "small" ? "max-h-[160px]" : "max-h-[456px]",
                    "text-base text-foreground",
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
                    "[&[data-empty-text]]:before:leading-6",
                    "[&[data-empty-text]]:before:transition-opacity",
                    "[&[data-empty-text]]:before:duration-100",
                    "[&[data-empty-text]]:before:opacity-100",
                    "[&[data-empty-text]]:before:empty:opacity-0"
                  )}
                />
              }
              ErrorBoundary={LexicalErrorBoundary}
            />
            <PlaceholderPlugin placeholder="Add more details..." />
            <HistoryPlugin />
            <ListPlugin />
            <CheckListPlugin />
            <MarkdownShortcutPlugin transformers={MARKDOWN_TRANSFORMERS} />
            <LinkPlugin />
            <ImagesPlugin />
            <MentionsPlugin />
            <EditorRefPlugin editorRef={editorRef} />
            <CopyImagePlugin ref={editorRef} />
            {anchorElemRef.current && (
              <>
                <FloatingTextFormatToolbarPlugin
                  anchorElem={anchorElemRef.current}
                  setIsLinkEditMode={setIsLinkEditMode}
                />
                <FloatingLinkEditorPlugin
                  anchorElem={anchorElemRef.current}
                  isLinkEditMode={isLinkEditMode}
                  setIsLinkEditMode={setIsLinkEditMode}
                />
              </>
            )}
            <CustomTransformLexicalToHTML setEditorState={setDescription} />
          </div>
        </div>
      </LexicalComposer>
    </div>
  );
};
