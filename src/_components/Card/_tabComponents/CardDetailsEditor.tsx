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
import { ColumnContext } from "../../../Context/ColumnProvider";
import { CardToolbarPlugin } from "./CardToolbarPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { ListNode, ListItemNode } from "@lexical/list";
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
  root: "bg-background text-foreground p-2 relative text-zinc-200 tracking-wide outline-none",
  paragraph: "leading-normal",
  text: {
    bold: "font-bold",
    italic: "italic ",
    underline: "underline",
    strikethrough: "line-through",
    underlineStrikethrough: "underline line-through",
  },
  list: {
    ul: "list-disc list-inside",
    ol: "list-decimal list-inside",
    checklist: "list-none relative",
    listitem: "my-1",
    listitemChecked:
      "line-through text-muted-foreground relative px-6 mx-2 list-none outline-none before:content-[''] before:w-4 before:h-4 before:left-0 before:cursor-pointer before:block before:bg-cover before:absolute before:border-2 before:border-[#3d87f5] before:shadow-sm before:bg-[#3d87f5] after:content-[''] after:cursor-pointer after:border-color-[#fff] after:border-solid after:absolute after:block after:top-[6px] after:w-[3px] after:left-[7px] after:right-[7px] after:h-[6px] after:rotate-45 after:border-r-2 after:border-b-2 flex items-center",
    listitemUnchecked:
      "text-foreground relative px-6 mx-2 list-none outline-none before:content-[''] before:w-4 before:h-4 before:left-0 before:cursor-pointer before:block before:bg-cover before:absolute before:border-2 before:border-zinc-200 before:shadow-sm flex items-center",
    nested: {
      list: "ml-4",
      listitem: "my-1",
    },
  },
  placeholder:
    "text-muted-foreground absolute top-[12px] left-[12px] pointer-events-none",
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
    <div className="relative rounded-md">
      <LexicalComposer initialConfig={initialConfig}>
        <div className="editor-container">
          <CardToolbarPlugin />
          <div className="editor-inner">
            <RichTextPlugin
              contentEditable={
                <ContentEditable className="min-h-[150px] w-full rounded-md px-3 py-2 text-xs text-white focus:outline-none border border-zinc-800 shadow-sm" />
              }
              ErrorBoundary={LexicalErrorBoundary}
            />
            <HistoryPlugin />
            <AutoFocusPlugin />
            <CustomTransformHTMLToLexical description={description} />
            <CustomTransformLexicalToHTML setEditorState={setEditorState} />
          </div>
        </div>
        <button
          onClick={handleSave}
          className="px-2 py-1 mt-2 text-xs text-white transition-all rounded-md bg-emerald-500 hover:bg-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:ring-offset-1"
        >
          Save
        </button>
        <ListPlugin />
        <CheckListPlugin />
      </LexicalComposer>
    </div>
  );
};
