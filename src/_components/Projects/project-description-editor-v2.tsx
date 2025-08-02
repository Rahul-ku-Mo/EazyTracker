import { useEffect, useRef, useState, useCallback } from "react";
import { EditorState, ParagraphNode, $getRoot } from "lexical";
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLexicalIsTextContentEmpty } from "@lexical/react/useLexicalIsTextContentEmpty";
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
import { Save, Check } from "lucide-react";

interface ProjectDescriptionEditorProps {
  project: any;
  initialDescription?: string;
}

const theme = {
  root: "relative overflow-hidden",
  paragraph: "mb-1 text-sm text-foreground leading-relaxed",
  list: {
    listitem: "text-sm text-foreground",
    nested: { listitem: "list-none" },
    ol: "ml-4 list-decimal flex flex-col gap-0.5",
    ul: "ml-4 list-disc flex flex-col gap-0.5",
    checklist: "ml-4 list-none",
  },
  text: {
    bold: "font-semibold",
    italic: "italic",
    strikethrough: "line-through",
    underline: "underline",
    code: "bg-muted px-1 py-0.5 rounded text-sm font-mono",
  },
  code: "bg-muted p-3 rounded-md text-sm font-mono overflow-x-auto",
  heading: {
    h1: "text-2xl font-bold mb-2",
    h2: "text-xl font-bold mb-2",
    h3: "text-lg font-bold mb-1",
    h4: "text-base font-bold mb-1",
    h5: "text-sm font-bold mb-1",
    h6: "text-xs font-bold mb-1",
  },
  quote:
    "border-l-4 border-muted-foreground/20 pl-4 italic text-muted-foreground",
  link: "text-primary underline hover:text-primary/80",
};

function onError(error: Error) {
  console.error("Lexical editor error:", error);
}

function PlaceholderPlugin({ placeholder }: { placeholder: string }) {
  const [editor] = useLexicalComposerContext();
  const isEmpty = useLexicalIsTextContentEmpty(editor);

  return (
    <div
      className={cn(
        "absolute left-[1px] top-[1px] pointer-events-none select-none text-muted-foreground/60 text-sm",
        !isEmpty && "hidden"
      )}
    >
      {placeholder}
    </div>
  );
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
        const savedContent = await indexedDBService.getProjectDescription(project.slug);
        
        if (savedContent && savedContent !== initialDescription) {
          setCurrentContent(savedContent);
          setLoadedContent(savedContent);
        } else {
          setCurrentContent(initialDescription);
          setLoadedContent(initialDescription);
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize editor with IndexedDB:', error);
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
          await indexedDBService.saveProjectDescription(project.slug, debouncedContent);
        } catch (error) {
          console.error('Failed to save to IndexedDB:', error);
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
        await updateProjectMutation.mutateAsync({ description: currentContent });
        
        // Clear from IndexedDB after successful save
        await indexedDBService.deleteProjectDescription(project.slug);
      } catch (error) {
        console.error('Failed to save project description:', error);
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
      if (currentContentRef.current !== lastSavedToCloudRef.current && handleSaveToCloudRef.current) {
        handleSaveToCloudRef.current();
      }
    };
  }, []);

  const initialConfig = {
    namespace: "ProjectDescriptionEditor",
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
      ImageNode
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
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold">Description</h2>
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
              <Save className="h-3 w-3 animate-spin" />
            ) : hasUnsavedChanges ? (
              <Save className="h-3 w-3" />
            ) : (
              <Check className="h-3 w-3" />
            )}
            {isLoadingSave ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <div className="rounded-md border min-h-[120px] max-h-full overflow-y-auto bg-background">
        <LexicalComposer initialConfig={initialConfig}>
          <div className="editor-container">
            <div className="relative editor-inner p-3">
              <RichTextPlugin
                contentEditable={
                  <ContentEditable
                    id="project-description-editor"
                    className={cn(
                      "min-h-[100px] w-full overflow-y-auto",
                      "text-sm text-foreground",
                      "focus:outline-none border-none",
                      "relative px-0 py-0"
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
              <EditorRefPlugin editorRef={editorRef} />
            </div>
          </div>
        </LexicalComposer>
      </div>
    </div>
  );
};