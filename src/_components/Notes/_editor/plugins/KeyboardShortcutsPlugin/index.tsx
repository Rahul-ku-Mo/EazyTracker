import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  KEY_DOWN_COMMAND,
  FORMAT_TEXT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  COMMAND_PRIORITY_EDITOR,
} from "lexical";
import { useEffect } from "react";
import { mergeRegister } from "@lexical/utils";

export const KeyboardShortcutsPlugin = () => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        KEY_DOWN_COMMAND,
        (event: KeyboardEvent) => {
          const { ctrlKey, metaKey, key, shiftKey, altKey } = event;
          const isModKey = ctrlKey || metaKey;

          if (!isModKey) return false;

          switch (key.toLowerCase()) {
            case "b":
              if (!shiftKey && !altKey) {
                event.preventDefault();
                editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
                return true;
              }
              break;
            case "i":
              if (!shiftKey && !altKey) {
                event.preventDefault();
                editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
                return true;
              }
              break;
            case "u":
              if (!shiftKey && !altKey) {
                event.preventDefault();
                editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
                return true;
              }
              break;
            case "z":
              if (!shiftKey && !altKey) {
                event.preventDefault();
                editor.dispatchCommand(UNDO_COMMAND, undefined);
                return true;
              } else if (shiftKey && !altKey) {
                event.preventDefault();
                editor.dispatchCommand(REDO_COMMAND, undefined);
                return true;
              }
              break;
            case "y":
              if (!shiftKey && !altKey) {
                event.preventDefault();
                editor.dispatchCommand(REDO_COMMAND, undefined);
                return true;
              }
              break;
            case "s":
              if (!shiftKey && !altKey) {
                event.preventDefault();
                // Save functionality - we'll trigger the save callback
                const saveEvent = new CustomEvent("lexical-save");
                document.dispatchEvent(saveEvent);
                return true;
              }
              break;
          }

          return false;
        },
        COMMAND_PRIORITY_EDITOR
      )
    );
  }, [editor]);

  return null;
};
