 
import { useEffect } from "react";
import { EditorState } from "lexical";

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
}
const theme: EditorTheme = {
  root: cn(
    "editor-root bg-background text-foreground relative outline-none p-0",
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
};

function onError(error: Error): void {
  console.error(error);
}

interface PlaceholderPluginProps {
  placeholder: string;
}

function PlaceholderPlugin({ placeholder }: PlaceholderPluginProps) {
  const [editor] = useLexicalComposerContext();
  const isEmpty = useLexicalIsTextContentEmpty(editor);

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
  setDescription: React.Dispatch<React.SetStateAction<string>>;
}

export const NewCardDescriptionEditor = ({
  setDescription,
}: CardDescriptionEditorProps): JSX.Element => {
  const initialConfig = {
    namespace: "CardDescriptionEditor",
    theme,
    onError,
    nodes: [ListNode, ListItemNode] as any,
  };

  return (
    <div className="relative">
      <LexicalComposer initialConfig={initialConfig}>
        <div className="editor-container">
          <div className="relative editor-inner">
            <RichTextPlugin
              contentEditable={
                <ContentEditable
                  id="card-description-editor"
                  className={cn(
                    "min-h-[150px] w-full",
                    "text-sm text-foreground",
                    "focus:outline-none border-none",
                    "relative",
                    "px-0 py-0",
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
              }
              ErrorBoundary={LexicalErrorBoundary}
            />
            <PlaceholderPlugin placeholder="Fill more details..." />
            <HistoryPlugin />
            <ListPlugin />
            <CheckListPlugin />
            <CustomTransformLexicalToHTML setEditorState={setDescription} />
          </div>
        </div>
      </LexicalComposer>
    </div>
  );
};
