import { useEffect, useRef, useState, useCallback } from "react";
import { EditorState, ParagraphNode, $getRoot } from "lexical";
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

import { ListItemNode, ListNode } from "@lexical/list";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { EditorRefPlugin } from "@lexical/react/LexicalEditorRefPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { LinkNode } from "@lexical/link";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { HorizontalRuleNode } from "@lexical/react/LexicalHorizontalRuleNode";
import { CodeNode, CodeHighlightNode } from "@lexical/code";

import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProject } from "@/apis/project";
import { useToast } from "@/hooks/use-toast";
import { indexedDBService } from "@/services/indexedDB.service";
import { useDebounce } from "@/hooks/use-debounce";

// Import markdown transformers
import {
  BOLD_ITALIC_STAR,
  BOLD_ITALIC_UNDERSCORE,
  BOLD_STAR,
  BOLD_UNDERSCORE,
  ITALIC_STAR,
  ITALIC_UNDERSCORE,
  STRIKETHROUGH,
  INLINE_CODE,
  UNORDERED_LIST,
  ORDERED_LIST,
  CHECK_LIST,
  QUOTE,
  HEADING,
  LINK,
  CODE,
} from "@lexical/markdown";
import { CopyImagePlugin } from "../Card/_editor/Plugins/CopyImagePlugin";
import { ImageNode } from "@/_components/Card/_editor/ImageNode";
import { Button } from "@/components/ui/button";
import { Cloud, Copy } from "lucide-react";
import ComponentPickerPlugin from "../Card/_editor/Plugins/ComponentPicketPlugin";
import { FloatingLinkEditorPlugin } from "@/_components/Notes/_editor/plugins/FloatingLinkEditorPlugin";
import { EditorTheme, theme } from "@/_components/shared/Editor/editor-theme";
import { FloatingTextFormatToolbarPlugin } from "../Notes/_editor/plugins/FloatingTextFormatToolbarPlugin";

const ProjectTheme: EditorTheme = {
  ...theme,
  root: "!p-0",
};
interface ProjectDescriptionEditorProps {
  project: any;
  initialDescription?: string;
}

function onError(error: Error) {
  console.error("Lexical editor error:", error);
}

export function PlaceholderPlugin({ placeholder }: { placeholder: string }) {
  const [editor] = useLexicalComposerContext();
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    return editor.registerUpdateListener(
      ({ editorState }: { editorState: EditorState }) => {
        editorState.read(() => {
          const root = $getRoot();
          const children = root.getChildren();

          // Check if the editor is truly empty
          const isEditorEmpty =
            children.length === 0 ||
            (children.length === 1 &&
              children[0].getType() === "paragraph" &&
              children[0].getTextContent().trim() === "");

          setIsEmpty(isEditorEmpty);
        });
      }
    );
  }, [editor]);

  useEffect(() => {
    const rootElement = editor.getRootElement() as HTMLElement;
    if (rootElement) {
      if (isEmpty) {
        rootElement.setAttribute("data-empty-text", placeholder);
      } else {
        rootElement.removeAttribute("data-empty-text");
      }
    }
  }, [editor, isEmpty, placeholder]);

  return null;
}

function TransformToHTMLPlugin({
  setCurrentContent,
}: {
  setCurrentContent: (content: string) => void;
}) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const unregister = editor.registerUpdateListener(
      ({ editorState }: { editorState: EditorState }) => {
        editorState.read(() => {
          try {
            let htmlString = $generateHtmlFromNodes(editor, null);
            htmlString = htmlString.replace(/^(<p[^>]*><br><\/p>)+/, "");
            htmlString = htmlString.replace(/(<p[^>]*><br><\/p>)+$/, "");
            setCurrentContent(htmlString);
          } catch (error) {
            console.error("Error generating HTML:", error);
            setCurrentContent("");
          }
        });
      }
    );

    return unregister;
  }, [editor, setCurrentContent]);

  return null;
}

function InitialContentPlugin({ initialContent }: { initialContent: string }) {
  const [editor] = useLexicalComposerContext();
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (initialContent && !hasInitialized.current) {
      editor.update(() => {
        const parser = new DOMParser();
        const dom = parser.parseFromString(initialContent, "text/html");
        const nodes = $generateNodesFromDOM(editor, dom);
        const root = $getRoot();
        root.clear();
        root.append(...nodes);
      });
      hasInitialized.current = true;
    }
  }, [editor, initialContent]);

  return null;
}

export const ProjectDescriptionEditor = ({
  project,
  initialDescription = "",
}: ProjectDescriptionEditorProps): JSX.Element => {
  const [currentContent, setCurrentContent] = useState(initialDescription);
  const [loadedContent, setLoadedContent] = useState(initialDescription);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoadingSave, setIsLoadingSave] = useState(false);
  const editorRef = useRef(null);
  const anchorElemRef = useRef<HTMLDivElement>(null);
  const [isLinkEditMode, setIsLinkEditMode] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Debounce the current content for IndexedDB saving
  const debouncedContent = useDebounce(currentContent, 500);

  // Refs to track state
  const initialDescriptionRef = useRef(initialDescription);
  const lastSavedToCloudRef = useRef(initialDescription);
  const currentContentRef = useRef(currentContent);
  const handleSaveToCloudRef = useRef<(() => Promise<void>) | null>(null);

  const updateProjectMutation = useMutation({
    mutationFn: (data: any) => updateProject({ slug: project.slug, ...data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", project.slug] });
      toast({
        title: "Success",
        description: "Description saved to cloud successfully",
      });
      lastSavedToCloudRef.current = currentContent;
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save description to cloud",
        variant: "destructive",
      });
    },
  });

  // Initialize IndexedDB and load saved content
  useEffect(() => {
    const initializeEditor = async () => {
      try {
        const savedContent = await indexedDBService.getProjectDescription(
          project.slug
        );

        if (savedContent && savedContent !== initialDescription) {
          setCurrentContent(savedContent);
          setLoadedContent(savedContent);
        } else {
          setCurrentContent(initialDescription);
          setLoadedContent(initialDescription);
        }

        setIsInitialized(true);
      } catch (error) {
        console.error("Failed to initialize editor with IndexedDB:", error);
        setCurrentContent(initialDescription);
        setLoadedContent(initialDescription);
        setIsInitialized(true);
      }
    };

    initializeEditor();
  }, [project.slug, initialDescription]);

  // Update refs when values change
  useEffect(() => {
    initialDescriptionRef.current = initialDescription;
    lastSavedToCloudRef.current = initialDescription;
  }, [initialDescription]);

  useEffect(() => {
    currentContentRef.current = currentContent;
  }, [currentContent]);

  // Save to IndexedDB when debounced content changes
  useEffect(() => {
    if (isInitialized && debouncedContent !== initialDescriptionRef.current) {
      const saveToIndexedDB = async () => {
        try {
          await indexedDBService.saveProjectDescription(
            project.slug,
            debouncedContent
          );
        } catch (error) {
          console.error("Failed to save to IndexedDB:", error);
        }
      };
      saveToIndexedDB();
    }
  }, [debouncedContent, isInitialized, project.slug]);

  // Check if there are unsaved changes
  const hasUnsavedChanges = currentContent !== lastSavedToCloudRef.current;

  // Save to server
  const handleSaveToCloud = useCallback(async () => {
    if (currentContent !== lastSavedToCloudRef.current) {
      setIsLoadingSave(true);
      try {
        await updateProjectMutation.mutateAsync({
          description: currentContent,
        });

        // Clear from IndexedDB after successful save
        await indexedDBService.deleteProjectDescription(project.slug);
      } catch (error) {
        console.error("Failed to save project description:", error);
      } finally {
        setIsLoadingSave(false);
      }
    }
  }, [currentContent, updateProjectMutation, project.slug]);

  // Update the ref with the latest handleSaveToCloud function
  useEffect(() => {
    handleSaveToCloudRef.current = handleSaveToCloud;
  }, [handleSaveToCloud]);

  // Save to cloud on unmount only
  useEffect(() => {
    return () => {
      if (
        currentContentRef.current !== lastSavedToCloudRef.current &&
        handleSaveToCloudRef.current
      ) {
        handleSaveToCloudRef.current();
      }
    };
  }, []);

  const initialConfig = {
    namespace: "ProjectDescriptionEditor",
    theme: ProjectTheme,
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

  const transformers = [
    BOLD_ITALIC_STAR,
    BOLD_ITALIC_UNDERSCORE,
    BOLD_STAR,
    BOLD_UNDERSCORE,
    ITALIC_STAR,
    ITALIC_UNDERSCORE,
    STRIKETHROUGH,
    INLINE_CODE,
    UNORDERED_LIST,
    ORDERED_LIST,
    CHECK_LIST,
    QUOTE,
    HEADING,
    LINK,
    CODE,
  ];

  // Don't render until initialized
  if (!isInitialized) {
    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Description</h2>
        </div>
        <div className="min-h-[120px] bg-muted/50 animate-pulse rounded-md"></div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-end mb-2 w-full">
        <div className="flex items-center gap-2">
          {hasUnsavedChanges && (
            <span className="text-xs text-muted-foreground">
              Unsaved changes
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveToCloud}
            disabled={!hasUnsavedChanges || isLoadingSave}
            className="flex items-center gap-1.5"
          >
            {isLoadingSave ? (
              <Cloud className="h-3 w-3 animate-spin" />
            ) : hasUnsavedChanges ? (
              <Cloud className="h-3 w-3" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
            {isLoadingSave ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <div className="min-h-[120px] overflow-y-auto bg-background">
        <LexicalComposer initialConfig={initialConfig}>
          <div className="relative" ref={anchorElemRef}>
            <RichTextPlugin
              contentEditable={
                <ContentEditable
                  id="project-description-editor"
                  className={cn(
                    "min-h-[100px] w-full max-h-full overflow-y-auto",
                    "text-foreground",
                    "focus:outline-none border-none",
                    "relative px-0 py-0 resize-y",
                    "[&[data-empty-text]]:before:content-[attr(data-empty-text)]",
                    "[&[data-empty-text]]:before:text-muted-foreground/60",
                    "[&[data-empty-text]]:before:absolute",
                    "[&[data-empty-text]]:before:left-[1px]",
                    "[&[data-empty-text]]:before:top-[1px]",
                    "[&[data-empty-text]]:before:pointer-events-none",
                    "[&[data-empty-text]]:before:leading-6",
                    "[&[data-empty-text]]:before:transition-opacity",
                    "[&[data-empty-text]]:before:duration-100",
                    "[&[data-empty-text]]:before:opacity-100",
                    "[&[data-empty-text]]:before:empty:opacity-0"
                  )}
                />
              }
              ErrorBoundary={LexicalErrorBoundary}
            />
            <PlaceholderPlugin placeholder="Add project description..." />
            <InitialContentPlugin initialContent={loadedContent} />
            <TransformToHTMLPlugin setCurrentContent={setCurrentContent} />
            <HistoryPlugin />
            <ListPlugin />
            <CheckListPlugin />
            <MarkdownShortcutPlugin transformers={transformers} />
            <LinkPlugin />
            <CopyImagePlugin />
            <ComponentPickerPlugin />
            <EditorRefPlugin editorRef={editorRef} />
            {anchorElemRef.current && (
              <FloatingLinkEditorPlugin
                anchorElem={anchorElemRef.current}
                isLinkEditMode={isLinkEditMode}
                setIsLinkEditMode={setIsLinkEditMode}
              />
            )}

            {anchorElemRef.current && (
              <FloatingTextFormatToolbarPlugin
                anchorElem={anchorElemRef.current}
                setIsLinkEditMode={setIsLinkEditMode}
              />
            )}
            <ComponentPickerPlugin />
          </div>
        </LexicalComposer>
      </div>
    </div>
  );
};
