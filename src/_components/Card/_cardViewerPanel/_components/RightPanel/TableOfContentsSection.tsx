import clsx from "clsx";
import { Hash, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";

interface TableOfContentsItem {
  id: string;
  title: string;
  level: number;
  element?: Element;
}

interface TableOfContentsSectionProps {
  cardId: number;
  contentSelector?: string; // CSS selector for the content area to scan
}

export const TableOfContentsSection = ({
  cardId,
}: TableOfContentsSectionProps) => {
  const [tocItems, setTocItems] = useState<TableOfContentsItem[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    let observerRef: MutationObserver | null = null;

    const scanForHeadings = () => {
      // Use only the ID selector for O(1) lookup
      const contentArea = document.getElementById(`editor-${cardId}`);

      if (!contentArea) {
        return false;
      }

      const headings = contentArea.querySelectorAll("h1, h2, h3, h4, h5, h6");
      const items: TableOfContentsItem[] = [];

      headings.forEach((heading, index) => {
        const level = parseInt(heading.tagName.charAt(1));
        const text = heading.textContent?.trim() || `Heading ${index + 1}`;
        const id = heading.id || `heading-${cardId}-${index}`;

        // Ensure heading has an ID for navigation
        if (!heading.id) {
          heading.id = id;
        }

        items.push({
          id,
          title: text,
          level,
          element: heading,
        });
      });

      setTocItems(items);

      // Set up mutation observer only once
      if (!observerRef && contentArea) {
        observerRef = new MutationObserver(() => {
          // Debounce the scan to avoid excessive calls
          setTimeout(() => {
            scanForHeadings();
          }, 100);
        });

        observerRef.observe(contentArea, {
          childList: true,
          subtree: true,
          characterData: true,
        });
      }

      return true;
    };

    // Strategy 1: Immediate scan
    if (scanForHeadings()) {
      return () => {
        if (observerRef) {
          observerRef.disconnect();
        }
      };
    }

    // Strategy 2: Wait for DOM ready
    if (document.readyState === "loading") {
      const onDOMReady = () => {
        document.removeEventListener("DOMContentLoaded", onDOMReady);
        setTimeout(scanForHeadings, 100);
      };
      document.addEventListener("DOMContentLoaded", onDOMReady);
    }

    // Strategy 3: Retry with exponential backoff
    let retryCount = 0;
    const maxRetries = 10;

    const retryWithBackoff = () => {
      if (retryCount >= maxRetries) return;

      const delay = Math.min(1000, 100 * Math.pow(2, retryCount));
      retryCount++;

      setTimeout(() => {
        if (!scanForHeadings() && retryCount < maxRetries) {
          retryWithBackoff();
        }
      }, delay);
    };

    retryWithBackoff();

    // Cleanup function
    return () => {
      if (observerRef) {
        observerRef.disconnect();
        observerRef = null;
      }
    };
  }, [cardId]);

  const handleHeadingClick = (item: TableOfContentsItem) => {
    if (item.element) {
      item.element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      // Optional: highlight the heading briefly
      item.element.classList.add("highlight-heading");
      setTimeout(() => {
        item.element?.classList.remove("highlight-heading");
      }, 2000);
    }
  };

  const displayItems = isExpanded ? tocItems : tocItems.slice(0, 3);

  return (
    <div className="p-2 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-primary">
            Table of Contents
          </span>
        </div>
        {tocItems.length > 3 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            <ChevronRight
              className={`size-3 transition-transform ${isExpanded ? "rotate-90" : ""}`}
            />
            {isExpanded ? "Collapse" : `+${tocItems.length - 3} more`}
          </button>
        )}
      </div>

      <div className="space-y-1 max-h-[200px] overflow-y-auto">
        {tocItems.length === 0 ? (
          <div className="text-xs text-muted-foreground text-left">
            No headings found in content
          </div>
        ) : (
          displayItems.map((item, index) => (
            <div
              key={`${item.id}-${index}`}
              className={clsx(
                "flex items-center gap-2 py-1.5 rounded-md cursor-pointer"
              )}
              onClick={() => handleHeadingClick(item)}
            >
              <Hash className="size-3 text-muted-foreground" />
              <span
                className={`
                  text-xs flex-1 truncate hover:opacity-70 transition-all
                  ${
                    item.level === 1
                      ? "font-semibold"
                      : item.level === 2
                        ? "font-medium"
                        : "font-normal"
                  }
                `}
                title={item.title}
              >
                {item.title}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
