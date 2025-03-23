// ImageNode.tsx - A simplified version of the ImageNode for Lexical Editor

import { Loader } from "lucide-react";
import {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from "lexical";
import { createCommand } from "lexical";
import { $applyNodeReplacement, DecoratorNode } from "lexical";
import { useUploadFileProgressStore } from "@/store/uploadFileProgressStore";

export const INSERT_IMAGE_COMMAND = createCommand<ImagePayload>("INSERT_IMAGE_COMMAND");

export interface ImagePayload {
  src: string;
  altText: string;
  width?: number | string;
  height?: string | number;
  showCaption?: boolean;
  caption?: string;
  key?: NodeKey;
  isUploading?: boolean;
}

export type SerializedImageNode = Spread<
  {
    src: string;
    altText: string;
    width?: number | string;
    height?: number | string;
    showCaption?: boolean;
    caption?: string;
    type: "image";
    version: 1;
  },
  SerializedLexicalNode
>;


export interface ImageComponentProps {
  src: string;
  altText: string;
  width?: number | string;
  height?: number | string;
  showCaption?: boolean;
  caption?: string;
  nodeKey?: NodeKey;
}

export function ImageComponent({
  src,
  altText,
  width,
  height,
  showCaption,
  caption,
  nodeKey,
}: ImageComponentProps): JSX.Element {

  const imageUploadStatusMap = useUploadFileProgressStore((state) => state.imageUploadStatusMap);

  const isLoading = nodeKey ? imageUploadStatusMap.get(altText) === "uploading" : false;
  
  return (
    <div className="image-container relative">
      <div className={`transition-opacity duration-300 ${isLoading ? 'opacity-30' : 'opacity-100'}`}>
        <img
          src={src}
          alt={altText}
          style={{ width, height }}
          draggable="false"
          className="rounded-md"
        />
      </div>
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="bg-black/30 p-3 rounded-full">
            <Loader className="h-8 w-8 text-white animate-spin" />
          </div>
          <span className="sr-only">Uploading image...</span>
        </div>
      )}
      
      {showCaption && (
        <div className="image-caption mt-2 text-sm text-gray-500 dark:text-gray-400">
          {caption}
        </div>
      )}
    </div>
  );
}

/***Conversion Function for Image Node */
export function $convertImageElement(domNode: Node): null | DOMConversionOutput {
  const img = domNode as HTMLImageElement;
 
  if (img.src.startsWith('file:///')) {
    return null;
  }

  const {alt: altText, src, width, height} = img;
  const node = $createImageNode({altText, height, src, width});
  return {node};
}

export class ImageNode extends DecoratorNode<JSX.Element> {
  __src: string;
  __altText: string;
  __width: number | string;
  __height: number | string;
  __showCaption: boolean;
  __caption: string;

  static getType(): string {
    return "image";
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(
      node.__src,
      node.__altText,
      node.__width,
      node.__height,
      node.__showCaption,
      node.__caption,
      node.__key
    );
  }

  constructor(
    src: string,
    altText: string,
    width?: number | string,
    height?: number | string,
    showCaption?: boolean,
    caption?: string,
    key?: NodeKey
  ) {
    super(key);
    this.__src = src;
    this.__altText = altText;
    this.__width = width || "auto";
    this.__height = height || "auto";
    this.__showCaption = showCaption || false;
    this.__caption = caption || "";
  }

  // Setters and getters
  getSrc(): string {
    return this.__src;
  }

  setSrc(src: string): void {
    const writable = this.getWritable();
    writable.__src = src;
  }

  getAltText(): string {
    return this.__altText;
  }

  setAltText(altText: string): void {
    const writable = this.getWritable();
    writable.__altText = altText;
  }

  getWidth(): number | string {
    return this.__width;
  }

  setWidth(width: number | string): void {
    const writable = this.getWritable();
    writable.__width = width;
  }

  getHeight(): number | string {
    return this.__height;
  }

  setHeight(height: number | string): void {
    const writable = this.getWritable();
    writable.__height = height;
  }

  getShowCaption(): boolean {
    return this.__showCaption;
  }

  setShowCaption(showCaption: boolean): void {
    const writable = this.getWritable();
    writable.__showCaption = showCaption;
  }

  getCaption(): string {
    return this.__caption;
  }

  setCaption(caption: string): void {
    const writable = this.getWritable();
    writable.__caption = caption;
  }

  createDOM(): HTMLElement {
    const div = document.createElement("div");
    div.className = "image-wrapper";
    return div;
  }

  static importDOM(): DOMConversionMap | null {
    return {
      img: () => ({
        conversion: $convertImageElement,
        priority: 0,
      }),
    };
  }

  updateDOM(): false {
    return false;
  }

  decorate(): JSX.Element {
    return (
      <ImageComponent
        src={this.__src}
        altText={this.__altText}
        width={this.__width}
        height={this.__height}
        showCaption={this.__showCaption}
        caption={this.__caption}
        nodeKey={this.__key}
      />
    );
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement("img");
    element.setAttribute("src", this.__src);
    element.setAttribute("alt", this.__altText);
    if (this.__width) element.setAttribute("width", this.__width.toString());
    if (this.__height) element.setAttribute("height", this.__height.toString());
    return { element };
  }

  static importJSON(serializedNode: SerializedImageNode): ImageNode {
    const { src, altText, width, height, showCaption, caption } = serializedNode;
    const node = $createImageNode({
      src,
      altText,
      width,
      height,
      showCaption,
      caption,
    });
    return node;
  }

  exportJSON(): SerializedImageNode {
    return {
      type: "image",
      version: 1,
      src: this.__src,
      altText: this.__altText,
      width: this.__width,
      height: this.__height,
      showCaption: this.__showCaption,
      caption: this.__caption,
    };
  }
}

export function $createImageNode({
  src,
  altText,
  width,
  height,
  showCaption,
  caption,
  key,
}: ImagePayload): ImageNode {
  return $applyNodeReplacement(
    new ImageNode(src, altText, width, height, showCaption, caption, key)
  );
}

export function $isImageNode(node: LexicalNode | null | undefined): node is ImageNode {
  return node instanceof ImageNode;
}
