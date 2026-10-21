import { cn } from "@/lib/utils";

import "../_editor/ImageNode/styles.css";
import "../../../styles/editor.styles.css";

//::TODO-> Use Sanitize HTML from 3rd party.
// Simple HTML content sanitizer (basic implementation)
function sanitizeHtml(html: string): string {

  // Basic regex-based sanitization (replace with proper library in production)
  let sanitized = html;
  
  // Remove script tags
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove on* attributes
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^>]*/gi, '');
  
  return sanitized;
}

interface CommentRendererProps {
  content: string;
  className?: string;
}

export const CommentRenderer = ({ content, className = "" }: CommentRendererProps) => {
  const sanitizedContent = sanitizeHtml(content);

  return (
    <div
      className={cn(
        "text-foreground max-w-none",
        "comment-content", // Add a class for targeting styles
        className
      )}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      style={{
        userSelect: 'text',
        WebkitUserSelect: 'text',
      }}
    />
  );
};
