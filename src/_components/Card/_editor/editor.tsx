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
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
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
import { FloatingTextFormatToolbarPlugin } from "@/_components/Notes/_editor/plugins/FloatingTextFormatToolbarPlugin";
//import { DraggableBlockPlugin } from "./Plugins/CustomDraggablePlugin.tsx";
import { ImageNode } from "./ImageNode";
import { ImagesPlugin } from "./Plugins/ImagePlugin.tsx";
import { KeyboardShortcutsPlugin } from "@/_components/Notes/_editor/plugins/KeyboardShortcutsPlugin"

import "./ImageNode/styles.css";
import "../../../styles/editor.styles.css";
import { cn } from "@/lib/utils";
import { FloatingLinkEditorPlugin } from "@/_components/Notes/_editor/plugins/FloatingLinkEditorPlugin/index.tsx";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";

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
  code: "editor-code",
  codeHighlight: {
    atrule: "editor-tokenAttr",
    attr: "editor-tokenAttr",
    boolean: "editor-tokenProperty",
    builtin: "editor-tokenSelector",
    cdata: "editor-tokenComment",
    char: "editor-tokenSelector",
    class: "editor-tokenFunction",
    "class-name": "editor-tokenFunction",
    comment: "editor-tokenComment",
    constant: "editor-tokenProperty",
    deleted: "editor-tokenProperty",
    doctype: "editor-tokenComment",
    entity: "editor-tokenOperator",
    function: "editor-tokenFunction",
    important: "editor-tokenVariable",
    inserted: "editor-tokenSelector",
    keyword: "editor-tokenAttr",
    namespace: "editor-tokenVariable",
    number: "editor-tokenProperty",
    operator: "editor-tokenOperator",
    prolog: "editor-tokenComment",
    property: "editor-tokenProperty",
    punctuation: "editor-tokenPunctuation",
    regex: "editor-tokenVariable",
    selector: "editor-tokenSelector",
    string: "editor-tokenSelector",
    symbol: "editor-tokenProperty",
    tag: "editor-tokenProperty",
    url: "editor-tokenOperator",
    variable: "editor-tokenVariable",
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
  const [floatingAnchorElem, setFloatingAnchorElem] =
    useState<HTMLDivElement | null>(null);
  const [isLinkEditMode, setIsLinkEditMode] = useState(false);

  const columnId = useContext(ColumnContext);
  const { updateCardMutation } = useCardMutation();

  const editorRef = useRef(null);

  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  };

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
               <div ref={onRef} className="relative">
                 <ContentEditable
                  className={cn(
                    "editor-root",
                    "w-full !pl-12 py-2 overflow-y-auto",
                    "dark:text-zinc-100 focus:outline-none",
                    "min-h-[300px]",
                    "max-h-[calc(100vh-300px)]"
                  )}
                />
               </div>
              }
              ErrorBoundary={LexicalErrorBoundary}
            />
            <HistoryPlugin />
            <AutoFocusPlugin />
            <LinkPlugin/>
            <CodeHighlightPlugin />
            <TabIndentationPlugin />
            <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
            <KeyboardShortcutsPlugin />
            <CustomTransformHTMLToLexical description={description} />
            <CustomTransformLexicalToHTML setEditorState={setEditorState} />
            <ImagesPlugin />
            <EditorRefPlugin editorRef={editorRef} />
            <CopyImagePlugin ref={editorRef} />
            {floatingAnchorElem && (
              <>
                <FloatingTextFormatToolbarPlugin
                  anchorElem={floatingAnchorElem ?? undefined}
                  setIsLinkEditMode={setIsLinkEditMode}
                />
              </>
            )}
            {floatingAnchorElem && (
              <FloatingLinkEditorPlugin
                anchorElem={floatingAnchorElem ?? undefined}
                isLinkEditMode={isLinkEditMode}
                setIsLinkEditMode={setIsLinkEditMode}
              />
            )}
            {/* <DraggableBlockPlugin anchorElem={floatingAnchorElem ?? undefined} /> */}
          </div>
        </div>

        <ListPlugin />
        <CheckListPlugin />
      </LexicalComposer>
    </div>
  );
};

