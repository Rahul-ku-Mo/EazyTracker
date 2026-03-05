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
import { updateProject } from "@/apis/project";
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
import { Cloud } from "lucide-react";
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
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved" | "error">("saved");
  const editorRef = useRef(null);
  const anchorElemRef = useRef<HTMLDivElement>(null);
  const [isLinkEditMode, setIsLinkEditMode] = useState(false);

  // Debounce for IndexedDB (local backup)
  const debouncedContent = useDebounce(currentContent, 500);
  // Debounce for cloud save (2s after user stops typing)
  const debouncedCloudContent = useDebounce(currentContent, 2000);

  // Refs to track state
  const initialDescriptionRef = useRef(initialDescription);
  const lastSavedToCloudRef = useRef(initialDescription);
  const currentContentRef = useRef(currentContent);
  const handleSaveToCloudRef = useRef<(() => Promise<void>) | null>(null);
  const projectSlugRef = useRef(project.slug);

  useEffect(() => {
    projectSlugRef.current = project.slug;
  }, [project.slug]);

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

  // Skip the first content change from InitialContentPlugin — treat it as the baseline,
  // not a user edit. This prevents an immediate autosave on load that could degrade
  // formatting through the HTML round-trip.
  const hasUserEditedRef = useRef(false);

  useEffect(() => {
    if (isInitialized) {
      const timer = setTimeout(() => {
        hasUserEditedRef.current = true;
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isInitialized]);

  const handleContentChange = useCallback((content: string) => {
    setCurrentContent(content);
    if (!hasUserEditedRef.current) {
      lastSavedToCloudRef.current = content;
      return;
    }
    setSaveStatus("unsaved");
  }, []);

  // Autosave to cloud when debounced content changes (2s after user stops typing).
  // Calls the API directly to avoid useMutation state changes re-triggering this effect.
  useEffect(() => {
    if (!isInitialized) return;
    if (debouncedCloudContent === lastSavedToCloudRef.current) return;

    let cancelled = false;

    const saveToCloud = async () => {
      setSaveStatus("saving");
      try {
        await updateProject({
          slug: projectSlugRef.current,
          description: debouncedCloudContent,
        });
        if (cancelled) return;
        lastSavedToCloudRef.current = debouncedCloudContent;
        setSaveStatus("saved");
        await indexedDBService.deleteProjectDescription(projectSlugRef.current);
      } catch {
        if (cancelled) return;
        setSaveStatus("error");
      }
    };

    saveToCloud();

    return () => {
      cancelled = true;
    };
  }, [debouncedCloudContent, isInitialized]);

  // Save to cloud on unmount if there are unsaved changes (safety net)
  const handleSaveToCloud = useCallback(async () => {
    if (currentContentRef.current !== lastSavedToCloudRef.current) {
      try {
        await updateProject({
          slug: projectSlugRef.current,
          description: currentContentRef.current,
        });
        lastSavedToCloudRef.current = currentContentRef.current;
        await indexedDBService.deleteProjectDescription(projectSlugRef.current);
      } catch (error) {
        console.error("Failed to save project description:", error);
      }
    }
  }, []);

  useEffect(() => {
    handleSaveToCloudRef.current = handleSaveToCloud;
  }, [handleSaveToCloud]);

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
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {saveStatus === "saving" && (
            <>
              <Cloud className="h-3 w-3 animate-pulse" />
              <span>Saving...</span>
            </>
          )}
          {saveStatus === "saved" && (
            <>
              <Cloud className="h-3 w-3" />
              <span>Saved</span>
            </>
          )}
          {saveStatus === "unsaved" && <span>Unsaved changes</span>}
          {saveStatus === "error" && (
            <span className="text-destructive">Save failed — retrying</span>
          )}
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
            <TransformToHTMLPlugin setCurrentContent={handleContentChange} />
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
