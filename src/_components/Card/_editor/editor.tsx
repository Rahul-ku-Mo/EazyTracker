import { useContext, useEffect, useState, useRef, useCallback } from "react";

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
import { FloatingLinkEditorPlugin } from "@/_components/Notes/_editor/plugins/FloatingLinkEditorPlugin";
import { ImagesPlugin } from "./Plugins/ImagePlugin.tsx";
import MentionsPlugin from "./Plugins/MentionsPlugin.tsx";
import { KeyboardShortcutsPlugin } from "@/_components/Notes/_editor/plugins/KeyboardShortcutsPlugin";
import { ImageNode } from "./ImageNode";
import { MentionNode } from "./MentionNode";
import { cn } from "../../../lib/utils";
import { indexedDBService } from "../../../services/indexedDB.service.ts";

import "./ImageNode/styles.css";
import "../../../styles/editor.styles.css";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import ComponentPickerPlugin from "./Plugins/ComponentPicketPlugin.tsx";

interface EditorTheme {
  root: string;
  paragraph: string;
  placeholder: string;
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
  link: string;
  quote: string;
}

// Updated theme with corrected class names
const theme: EditorTheme = {
  root: "editor-root",
  paragraph: "editor-paragraph",
  placeholder: "editor-placeholder",
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
  link: "editor-link",
  quote: "editor-quote",
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
  onEditorClose?: () => void; // Callback when editor closes
}

export const CardDetailsEditor = ({
  cardId,
  description,
  onEditorClose,
}: CardDetailsEditorProps): JSX.Element => {
  const [editorState, setEditorState] = useState<string>();
  const [floatingAnchorElem, setFloatingAnchorElem] =
    useState<HTMLDivElement | null>(null);
  const [isLinkEditMode, setIsLinkEditMode] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const columnId = useContext(ColumnContext);
  const { updateCardMutation } = useCardMutation();

  const editorRef = useRef(null);
  const initialDescriptionRef = useRef(description);
  const lastSavedToIndexedDBRef = useRef<string>("");

  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) { 
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  };

  // Initialize IndexedDB and load saved content
  useEffect(() => {
    const initializeEditor = async () => {
      try {
        // Try to get saved content from IndexedDB
        const savedContent = await indexedDBService.getCardDescription(cardId);
        
        if (savedContent && savedContent !== description) {
          // Use saved content if it exists and is different from server description
          setEditorState(savedContent);
          lastSavedToIndexedDBRef.current = savedContent;
          setHasUnsavedChanges(true);
        } else {
          // Use server description
          setEditorState(description);
          lastSavedToIndexedDBRef.current = description;
          setHasUnsavedChanges(false);
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize editor with IndexedDB:', error);
        // Fallback to server description
        setEditorState(description);
        lastSavedToIndexedDBRef.current = description;
        setIsInitialized(true);
      }
    };

    initializeEditor();
  }, [cardId, description]);

  // Initialize the initial description reference
  useEffect(() => {
    initialDescriptionRef.current = description;
  }, [description]);

  // Save to IndexedDB whenever content changes
  const saveToIndexedDB = useCallback(async (content: string) => {
    try {
      await indexedDBService.saveCardDescription(cardId, content);
      lastSavedToIndexedDBRef.current = content;
    } catch (error) {
      console.error('Failed to save to IndexedDB:', error);
    }
  }, [cardId]);

  // Track editor state changes and save to IndexedDB
  useEffect(() => {
    if (editorState && editorState !== lastSavedToIndexedDBRef.current) {
      const hasChanges = editorState !== initialDescriptionRef.current;
      setHasUnsavedChanges(hasChanges);
      
      // Save to IndexedDB if content has changed
      if (hasChanges) {
        saveToIndexedDB(editorState);
      }
    }
  }, [editorState, saveToIndexedDB]);

  // Save to server when editor closes
  const handleEditorClose = useCallback(async () => {
    if (editorState && editorState !== description) {
      try {
        // Call the update mutation
        updateCardMutation.mutate({
          cardDescription: editorState,
          cardId: cardId,
          columnId,
        });
        
        // Clear from IndexedDB after successful save
        await indexedDBService.deleteCardDescription(cardId);
        lastSavedToIndexedDBRef.current = editorState;
        setHasUnsavedChanges(false);
      } catch (error) {
        console.error('Failed to save card description:', error);
      }
    }
    
    // Call the onEditorClose callback
    onEditorClose?.();
  }, [editorState, description, updateCardMutation, cardId, columnId, onEditorClose]);

  // Expose the close handler to parent components
  useEffect(() => {
    // Store the close handler in a global variable or context that parent can access
    (window as any).__cardEditorCloseHandler = handleEditorClose;
    
    return () => {
      delete (window as any).__cardEditorCloseHandler;
    };
  }, [handleEditorClose]);

  const initialConfig: InitialConfigType = {
    namespace: "CardDetailsEditor",
    editorState: () => {
      // Use the current editor state if available, otherwise use description
      const contentToUse = editorState || description;
      return $convertFromMarkdownString(contentToUse, TRANSFORMERS);
    },
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

  // Don't render until initialized
  if (!isInitialized) {
    return <div className="relative h-full border border-[#e3e3e3b5] rounded-lg bg-[#fafafa] dark:bg-[#181818] dark:border-zinc-700 p-2">
      <div className="flex items-center justify-center h-full">
        <div className="text-sm text-muted-foreground">Loading editor...</div>
      </div>
    </div>;
  }

  return (
    <div className="relative h-full border border-[#e3e3e3b5] rounded-sm bg-[#fafafa] dark:bg-[#181818] dark:border-zinc-700 p-2 overflow-auto">
      <LexicalComposer initialConfig={initialConfig}>
        <div>
          <CardToolbarPlugin 
            hasUnsavedChanges={hasUnsavedChanges}
          />
          <div className="h-full editor-inner">
            <RichTextPlugin
              contentEditable={
               <div ref={onRef} className="relative">
                 <ContentEditable
                  className={cn(
                    "editor-root",
                    "w-full p-0 overflow-y-auto",
                    "dark:text-zinc-100 focus:outline-none",
                    "min-h-[300px]",
                    "h-full"
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
            <MentionsPlugin/>
            <ComponentPickerPlugin/>
            {floatingAnchorElem && (
              <>
                <FloatingTextFormatToolbarPlugin
                  anchorElem={floatingAnchorElem ?? undefined}
                  setIsLinkEditMode={setIsLinkEditMode}
                />
              </>
            )}
            {
              <FloatingLinkEditorPlugin
                anchorElem={floatingAnchorElem ?? undefined}
                isLinkEditMode={isLinkEditMode}
                setIsLinkEditMode={setIsLinkEditMode}
              />
            }
            {/* <DraggableBlockPlugin anchorElem={floatingAnchorElem ?? undefined} /> */}
          </div>
        </div>

        <ListPlugin />
        <CheckListPlugin />
      </LexicalComposer>
    </div>
  );
};