import { useEffect, useState, useRef } from "react";

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
} from "@/_components/Card/_editor/Plugins/CustomTransformations";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { $convertFromMarkdownString } from "@lexical/markdown";
import { MARKDOWN_TRANSFORMERS as TRANSFORMERS } from "@/_components/Card/_editor/MARKDOWN_TRANSFORMERS.ts";
import { EditorRefPlugin } from "@lexical/react/LexicalEditorRefPlugin";
import { CopyImagePlugin } from "@/_components/Card/_editor/Plugins/CopyImagePlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
/**Lexical Nodes */
import { CodeNode, CodeHighlightNode } from "@lexical/code";
import { LinkNode } from "@lexical/link";
import { ListNode, ListItemNode } from "@lexical/list";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { HorizontalRuleNode } from "@lexical/react/LexicalHorizontalRuleNode";
import { registerCodeHighlighting } from "@lexical/code";
import { KeyboardShortcutsPlugin } from "@/_components/Notes/_editor/plugins/KeyboardShortcutsPlugin/index.tsx";
import { FloatingLinkEditorPlugin } from "@/_components/Notes/_editor/plugins/FloatingLinkEditorPlugin/index.tsx";
import { FloatingTextFormatToolbarPlugin } from "@/_components/Notes/_editor/plugins/FloatingTextFormatToolbarPlugin";
//import  { DraggableBlockPlugin} from "@/_components/Notes/_editor/plugins/CustomDraggablePlugin";

import { ImageNode } from "@/_components/Card/_editor/ImageNode";
import { ImagesPlugin } from "@/_components/Card/_editor/Plugins/ImagePlugin.tsx";

import "@/_components/Card/_editor/ImageNode/styles.css";
import "../../../styles/editor.styles.css";
import { cn } from "@/lib/utils";

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
  link: string;
}

const theme: EditorTheme = {
  root: "editor-root",
  paragraph: "editor-paragraph",
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
  text: {
    bold: "editor-text-bold",
    italic: "editor-text-italic",
    underline: "editor-text-underline",
    strikethrough: "editor-text-strikethrough",
    underlineStrikethrough: "editor-text-underline-strikethrough",
  },
  heading: {
    h1: "editor-heading-h1",
    h2: "editor-heading-h2",
    h3: "editor-heading-h3",
    h4: "editor-heading-h4",
    h5: "editor-heading-h5",
    h6: "editor-heading-h6",
  },
  list: {
    ul: "editor-list-ul flex flex-col gap-0.5",
    ol: "editor-list-ol flex flex-col gap-0.5",
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
  link: "editor-link",
};

function onError(error: Error): void {
  console.error(error);
}

// Code highlighting plugin for syntax highlighting
function CodeHighlightPlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return registerCodeHighlighting(editor);
  }, [editor]);

  return null;
}

export const NotesEditor = ({
  description = "<div>Hello</div>",
  onContentChange,
  readOnly = false,
}: {
  description?: string;
  onContentChange?: (content: string) => void;
  readOnly?: boolean;
}): JSX.Element => {
  const [editorState, setEditorState] = useState<string>();
  const [isLinkEditMode, setIsLinkEditMode] = useState(false);
  const [floatingAnchorElem, setFloatingAnchorElem] =
    useState<HTMLDivElement | null>(null);

  const editorRef = useRef(null);

  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  };

  // Save immediately when content changes
  useEffect(() => {
    if (editorState && onContentChange && !readOnly) {
      onContentChange(editorState);
    }
  }, [editorState, onContentChange, readOnly]);

  const initialConfig: InitialConfigType = {
    namespace: "NotesEditor",
    editorState: () => $convertFromMarkdownString(description, TRANSFORMERS),
    theme,
    onError,
    editable: !readOnly,
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
    <div className="relative h-full">
      <LexicalComposer initialConfig={initialConfig}>
        <div className="editor-container">
          <div className="h-full editor-inner">
            <RichTextPlugin
              contentEditable={
               <div ref={onRef} className="relative">
                 <ContentEditable
                  className={cn(
                    "editor-root",
                    "w-full py-2 !px-0 overflow-y-auto",
                    "dark:text-zinc-100 focus:outline-none",
                    "min-h-[300px]",
                    "max-h-[calc(100vh-300px)]",
                    readOnly ? "cursor-default" : ""
                  )}
                />
               </div>
              }
              ErrorBoundary={LexicalErrorBoundary}
            />
            <HistoryPlugin />
            {!readOnly && <AutoFocusPlugin />}
            <CodeHighlightPlugin />
            {!readOnly && <TabIndentationPlugin />}
            {!readOnly && <MarkdownShortcutPlugin transformers={TRANSFORMERS} />}
            {!readOnly && <KeyboardShortcutsPlugin />}
            <LinkPlugin />
            <CustomTransformHTMLToLexical description={description} />
            {!readOnly && <CustomTransformLexicalToHTML setEditorState={setEditorState} />}
            {!readOnly && <ImagesPlugin />}
            <EditorRefPlugin editorRef={editorRef} />
            {!readOnly && <CopyImagePlugin ref={editorRef} />}
            {!readOnly && floatingAnchorElem && (
                <FloatingTextFormatToolbarPlugin
                  anchorElem={floatingAnchorElem ?? undefined}
                  setIsLinkEditMode={setIsLinkEditMode}
                />
            )}
            {/* {!readOnly && <DraggableBlockPlugin anchorElem={floatingAnchorElem ?? undefined} />} */}
            {floatingAnchorElem && (
              <>
                <FloatingLinkEditorPlugin
                  anchorElem={floatingAnchorElem ?? undefined}
                  isLinkEditMode={isLinkEditMode}
                  setIsLinkEditMode={setIsLinkEditMode}
                />
              </>
            )}
          </div>
        </div>
        <ListPlugin />
        <CheckListPlugin />
      </LexicalComposer>
    </div>
  );
};

// KeyboardShortcuts plugin component
