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
import { MARKDOWN_TRANSFORMERS as TRANSFORMERS } from "./MARKDOWN_TRANSFORMERS.ts";
import { EditorRefPlugin } from "@lexical/react/LexicalEditorRefPlugin";
import { CopyImagePlugin } from "./Plugins/CopyImagePlugin";
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin';
import { mergeRegister } from "@lexical/utils";
/**Lexical Nodes */
import { CodeNode, CodeHighlightNode } from "@lexical/code";
import { LinkNode } from "@lexical/link";
import { ListNode, ListItemNode } from "@lexical/list";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { HorizontalRuleNode } from "@lexical/react/LexicalHorizontalRuleNode";
import { registerCodeHighlighting } from "@lexical/code";
import {
  KEY_DOWN_COMMAND,
  COMMAND_PRIORITY_EDITOR,
  FORMAT_TEXT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
} from "lexical";

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
  paragraph: "editor-paragraph",
  text: {
    bold: "editor-text-bold",
    italic: "editor-text-italic",
    underline: "editor-text-underline",
    strikethrough: "editor-text-strikethrough",
    underlineStrikethrough: "editor-text-underline-strikethrough",
  },
  code: "editor-Theme__code",
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

export const CodeHighlightPlugin = () => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return registerCodeHighlighting(editor);
  }, [editor]);

  return null;
};

interface CardDetailsEditorProps {
  cardId: number;
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
      cardId: cardId,
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
                    "editor-root",
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
            <TabIndentationPlugin />
            <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
            <KeyboardShortcutsPlugin />
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

// KeyboardShortcuts plugin component
const KeyboardShortcutsPlugin = () => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        KEY_DOWN_COMMAND,
        (event: KeyboardEvent) => {
          const { ctrlKey, metaKey, key, shiftKey, altKey } = event;
          const isModKey = ctrlKey || metaKey;

          if (!isModKey) return false;

          switch (key.toLowerCase()) {
            case 'b':
              if (!shiftKey && !altKey) {
                event.preventDefault();
                editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
                return true;
              }
              break;
            case 'i':
              if (!shiftKey && !altKey) {
                event.preventDefault();
                editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
                return true;
              }
              break;
            case 'u':
              if (!shiftKey && !altKey) {
                event.preventDefault();
                editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
                return true;
              }
              break;
            case 'z':
              if (!shiftKey && !altKey) {
                event.preventDefault();
                editor.dispatchCommand(UNDO_COMMAND, undefined);
                return true;
              } else if (shiftKey && !altKey) {
                event.preventDefault();
                editor.dispatchCommand(REDO_COMMAND, undefined);
                return true;
              }
              break;
            case 'y':
              if (!shiftKey && !altKey) {
                event.preventDefault();
                editor.dispatchCommand(REDO_COMMAND, undefined);
                return true;
              }
              break;
            case 's':
              if (!shiftKey && !altKey) {
                event.preventDefault();
                // Save functionality - we'll trigger the save callback
                const saveEvent = new CustomEvent('lexical-save');
                document.dispatchEvent(saveEvent);
                return true;
              }
              break;
          }

          return false;
        },
        COMMAND_PRIORITY_EDITOR
      )
    );
  }, [editor]);

  return null;
};
