/* eslint-disable @typescript-eslint/no-explicit-any */
import { useContext, useEffect, useState, useRef } from "react";

import { ParagraphNode } from "lexical";
/**Plugins Lexical */
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
import {
  CustomTransformHTMLToLexical,
  CustomTransformLexicalToHTML,
} from "./Plugins/CustomTransformations";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { $convertFromMarkdownString } from "@lexical/markdown";
import { PLAYGROUND_TRANSFORMERS as TRANSFORMERS } from "./MARKDOWN_TRANSFORMERS.ts";
import { EditorRefPlugin } from "@lexical/react/LexicalEditorRefPlugin";
import { CopyImagePlugin } from "./Plugins/CopyImagePlugin";
/**Lexical Nodes */
import { CodeNode, CodeHighlightNode } from "@lexical/code";
import { LinkNode } from "@lexical/link";
import { ListNode, ListItemNode } from "@lexical/list";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { HorizontalRuleNode } from "@lexical/react/LexicalHorizontalRuleNode";
import { registerCodeHighlighting } from "@lexical/code";

import { useCardMutation } from "../_mutations/useCardMutations.ts";
import { ColumnContext } from "../../../context/ColumnProvider.tsx";
import { CardToolbarPlugin } from "./Plugins/CardToolbarPlugin.tsx";

import { ImageNode } from "./ImageNode";
import { ImagesPlugin } from "./Plugins/ImagePlugin.tsx";

import "./ImageNode/styles.css";
import "../../../styles/editor.styles.css";
import { cn } from "../../../lib/utils.ts";

interface EditorTheme {
  root: string;
  paragraph: string;
  code?: string;
  codeHighlight?: Record<string, string>;
  text: {
    bold: string;
    italic: string;
    underline: string;
    strikethrough: string;
    underlineStrikethrough: string;
  };
  heading: {
    h1: string;
    h2: string;
    h3: string;
    h4: string;
    h5: string;
    h6: string;
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
  paragraph: "editor-paragraph text-sm",
  text: {
    bold: "editor-text-bold",
    italic: "editor-text-italic",
    underline: "editor-text-underline",
    strikethrough: "editor-text-strikethrough",
    underlineStrikethrough: "editor-text-underline-strikethrough",
  },
  code: "editor-Theme__code dark:bg-zinc-900/80 bg-zinc-200",
  codeHighlight: {
    atrule: "editor-Theme__tokenAttr",
    attr: "editor-Theme__tokenAttr",
    boolean: "editor-Theme__tokenProperty",
    builtin: "editor-Theme__tokenSelector",
    cdata: "editor-Theme__tokenComment",
    char: "editor-Theme__tokenSelector",
    class: "editor-Theme__tokenFunction",
    "class-name": "editor-Theme__tokenFunction",
    comment: "editor-Theme__tokenComment",
    constant: "editor-Theme__tokenProperty",
    deleted: "editor-Theme__tokenProperty",
    doctype: "editor-Theme__tokenComment",
    entity: "editor-Theme__tokenOperator",
    function: "editor-Theme__tokenFunction",
    important: "editor-Theme__tokenVariable",
    inserted: "editor-Theme__tokenSelector",
    keyword: "editor-Theme__tokenAttr",
    namespace: "editor-Theme__tokenVariable",
    number: "editor-Theme__tokenProperty",
    operator: "editor-Theme__tokenOperator",
    prolog: "editor-Theme__tokenComment",
    property: "editor-Theme__tokenProperty",
    punctuation: "editor-Theme__tokenPunctuation",
    regex: "editor-Theme__tokenVariable",
    selector: "editor-Theme__tokenSelector",
    string: "editor-Theme__tokenSelector",
    symbol: "editor-Theme__tokenProperty",
    tag: "editor-Theme__tokenProperty",
    url: "editor-Theme__tokenOperator",
    variable: "editor-Theme__tokenVariable",
  },
  heading: {
    h1: "editor-heading-h1 editor-heading-font",
    h2: "editor-heading-h2 editor-heading-font",
    h3: "editor-heading-h3 editor-heading-font",
    h4: "editor-heading-h4 editor-heading-font",
    h5: "editor-heading-h5 editor-heading-font",
    h6: "editor-heading-h6 editor-heading-font",
  },
  list: {
    ul: "editor-list-ul text-sm",
    ol: "editor-list-ol text-sm",
    checklist: "editor-list-checklist text-sm",
    listitem: "editor-list-item text-sm",
    listitemChecked: "editor-list-item-checked text-sm",
    listitemUnchecked: "editor-list-item-unchecked text-sm",
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

export const CodeHighlightPlugin = () => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return registerCodeHighlighting(editor);
  }, [editor]);

  return null;
};

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

  const editorRef = useRef(null);

  const initialConfig: InitialConfigType = {
    namespace: "CardDetailsEditor",
    editorState: () => $convertFromMarkdownString(description, TRANSFORMERS),
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
                    "w-full px-3 py-2 overflow-y-auto",
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
            <CodeHighlightPlugin />
            <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
            <CustomTransformHTMLToLexical description={description} />
            <CustomTransformLexicalToHTML setEditorState={setEditorState} />
            <ImagesPlugin />
            <EditorRefPlugin editorRef={editorRef} />
            <CopyImagePlugin ref={editorRef} />
          </div>
        </div>

        <ListPlugin />
        <CheckListPlugin />
      </LexicalComposer>
    </div>
  );
};
