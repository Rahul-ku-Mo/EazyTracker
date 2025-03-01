import type { JSX } from "react";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $wrapNodeInElement } from "@lexical/utils";
import {
  $createParagraphNode,
  $insertNodes,
  $isRootOrShadowRoot,
  COMMAND_PRIORITY_EDITOR,
} from "lexical";
import { useEffect } from "react";

import { INSERT_IMAGE_COMMAND } from "../ImageNode";
import { $createImageNode, ImageNode, ImagePayload } from "../ImageNode";

export type InsertImagePayload = Readonly<ImagePayload>;

export function ImagesPlugin({
  captionsEnabled,
}: {
  captionsEnabled?: boolean;
}): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([ImageNode])) {
      throw new Error("ImagesPlugin: ImageNode not registered on editor");
    }

    return editor.registerCommand<InsertImagePayload>(
      INSERT_IMAGE_COMMAND,
      (payload) => {
        // Create the node inside this callback
        const imageNode = $createImageNode(payload);
        $insertNodes([imageNode]);

        // Check if parent is root AFTER inserting
        if ($isRootOrShadowRoot(imageNode.getParentOrThrow())) {
          $wrapNodeInElement(imageNode, $createParagraphNode).selectEnd();
        }
        return true;
      },
      COMMAND_PRIORITY_EDITOR
    );
  }, [captionsEnabled, editor]);

  return null;
}
