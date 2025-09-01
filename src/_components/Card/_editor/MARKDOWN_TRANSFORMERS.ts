import {
  CHECK_LIST,
  ELEMENT_TRANSFORMERS,
  ElementTransformer,
  MULTILINE_ELEMENT_TRANSFORMERS,
  TEXT_FORMAT_TRANSFORMERS,
  TEXT_MATCH_TRANSFORMERS,
  TextMatchTransformer,
  Transformer,
  TextFormatTransformer,
} from "@lexical/markdown";
import {
  $createHorizontalRuleNode,
  $isHorizontalRuleNode,
  HorizontalRuleNode,
} from "@lexical/react/LexicalHorizontalRuleNode";
import { LexicalNode } from "lexical";
import { $createImageNode, $isImageNode, ImageNode } from "./ImageNode";
import { $createCodeNode, $isCodeNode, CodeNode } from "@lexical/code";

export const IMAGE: TextMatchTransformer = {
  dependencies: [ImageNode],  
  export: (node) => {
    if (!$isImageNode(node)) {
      return null;
    }

    return `![${node.getAltText()}](${node.getSrc()})`;
  },
  importRegExp: /!(?:\[([^[]*)\])(?:\(([^(]+)\))/,
  regExp: /!(?:\[([^[]*)\])(?:\(([^(]+)\))$/,
  replace: (textNode, match) => {
    const [, altText, src] = match;
    const imageNode = $createImageNode({
      altText,
      src,
    });
    textNode.replace(imageNode);
  },
  trigger: ')',
  type: 'text-match',
};

export const HR: ElementTransformer = {
  dependencies: [HorizontalRuleNode],
  export: (node: LexicalNode) => {
    return $isHorizontalRuleNode(node) ? "***" : null;
  },
  regExp: /^(---|\*\*\*|___)\s?$/,
  replace: (parentNode, _1, _2, isImport) => {
    const line = $createHorizontalRuleNode();

    if (isImport || parentNode.getNextSibling() != null) {
      parentNode.replace(line);
    } else {
      parentNode.insertBefore(line);
    }

    line.selectNext();
  },
  type: "element",
};

// Improved Code Block Transformer
export const CODE_BLOCK: ElementTransformer = {
  dependencies: [CodeNode],
  export: (node: LexicalNode) => {
    if (!$isCodeNode(node)) {
      return null;
    }
    const textContent = node.getTextContent();
    const language = node.getLanguage();
    return `\`\`\`${language || ''}\n${textContent}\n\`\`\``;
  },
  regExp: /^```(\w{1,10})?\s?$/,
  replace: (parentNode, children, match) => {
    const language = match[1] || '';
    const codeNode = $createCodeNode(language);
    codeNode.append(...children);
    parentNode.replace(codeNode);
  },
  type: "element",
};

// Improved Inline Code Transformer
export const INLINE_CODE: TextFormatTransformer = {
  format: ['code'],
  tag: '`',
  // Remove intraword to prevent conflicts
  intraword: false,
  type: 'text-format',
};

// More robust filtering of default code transformer
const FILTERED_TEXT_FORMAT_TRANSFORMERS = TEXT_FORMAT_TRANSFORMERS.filter(
  transformer => {
    if (transformer.type === 'text-format') {
      const textFormatter = transformer as TextFormatTransformer;
      // Filter out any transformer that uses backticks
      if (textFormatter.tag === '`' || textFormatter.format?.includes('code')) {
        return false;
      }
    }
    return true;
  }
);

// Improved transformer order - put inline code early to avoid conflicts
export const MARKDOWN_TRANSFORMERS: Array<Transformer> = [
  // Text match transformers first (they're more specific)
  IMAGE,
  ...TEXT_MATCH_TRANSFORMERS,
  
  // Element transformers
  HR,
  CODE_BLOCK,
  CHECK_LIST,
  ...ELEMENT_TRANSFORMERS,
  ...MULTILINE_ELEMENT_TRANSFORMERS,
  
  // Text format transformers last, with inline code early in this group
  INLINE_CODE,
  ...FILTERED_TEXT_FORMAT_TRANSFORMERS,
];

export const AI_ONLY_TEXT_MARKDOWN_TRANSFORMERS: Array<Transformer> = [
  // Same order but without IMAGE
  ...TEXT_MATCH_TRANSFORMERS,
  
  HR,
  CODE_BLOCK,
  CHECK_LIST,
  ...ELEMENT_TRANSFORMERS,
  ...MULTILINE_ELEMENT_TRANSFORMERS,
  
  INLINE_CODE,
  ...FILTERED_TEXT_FORMAT_TRANSFORMERS,
];