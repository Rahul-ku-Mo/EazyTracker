import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $getSelection,
  $isRangeSelection,
  LexicalEditor,
} from "lexical";
import { $setBlocksType } from "@lexical/selection";
import {
  INSERT_CHECK_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
} from "@lexical/list";

import { $createHeadingNode, HeadingTagType } from "@lexical/rich-text";
import { $convertFromMarkdownString, $convertToMarkdownString } from "@lexical/markdown";
import { MARKDOWN_TRANSFORMERS as TRANSFORMERS } from "./MARKDOWN_TRANSFORMERS.ts";
import { $isCodeNode, $createCodeNode } from "@lexical/code";

export const formatParagraph = (editor: LexicalEditor) => {
  editor.update(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      $setBlocksType(selection, () => $createParagraphNode());
    }
  });
};

export const formatBulletList = (editor: LexicalEditor, blockType: string) => {
  if (blockType === "bullet") {
    editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
  } else {
    editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
  }
};

export const formatCheckList = (editor: LexicalEditor, blockType: string) => {
  if (blockType === "check") {
    editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined);
  } else {
    editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
  }
};

export const formatNumberedList = (
  editor: LexicalEditor,
  blockType: string
) => {
  if (blockType === "number") {
    editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
  } else {
    editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
  }
};

export const formatHeading = (
  editor: LexicalEditor,
  headingSize: HeadingTagType,
) => {
  editor.update(() => {
    const selection = $getSelection();
    $setBlocksType(selection, () => $createHeadingNode(headingSize));
  });
};

export const convertToMarkdown = (editor: LexicalEditor) => {
  editor.update(() => {
    const root = $getRoot();
    const firstChild = root.getFirstChild();
    if ($isCodeNode(firstChild) && firstChild.getLanguage() === 'markdown') {
      $convertFromMarkdownString(
        firstChild.getTextContent(),
        TRANSFORMERS
      );
    } else {
      const markdown = $convertToMarkdownString(TRANSFORMERS);
      const codeNode = $createCodeNode('markdown');
      codeNode.append($createTextNode(markdown));
      root.clear().append(codeNode);
      if (markdown.length === 0) {
        codeNode.select();
      }
    }
  });
};
