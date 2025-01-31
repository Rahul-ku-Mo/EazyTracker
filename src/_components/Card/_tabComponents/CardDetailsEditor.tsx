import { useContext, useEffect, useState } from "react";
import { $getRoot, $insertNodes, EditorState } from "lexical";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import { useCardMutation } from "../_mutations/useCardMutations";
import { ColumnContext } from "../../../Context/ColumnProvider";

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
  placeholder: string;
}

const theme: EditorTheme = {
  root: "bg-background text-foreground p-2 relative text-white outline-none",
  paragraph: "leading-normal",
  text: {
    bold: "font-bold",
    italic: "italic",
    underline: "underline",
    strikethrough: "line-through",
    underlineStrikethrough: "underline line-through",
  },
  placeholder:
    "text-muted-foreground absolute top-[12px] left-[12px] pointer-events-none",
};

function onError(error: Error): void {
  console.error(error);
}

interface CustomTransformHTMLToLexicalProps {
  description: string;
}

function CustomTransformHTMLToLexical({ description }: CustomTransformHTMLToLexicalProps): null {
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

interface CustomTransformLexicalToHTMLProps {
  setEditorState: (state: string) => void;
}

function CustomTransformLexicalToHTML({ setEditorState }: CustomTransformLexicalToHTMLProps): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }: { editorState: EditorState }) => {
      editorState.read(() => {
        let htmlString = $generateHtmlFromNodes(editor, null);

        // Remove empty <p><br></p> elements
        htmlString = htmlString.replace(/^(<p[^>]*><br><\/p>)+/, '');
        htmlString = htmlString.replace(/(<p[^>]*><br><\/p>)+$/, '');

        setEditorState(htmlString);
      });
    });
  }, [editor, setEditorState]);

  return null;
}

interface CardDetailsEditorProps {
  cardId: string;

  description: string;
}

export const CardDetailsEditor = ({ 
  cardId, 

  description 
}: CardDetailsEditorProps): JSX.Element => {
  const [editorState, setEditorState] = useState<string>();

  const initialConfig = {
    namespace: "CardDetailsEditor",
    theme,
    onError,
  };

  const columnId = useContext(ColumnContext)
  const { updateCardMutation } = useCardMutation();

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
          <div className="editor-inner">
            <RichTextPlugin
              contentEditable={
                <ContentEditable className="min-h-[150px] w-full rounded-md px-3 py-2 text-xs text-white focus:outline-none border border-zinc-600" />
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
      </LexicalComposer>
    </div>
  );
};
