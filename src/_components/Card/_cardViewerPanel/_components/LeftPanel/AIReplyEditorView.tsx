import {
  LexicalComposer,
  InitialConfigType,
} from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { useEffect, useState } from "react";
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
} from "@lexical/markdown";
import { $getRoot } from "lexical";
import { CodeNode } from "@lexical/code";
import { LinkNode } from "@lexical/link";
import { ListNode, ListItemNode } from "@lexical/list";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { HorizontalRuleNode } from "@lexical/react/LexicalHorizontalRuleNode";

import { AI_ONLY_TEXT_MARKDOWN_TRANSFORMERS } from "../../../_editor/MARKDOWN_TRANSFORMERS.ts";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { Copy, CopyCheck } from "lucide-react";

import "../../../../../styles/editor.styles.css";

const theme = {
  root: "ai-editor-root ",
  paragraph: "editor-paragraph text-sm",
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
  text: {
    bold: "editor-text-bold",
    italic: "editor-text-italic",
    underline: "editor-text-underline",
    strikethrough: "editor-text-strikethrough",
    underlineStrikethrough: "editor-text-underline-strikethrough",
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

interface AIReplyEditorViewProps {
  content: string;
  isStreaming: boolean;
}

const StreamingIncomingMessageContentPlugin = ({
  content,
  setMarkdown,
}: {
  content: string;
  setMarkdown: any;
}) => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    editor.update(() => {
      const root = $getRoot();
      root.clear();
      $convertFromMarkdownString(
        content,
        AI_ONLY_TEXT_MARKDOWN_TRANSFORMERS,
        undefined,
        true,
        true
      );
      setMarkdown($convertToMarkdownString(AI_ONLY_TEXT_MARKDOWN_TRANSFORMERS));
    });
  }, [editor, content, setMarkdown]);

  return null;
};

export default function AIReplyEditorView({
  content,
  isStreaming,
}: AIReplyEditorViewProps) {
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const [markdown, setMarkdown] = useState<string>("");

  const initialConfig: InitialConfigType = {
    namespace: "AIReplyEditor",
    theme,
    onError,
    nodes: [
      HeadingNode,
      ListNode,
      ListItemNode,
      QuoteNode,
      CodeNode,
      LinkNode,
      HorizontalRuleNode,
    ],
    editable: isStreaming ? true : false,
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="editor-container">
        <div className="flex justify-end float-right p-1 transition-colors rounded-md cursor-pointer dark:bg-black hover:bg-zinc-100 dark:hover:bg-zinc-800">
          {isCopied ? (
            <div
              className="flex items-center gap-1 text-xs"
              onClick={() => {
                setIsCopied(false);
                setMarkdown("");
              }}
            >
              <CopyCheck className="size-4" />
              Copied
            </div>
          ) : (
            <div
              className="flex items-center gap-1 text-xs"
              onClick={() => {
                if (markdown) {
                  navigator.clipboard.writeText(markdown);
                  setIsCopied(true);
                }
              }}
            >
              <Copy className=" size-4" />
              Copy
            </div>
          )}
        </div>
        <RichTextPlugin
          contentEditable={
            <ContentEditable
              className="editor-input"
              readOnly={isStreaming ? true : false}
            />
          }
          placeholder={null}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <ListPlugin />
        <CheckListPlugin />
        <MarkdownShortcutPlugin transformers={AI_ONLY_TEXT_MARKDOWN_TRANSFORMERS} />
        <StreamingIncomingMessageContentPlugin
          content={content}
          setMarkdown={setMarkdown}
        />
      </div>
    </LexicalComposer>
  );
}
