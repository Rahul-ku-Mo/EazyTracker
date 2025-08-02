import { useEffect, useRef } from "react";
import { EditorState, ParagraphNode } from "lexical";

import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLexicalIsTextContentEmpty } from "@lexical/react/useLexicalIsTextContentEmpty";
import { $generateHtmlFromNodes } from "@lexical/html";
import { cn } from "../../lib/utils";
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

// Import markdown transformers - use basic ones that don't require image nodes
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

interface ProjectDescriptionEditorProps {
  setDescription: (description: string) => void;
  description: string;
  dimensions: "small" | "large";
}

const theme = {
  // Base styles
  root: 'relative overflow-hidden',
  
  // Paragraph styles
  paragraph: 'mb-1 text-sm text-foreground leading-relaxed',
  
  // List styles
  list: {
    listitem: 'text-sm text-foreground',
    nested: {
      listitem: 'list-none',
    },
    ol: 'ml-4 list-decimal flex flex-col gap-0.5',
    ul: 'ml-4 list-disc flex flex-col gap-0.5',
    checklist: 'ml-4 list-none',
  },
  
  // Text formatting
  text: {
    bold: 'font-semibold',
    italic: 'italic',
    strikethrough: 'line-through',
    underline: 'underline',
    code: 'bg-muted px-1 py-0.5 rounded text-sm font-mono',
  },
  
  // Code blocks
  code: 'bg-muted p-3 rounded-md text-sm font-mono overflow-x-auto',
  
  // Headings
  heading: {
    h1: 'text-2xl font-bold mb-2',
    h2: 'text-xl font-bold mb-2',
    h3: 'text-lg font-bold mb-1',
    h4: 'text-base font-bold mb-1',
    h5: 'text-sm font-bold mb-1',
    h6: 'text-xs font-bold mb-1',
  },
  
  // Quote
  quote: 'border-l-4 border-muted-foreground/20 pl-4 italic text-muted-foreground',
  
  // Link
  link: 'text-primary underline hover:text-primary/80',
};

function onError(error: Error) {
  console.error('Lexical editor error:', error);
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

// OnChangePlugin removed - using TransformToHTMLPlugin instead

// HTML transformation plugin
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
            console.error('Error generating HTML:', error);
            setDescription('');
          }
        });
      }
    );
    
    return unregister;
  }, [editor, setDescription]);

  return null;
}

export const NewProjectDescriptionEditor = ({
  setDescription,
  dimensions,
}: ProjectDescriptionEditorProps): JSX.Element => {
  const editorRef = useRef(null);
  const anchorElemRef = useRef<HTMLDivElement>(null);

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
    ] as any,
  };

  // Remove the old onChange function as we're using TransformToHTMLPlugin now

  // Create transformers array without image transformer
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
    <div className="relative px-4 flex-1">
      <LexicalComposer initialConfig={initialConfig}>
        <div className="editor-container" ref={anchorElemRef}>
          <div className="relative editor-inner">
            <RichTextPlugin
              contentEditable={
                <ContentEditable
                  id="project-description-editor"
                  className={cn(
                    "min-h-[120px] w-full overflow-y-auto",
                    dimensions === "small" ? "max-h-[140px]" : "max-h-[400px]",
                    "text-sm text-foreground",
                    "focus:outline-none border-none",
                    "relative",
                    "px-0 py-0 !p-0",
                    // Styles for the placeholder
                    "[&[data-empty-text]]:before:content-[attr(data-empty-text)]",
                    "[&[data-empty-text]]:before:text-muted-foreground/60",
                    "[&[data-empty-text]]:before:absolute",
                    "[&[data-empty-text]]:before:left-[1px]",
                    "[&[data-empty-text]]:before:top-[1px]",
                    "[&[data-empty-text]]:before:pointer-events-none",
                    "[&[data-empty-text]]:before:text-sm",
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
            <TransformToHTMLPlugin setDescription={setDescription} />
            <HistoryPlugin />
            <ListPlugin />
            <CheckListPlugin />
            <MarkdownShortcutPlugin transformers={transformers} />
            <LinkPlugin />
            <EditorRefPlugin editorRef={editorRef} />
          </div>
        </div>
      </LexicalComposer>
    </div>
  );
}; 