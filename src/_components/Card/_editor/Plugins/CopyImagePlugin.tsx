import { forwardRef, useEffect, Ref } from "react";
import { $getNodeByKey } from "lexical";
import { INSERT_IMAGE_COMMAND } from "../ImageNode";
import { ImageNode } from "../ImageNode";

import axios, { AxiosResponse } from "axios";
import Cookies from "js-cookie";
import { useUploadFileProgressStore } from "@/store/uploadFileProgressStore";

type S3ResponseT = {
  preSignedUrl: string;
  key: string;
}

// Helper function to upload image to S3 using pre-signed URL
async function uploadImageToS3(file: File): Promise<string> {
  try {
    // Generate a unique filename with extension
    const fileName = `image-${Date.now()}.${file.type.split('/')[1] || 'png'}`;
    
    // 1. Get pre-signed URL from your server
    const urlResponse: AxiosResponse<S3ResponseT> = await axios.post(`${import.meta.env.VITE_API_URL}/aws/upload`, {
      fileName,
      fileType: file.type
    }, {
      headers: {
        'Authorization': `Bearer ${Cookies.get('accessToken')}`
      }
    });
    
    const { preSignedUrl: upload_URL , key } = urlResponse.data;
    
    // 2. Upload directly to S3
    await axios.put(upload_URL, file);
    
    // 3. Confirm upload with backend for tracking
    await axios.post(`${import.meta.env.VITE_API_URL}/aws/confirm-upload`, {
      key,
      fileName,
      fileSize: file.size,
      mimeType: file.type
    }, {
      headers: {
        'Authorization': `Bearer ${Cookies.get('accessToken')}`
      }
    });
    
    return `https://${import.meta.env.VITE_AWS_S3_BUCKET}.s3.${import.meta.env.VITE_AWS_REGION || 'ap-south-1'}.amazonaws.com/${key}`
  } catch (error) {
    console.error('Failed to upload image:', error);
    
    // Handle specific error cases
    if ((error as any).response?.status === 403) {
      throw new Error('Image upload limit reached. Please upgrade your plan to upload more images.');
    }
    
    throw error;
  }
}

export const CopyImagePlugin = forwardRef((_, ref: Ref<any>) => {
  
  const {setImageUploadStatusMap, imageUploadStatusMap} = useUploadFileProgressStore((state) => state);

  useEffect(() => {
    if (ref && "current" in ref && ref.current) {
      const editor = ref.current;

      // Add a custom command to update image source
      editor.registerCommand(
        'UPDATE_IMAGE_SOURCE',
        (payload: { nodeKey: string; src: string }) => {
          const { nodeKey, src } = payload;
          
          editor.update(() => {
            const node = $getNodeByKey(nodeKey);
            if (node instanceof ImageNode) {
              node.setSrc(src);
              
              // Remove this node from uploads in progress
              if(node.__src.includes(`https://${import.meta.env.VITE_AWS_S3_BUCKET}.s3.ap-south-1.amazonaws.com/`)) {

                setImageUploadStatusMap(new Map(imageUploadStatusMap.set(nodeKey, "completed")));
              }
              // Force re-render of node to remove overlay
              node.markDirty();
            }
          });
          
          return true;
        },
        0
      );

      const handlePaste = async (event: ClipboardEvent) => {
        if (event.defaultPrevented) return;

        const clipboardData = event.clipboardData;
        if (!clipboardData) return;

        const items = clipboardData.items;
        if (!items) return;

        for (let i = 0; i < items.length; i++) {
          const item = items[i];

          if (item.type.indexOf("image") !== -1) {
            event.preventDefault();
            const file = item.getAsFile();

            if (file) {
              const reader = new FileReader();

              reader.onload = async function (e) {
                if (e.target && typeof e.target.result === "string") {
                  const dataURL = e.target.result;

                  // Create image to get dimensions
                  const image = new Image();
                  image.src = dataURL;

                  setImageUploadStatusMap(new Map(imageUploadStatusMap.set(file.name, "uploading")));
                 
                  image.onload = async function () {
                    // Insert image with temporary data URL
                    editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
                      src: dataURL,
                      altText: file.name,
                      width: image.width,
                      height: "inherit",
                      showCaption: false,
                      caption: "",
                      isUploading: true
                    });

                    try {
                      const s3URL = await uploadImageToS3(file);
                      
                      // Success - update the image node with the S3 URL
                      editor.update(() => {
                        const nodes = editor._editorState._nodeMap;
                        let targetNodeKey: string | null = null;

                        nodes.forEach((node: any, key: any) => {
                          if (node instanceof ImageNode && node.__src === dataURL) {
                            targetNodeKey = key;
                            setImageUploadStatusMap(new Map(imageUploadStatusMap.set(file.name, "completed")));
                          }
                        });

                        if (targetNodeKey) {
                          const node = $getNodeByKey(targetNodeKey);
                          if (node instanceof ImageNode) {
                           node.setSrc(s3URL);
                          }
                        }
                      });
                    } catch (uploadError) {
                      console.error('Image upload failed:', uploadError);
                      
                      // Mark upload as failed and show error
                      setImageUploadStatusMap(new Map(imageUploadStatusMap.set(file.name, "failed")));
                      
                      // Remove the failed image node
                      editor.update(() => {
                        const nodes = editor._editorState._nodeMap;
                        let targetNodeKey: string | null = null;

                        nodes.forEach((node: any, key: any) => {
                          if (node instanceof ImageNode && node.__src === dataURL) {
                            targetNodeKey = key;
                          }
                        });

                        if (targetNodeKey) {
                          const node = $getNodeByKey(targetNodeKey);
                          if (node instanceof ImageNode) {
                            node.remove();
                          }
                        }
                      });
                      
                      // Show user-friendly error message
                      const errorMessage = (uploadError as any).message || 'Failed to upload image';
                      alert(errorMessage); // You might want to use a toast notification instead
                    }



                   
                  };
                }
              };

              reader.readAsDataURL(file);
              break;
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
  }, [imageUploadStatusMap, ref, setImageUploadStatusMap]);

  return null;
});

