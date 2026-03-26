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
import { theme } from "@/_components/shared/Editor/editor-theme";
import { HorizontalRulePlugin } from "@lexical/react/LexicalHorizontalRulePlugin";

function onError(error: Error): void {
  console.error("Lexical Editor Error:", error);
  
  // Check if it's a CodeNode related error
  if (error.message.includes('CodeNode') || error.message.includes('code') || error.stack?.includes('CodeNode')) {
    console.error("CodeNode specific error detected:", error);
    // Don't crash the entire editor for CodeNode errors
    return;
  }
  
  // Log error details for debugging
  console.error("Error stack:", error.stack);
}

export const CodeHighlightPlugin = () => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    try {
      return registerCodeHighlighting(editor);
    } catch (error) {
      console.error("Error registering code highlighting:", error);
      // Return a no-op cleanup function if registration fails
      return () => {};
    }
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
        } else {
          // Use server description
          setEditorState(description);
          lastSavedToIndexedDBRef.current = description;
        }

        setIsInitialized(true);
      } catch (error) {
        console.error("Failed to initialize editor with IndexedDB:", error);
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
  const saveToIndexedDB = useCallback(
    async (content: string) => {
      try {
        await indexedDBService.saveCardDescription(cardId, content);
        lastSavedToIndexedDBRef.current = content;
      } catch (error) {
        console.error("Failed to save to IndexedDB:", error);
      }
    },
    [cardId]
  );

  // Track editor state changes and save to IndexedDB
  useEffect(() => {
    if (editorState && editorState !== lastSavedToIndexedDBRef.current) {
      const hasChanges = editorState !== initialDescriptionRef.current;
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
      } catch (error) {
        console.error("Failed to save card description:", error);
      }
    }

    // Call the onEditorClose callback
    onEditorClose?.();
  }, [
    editorState,
    description,
    updateCardMutation,
    cardId,
    columnId,
    onEditorClose,
  ]);

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
      MentionNode,
    ] as any,
  };

  // Don't render until initialized
  if (!isInitialized) {
    return (
      <div className="relative h-full border border-[#e3e3e3b5] rounded-lg bg-[#fafafa] dark:bg-[#181818] dark:border-zinc-700 p-2">
        <div className="flex items-center justify-center h-full">
          <div className="text-sm text-muted-foreground">Loading editor...</div>
        </div>
      </div>
    );
  }

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="relative block bg-transparent">
        <RichTextPlugin
          contentEditable={
            <div className="min-h-[100px] max-w-full resize-y outline-0 border-0 z-0 flex">
              <div
                ref={onRef}
                className="relative flex-auto max-w-full resize-y"
              >
                <ContentEditable
                  id={`editor-${cardId}`}
                  className={cn(
                    "editor-root",
                    "w-full !p-0",
                    "dark:text-zinc-100 focus:outline-none",
                    "h-full"
                  )}
                />
              </div>
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <AutoFocusPlugin />
        <LinkPlugin />
        <CodeHighlightPlugin />
        <TabIndentationPlugin />
        <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
        <KeyboardShortcutsPlugin />
        <CustomTransformHTMLToLexical description={description} />
        <CustomTransformLexicalToHTML setEditorState={setEditorState} />
        <ImagesPlugin />
        <EditorRefPlugin editorRef={editorRef} />
        <CopyImagePlugin ref={editorRef} />
        <MentionsPlugin />
        <ComponentPickerPlugin />
        <HorizontalRulePlugin />
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

        <ListPlugin />
        <CheckListPlugin />
      </div>
    </LexicalComposer>
  );
};
