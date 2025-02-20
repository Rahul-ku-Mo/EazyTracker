/* eslint-disable @typescript-eslint/no-explicit-any */
import { useContext, useEffect, useState } from "react";
import { $getRoot, $insertNodes, EditorState, ParagraphNode } from "lexical";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import {
  LexicalComposer,
  InitialConfigType,
} from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import { useCardMutation } from "../_mutations/useCardMutations";
import { ColumnContext } from "../../../context/ColumnProvider";
import { CardToolbarPlugin } from "./CardToolbarPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { ListNode, ListItemNode } from "@lexical/list";
import "../../../styles/editor.styles.css";
import { cn } from "../../../lib/utils";
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
  placeholder: string;
}

const theme: EditorTheme = {
  root: "editor-root",
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
  placeholder: "editor-placeholder",
};

function onError(error: Error): void {
  console.error(error);
}

// Custom plugins for HTML transformation
function CustomTransformHTMLToLexical({
  description,
}: {
  description: string;
}): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!description) return;

    editor.update(() => {
      const parser = new DOMParser();
      const dom = parser.parseFromString(description, "text/html");
      const nodes = $generateNodesFromDOM(editor, dom);
      const root = $getRoot();
      root.clear();
      $insertNodes(nodes);
    });
  }, [description, editor]);

  return null;
}

function CustomTransformLexicalToHTML({
  setEditorState,
}: {
  setEditorState: (state: string) => void;
}): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerUpdateListener(
      ({ editorState }: { editorState: EditorState }) => {
        editorState.read(() => {
          let htmlString = $generateHtmlFromNodes(editor, null);
          htmlString = htmlString.replace(/^(<p[^>]*><br><\/p>)+/, "");
          htmlString = htmlString.replace(/(<p[^>]*><br><\/p>)+$/, "");
          setEditorState(htmlString);
        });
      }
    );
  }, [editor, setEditorState]);

  return null;
}

interface CardDetailsEditorProps {
  cardId: string;
  description: string;
}

export const CardDetailsEditor = ({
  cardId,
  description,
}: CardDetailsEditorProps): JSX.Element => {
  const [editorState, setEditorState] = useState<string>();
  const columnId = useContext(ColumnContext);
  const { updateCardMutation } = useCardMutation();

  const initialConfig: InitialConfigType = {
    namespace: "CardDetailsEditor",
    theme,
    onError,
    nodes: [ListNode, ListItemNode, ParagraphNode] as any,
  };

  const handleSave = (): void => {
    if (!editorState) return;

    updateCardMutation.mutate({
      cardDescription: editorState,
      cardId,
      columnId,
    });
  };

  return (
    <div className="relative h-full">
      <LexicalComposer initialConfig={initialConfig}>
        <div className="editor-container">
          <CardToolbarPlugin save={handleSave} />
          <div className="h-full editor-inner">
            <RichTextPlugin
              contentEditable={
                <ContentEditable
                  className={cn(
                    "w-full px-3 py-2 overflow-y-auto text-base",
                    "dark:text-zinc-100 focus:outline-none",
                    "min-h-[300px]",
                    "max-h-[calc(100vh-300px)]"
                  )}
                />
              }
              ErrorBoundary={LexicalErrorBoundary}
            />
            <HistoryPlugin />
            <AutoFocusPlugin />
            <CustomTransformHTMLToLexical description={description} />
            <CustomTransformLexicalToHTML setEditorState={setEditorState} />
          </div>
        </div>

        <ListPlugin />
        <CheckListPlugin />
      </LexicalComposer>
    </div>
  );
};
