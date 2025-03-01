import { forwardRef, useEffect, Ref } from "react";
import { INSERT_IMAGE_COMMAND } from "../ImageNode";

export const CopyImagePlugin = forwardRef((props, ref: Ref<any>) => {
  useEffect(() => {
    if (ref && "current" in ref && ref.current) {
      const editor = ref.current;

      const handlePaste = (event: ClipboardEvent) => {
        // Check if event is already being handled
        if (event.defaultPrevented) {
          return;
        }

        const clipboardData = event.clipboardData;
        if (clipboardData) {
          const items = clipboardData.items;

          if (items) {
            for (let i = 0; i < items.length; i++) {
              const item = items[i];

              if (item.type.indexOf("image") !== -1) {
                event.preventDefault();
                const blob = item.getAsFile();

                if (blob) {
                  const reader = new FileReader();

                  reader.onload = function (e) {
                    if (e.target && typeof e.target.result === "string") {
                      const dataURL = e.target.result;

                      // Create image to get dimensions
                      const image = new Image();
                      image.src = dataURL;

                      image.onload = function () {
                        // Dispatch command to insert image directly with dataURL
                        editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
                          src: dataURL,
                          altText: "Pasted image",
                          width: image.width,
                          height: "inherit",
                          showCaption: false,
                          caption: "",
                        });
                      };
                    }
                  };

                  reader.readAsDataURL(blob);
                  break; // Exit after processing first image
                }
              }
            }
          }
        }
      };

      // Store the listener removal function
      let removeListener: (() => void) | null = null;

      // Use Lexical's registerRootListener to manage paste events
      const unregisterRootListener = editor.registerRootListener(
        (rootElement: any, prevRootElement: any) => {
          // Clean up previous listener if it exists
          if (removeListener) {
            removeListener();
            removeListener = null;
          }

          if (rootElement) {
            rootElement.addEventListener("paste", handlePaste);
            removeListener = () =>
              rootElement.removeEventListener("paste", handlePaste);
          }
          if (prevRootElement) {
            prevRootElement.removeEventListener("paste", handlePaste);
          }
        }
      );

      // Clean up on unmount
      return () => {
        unregisterRootListener();
        if (removeListener) {
          removeListener();
        }
      };
    }
  }, [ref]);

  return null;
});
