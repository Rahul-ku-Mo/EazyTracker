import { useEffect, useRef, useState } from "react";
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
  setDescription,
}: {
  setDescription: (description: string) => void;
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
            setDescription(htmlString);
          } catch (error) {
            console.error("Error generating HTML:", error);
            setDescription("");
          }
        });
      }
    );

    return unregister;
  }, [editor, setDescription]);

  return null;
}

function InitialContentPlugin({ initialContent }: { initialContent: string }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (initialContent) {
      editor.update(() => {
        const parser = new DOMParser();
        const dom = parser.parseFromString(initialContent, "text/html");
        const nodes = $generateNodesFromDOM(editor, dom);
        const root = $getRoot();
        root.clear();
        root.append(...nodes);
      });
    }
  }, [editor, initialContent]);

  return null;
}

// Helper function to check if HTML content is effectively empty
function isContentEffectivelyEmpty(htmlContent: string): boolean {
  if (!htmlContent || htmlContent.trim() === "") {
    return true;
  }

  // Create a temporary element to parse the HTML
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = htmlContent;

  // Get text content and check if it's empty or just whitespace
  const textContent = tempDiv.textContent || tempDiv.innerText || "";

  // Check if there's any meaningful text content
  return textContent.trim() === "";
}

export const ProjectDescriptionEditor = ({
  project,
  initialDescription = "",
}: ProjectDescriptionEditorProps): JSX.Element => {
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState(initialDescription);
  const editorRef = useRef(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
 
  const updateProjectMutation = useMutation({
    mutationFn: (data: any) => updateProject({ slug: project.slug, ...data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", project.slug] });
      toast({
        title: "Success",
        description: "Description updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update description",
        variant: "destructive",
      });
      // Revert to initial description on error
      setDescription(initialDescription);
    },
  });

  const handleAutoSave = () => {
    if (description !== initialDescription) {
      updateProjectMutation.mutate({ description });
    }
    setIsEditing(false);
  };

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

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold">Description</h2>
      </div>

      {!isEditing ? (
        <div
          className="prose prose-sm max-w-none text-muted-foreground cursor-pointer rounded-md transition-colors"
          onClick={() => setIsEditing(true)}
        >
          {initialDescription &&
          !isContentEffectivelyEmpty(initialDescription) ? (
            <div dangerouslySetInnerHTML={{ __html: initialDescription }} />
          ) : (
            <p className="text-muted-foreground italic text-sm">
              No description provided. Click to add one.
            </p>
          )}
        </div>
      ) : (
        <div
          className="rounded-md min-h-[120px] max-h-full overflow-y-auto"
          onBlur={handleAutoSave}
        >
          <LexicalComposer initialConfig={initialConfig}>
            <div className="editor-container">
              <div className="relative editor-inner">
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
                      onBlur={handleAutoSave}
                    />
                  }
                  ErrorBoundary={LexicalErrorBoundary}
                />
                <PlaceholderPlugin placeholder="Add project description..." />
                <InitialContentPlugin initialContent={initialDescription} />
                <TransformToHTMLPlugin setDescription={setDescription} />
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
      )}
    </div>
  );
};
