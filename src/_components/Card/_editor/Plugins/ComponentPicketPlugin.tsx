import type { JSX } from "react";

import { $createCodeNode } from "@lexical/code";
import {
  INSERT_CHECK_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { INSERT_HORIZONTAL_RULE_COMMAND } from "@lexical/react/LexicalHorizontalRuleNode";
import {
  LexicalTypeaheadMenuPlugin,
  MenuOption,
  MenuResolution,
  useBasicTypeaheadTriggerMatch,
  useDynamicPositioning,
} from "@lexical/react/LexicalTypeaheadMenuPlugin";
import { $createHeadingNode, $createQuoteNode } from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  FORMAT_ELEMENT_COMMAND,
  LexicalEditor,
  TextNode,
} from "lexical";
import { useCallback, useMemo, useRef, useState } from "react";
import * as ReactDOM from "react-dom";
import { cn } from "@/lib/utils";

// Icons
import {
  Type,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code,
  Minus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
} from "lucide-react";

class ComponentPickerOption extends MenuOption {
  title: string;
  icon?: JSX.Element;
  keywords: Array<string>;
  keyboardShortcut?: string;
  onSelect: (queryString: string) => void;

  constructor(
    title: string,
    options: {
      icon?: JSX.Element;
      keywords?: Array<string>;
      keyboardShortcut?: string;
      onSelect: (queryString: string) => void;
    }
  ) {
    super(title);
    this.title = title;
    this.keywords = options.keywords || [];
    this.icon = options.icon;
    this.keyboardShortcut = options.keyboardShortcut;
    this.onSelect = options.onSelect.bind(this);
  }
}

function ComponentPickerMenuItem({
  index,
  isSelected,
  onClick,
  onMouseEnter,
  option,
}: {
  index: number;
  isSelected: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  option: ComponentPickerOption;
}) {
  return (
    <li
      key={option.key}
      tabIndex={-1}
      className={cn(
        "flex items-center gap-3 px-2 py-1.5 cursor-pointer transition-colors rounded-sm m-1",
        "hover:bg-accent/60 hover:text-accent-foreground",
        "focus:bg-accent/60 focus:text-accent-foreground focus:outline-none",
        "select-none user-select-none",
        isSelected && "bg-accent text-accent-foreground"
      )}
      ref={option.setRefElement}
      role="option"
      aria-selected={isSelected}
      id={"typeahead-item-" + index}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      style={{
        WebkitUserSelect: "none",
        MozUserSelect: "none",
        msUserSelect: "none",
        userSelect: "none",
        pointerEvents: "auto",
      }}
    >
      <div className="flex-shrink-0 w-4 h-4 flex items-center justify-center pointer-events-none">
        {option.icon}
      </div>
      <span className="flex-1 text-sm font-medium pointer-events-none">
        {option.title}
      </span>
      {option.keyboardShortcut && (
        <span className="text-[10px] text-muted-foreground border border-border bg-transparent px-1.5 py-0.5 rounded pointer-events-none">
          {option.keyboardShortcut}
        </span>
      )}
    </li>
  );
}

function getBaseOptions(editor: LexicalEditor) {
  return [
    new ComponentPickerOption("Paragraph", {
      icon: <Type size={16} />,
      keywords: ["normal", "paragraph", "p", "text"],
      keyboardShortcut: "⌘⌥0",
      onSelect: () =>
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createParagraphNode());
          }
        }),
    }),
    new ComponentPickerOption("Heading 1", {
      icon: <Heading1 size={16} />,
      keywords: ["heading", "header", "h1"],
      keyboardShortcut: "⌘⌥1",
      onSelect: () =>
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createHeadingNode("h1"));
          }
        }),
    }),
    new ComponentPickerOption("Heading 2", {
      icon: <Heading2 size={16} />,
      keywords: ["heading", "header", "h2"],
      keyboardShortcut: "⌘⌥2",
      onSelect: () =>
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createHeadingNode("h2"));
          }
        }),
    }),
    new ComponentPickerOption("Heading 3", {
      icon: <Heading3 size={16} />,
      keywords: ["heading", "header", "h3"],
      keyboardShortcut: "⌘⌥3",
      onSelect: () =>
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createHeadingNode("h3"));
          }
        }),
    }),
    new ComponentPickerOption("Numbered List", {
      icon: <ListOrdered size={16} />,
      keywords: ["numbered list", "ordered list", "ol"],
      keyboardShortcut: "⌘⇧7",
      onSelect: () =>
        editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined),
    }),
    new ComponentPickerOption("Bulleted List", {
      icon: <List size={16} />,
      keywords: ["bulleted list", "unordered list", "ul"],
      keyboardShortcut: "⌘⇧8",
      onSelect: () =>
        editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined),
    }),
    new ComponentPickerOption("Check List", {
      icon: <CheckSquare size={16} />,
      keywords: ["check list", "todo list", "task list"],
      keyboardShortcut: "⌘⇧9",
      onSelect: () =>
        editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined),
    }),
    new ComponentPickerOption("Quote", {
      icon: <Quote size={16} />,
      keywords: ["block quote", "quotation"],
      keyboardShortcut: "⌘⇧>",
      onSelect: () =>
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createQuoteNode());
          }
        }),
    }),
    new ComponentPickerOption("Code Block", {
      icon: <Code size={16} />,
      keywords: ["javascript", "python", "js", "codeblock", "code"],
      keyboardShortcut: "⌘⌥C",
      onSelect: () =>
        editor.update(() => {
          const selection = $getSelection();

          if ($isRangeSelection(selection)) {
            if (selection.isCollapsed()) {
              $setBlocksType(selection, () => $createCodeNode());
            } else {
              const textContent = selection.getTextContent();
              const codeNode = $createCodeNode();
              selection.insertNodes([codeNode]);
              selection.insertRawText(textContent);
            }
          }
        }),
    }),
    new ComponentPickerOption("Divider", {
      icon: <Minus size={16} />,
      keywords: ["horizontal rule", "divider", "hr", "separator"],
      keyboardShortcut: "⌘⇧-",
      onSelect: () =>
        editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined),
    }),
    new ComponentPickerOption("Align Left", {
      icon: <AlignLeft size={16} />,
      keywords: ["align", "left"],
      onSelect: () => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left"),
    }),
    new ComponentPickerOption("Align Center", {
      icon: <AlignCenter size={16} />,
      keywords: ["align", "center"],
      onSelect: () => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center"),
    }),
    new ComponentPickerOption("Align Right", {
      icon: <AlignRight size={16} />,
      keywords: ["align", "right"],
      onSelect: () => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right"),
    }),
    new ComponentPickerOption("Justify", {
      icon: <AlignJustify size={16} />,
      keywords: ["align", "justify"],
      onSelect: () => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify"),
    }),
  ];
}

const ComponentPickerMenuPlugin = () => {
  const [editor] = useLexicalComposerContext();
  const [queryString, setQueryString] = useState<string | null>(null);
  const [resolution, setResolution] = useState<MenuResolution | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Use Lexical's dynamic positioning
  useDynamicPositioning(
    resolution,
    menuRef.current,
    () => {
      // Reposition callback - called when position needs updating
      console.log('Menu repositioned');
    },
    (isInView) => {
      // Visibility change callback
      console.log('Menu visibility changed:', isInView);
    }
  );
 
  const checkForTriggerMatch = useBasicTypeaheadTriggerMatch("/", {
    allowWhitespace: true,
    minLength: 0,
  });

  const options = useMemo(() => {
    const baseOptions = getBaseOptions(editor);

    if (!queryString) return baseOptions;

    const regex = new RegExp(queryString, "i");
    return baseOptions.filter(
      (option) =>
        regex.test(option.title) ||
        option.keywords.some((keyword) => regex.test(keyword))
    );
  }, [editor, queryString]);

  const onSelectOption = useCallback(
    (
      selectedOption: ComponentPickerOption,
      nodeToRemove: TextNode | null,
      closeMenu: () => void,
      matchingString: string
    ) => {
      editor.update(() => {
        nodeToRemove?.remove();
        selectedOption.onSelect(matchingString);
        closeMenu();
      });
    },
    [editor]
  );

  return (
    <>
      <LexicalTypeaheadMenuPlugin<ComponentPickerOption>
        onQueryChange={setQueryString}
        onSelectOption={onSelectOption}
        triggerFn={checkForTriggerMatch}
        options={options}
        onOpen={setResolution}
        onClose={() => setResolution(null)}
        menuRenderFn={(
          anchorElementRef,
          { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex }
        ) => {
          
          return anchorElementRef.current && options.length
            ? ReactDOM.createPortal(
                <div
                  ref={menuRef}
                  className={cn(
                    "relative min-w-[10rem]",
                    "bg-popover text-popover-foreground",
                    "border border-border rounded-md shadow-lg",
                    "animate-in fade-in-0 duration-200",
                    "z-50 w-64"
                  )}
                >
                  <ul
                    className="p-0 m-0 list-none overflow-y-auto max-h-[200px]"
                    role="listbox"
                    style={{
                      scrollbarWidth: "thin",
                      scrollbarColor:
                        "hsl(var(--muted-foreground)) transparent",
                    }}
                    onWheel={(e) => e.stopPropagation()}
                    onTouchMove={(e) => e.stopPropagation()}
                  >
                    {options.map((option, i: number) => (
                      <ComponentPickerMenuItem
                        key={option.key}
                        index={i}
                        isSelected={selectedIndex === i}
                        onClick={() => {
                          setHighlightedIndex(i);
                          selectOptionAndCleanUp(option);
                        }}
                        onMouseEnter={() => setHighlightedIndex(i)}
                        option={option}
                      />
                    ))}
                  </ul>
                </div>,
                anchorElementRef.current
              )
            : null;
        }}
      />
    </>
  );
};

export default ComponentPickerMenuPlugin;

