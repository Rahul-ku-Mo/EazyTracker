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

    // TODO: Get rid of isImport flag
    if (isImport || parentNode.getNextSibling() != null) {
      parentNode.replace(line);
    } else {
      parentNode.insertBefore(line);
    }

    line.selectNext();
  },
  type: "element",
};

// Custom Code Block Transformer - Only handles triple backticks for code blocks
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

// Custom Inline Code Transformer - Only handles single backticks for inline code
export const INLINE_CODE: TextFormatTransformer = {
  format: ['code'],
  tag: '`',
  intraword: true,
  type: 'text-format',
};

// Filter out the default CODE transformer from TEXT_FORMAT_TRANSFORMERS
const FILTERED_TEXT_FORMAT_TRANSFORMERS = TEXT_FORMAT_TRANSFORMERS.filter(
  transformer => {
    // Remove the default code transformer that uses backticks
    if (transformer.type === 'text-format' && 
        (transformer as TextFormatTransformer).format?.includes('code')) {
      return false;
    }
    return true;
  }
);

export const MARKDOWN_TRANSFORMERS: Array<Transformer> = [
  IMAGE,
  HR,
  CODE_BLOCK, // Our custom code block transformer
  INLINE_CODE, // Our custom inline code transformer
  CHECK_LIST,
  ...ELEMENT_TRANSFORMERS,
  ...MULTILINE_ELEMENT_TRANSFORMERS,
  ...FILTERED_TEXT_FORMAT_TRANSFORMERS, // Use filtered transformers
  ...TEXT_MATCH_TRANSFORMERS,
];

export const AI_ONLY_TEXT_MARKDOWN_TRANSFORMERS: Array<Transformer> = [
  HR,
  CODE_BLOCK, // Our custom code block transformer
  INLINE_CODE, // Our custom inline code transformer
  CHECK_LIST,
  ...ELEMENT_TRANSFORMERS,
  ...MULTILINE_ELEMENT_TRANSFORMERS,
  ...FILTERED_TEXT_FORMAT_TRANSFORMERS, // Use filtered transformers
  ...TEXT_MATCH_TRANSFORMERS,
];
