// ImageNode.tsx - A simplified version of the ImageNode for Lexical Editor

import { $applyNodeReplacement, createCommand, DecoratorNode } from "lexical";
import type { DOMExportOutput, LexicalNode, NodeKey } from "lexical";
import * as React from "react";
import { Suspense, useRef } from "react";

// Define the image payload interface
export interface ImagePayload {
  src: string;
  altText: string;
  width?: number;
  height?: number;
  showCaption?: boolean;
  caption?: string;
  key?: NodeKey;
}

// Create a command to insert images
export const INSERT_IMAGE_COMMAND = createCommand("INSERT_IMAGE_COMMAND");

// Simple image component that displays the image and optional caption
const ImageComponent = ({
  src,
  altText,
  width,
  height,
  showCaption,
  caption,
  nodeKey,
}: {
  src: string;
  altText: string;
  width: number | "inherit";
  height: number | "inherit";
  showCaption: boolean;
  caption: string;
  nodeKey: NodeKey;
}) => {
  const imageRef = useRef<HTMLImageElement>(null);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="image-container" key={nodeKey}>
        <img
          src={src}
          alt={altText}
          ref={imageRef}
          style={{
            width: width !== "inherit" ? width : undefined,
            height: height !== "inherit" ? height : undefined,
            maxWidth: "100%",
          }}
          draggable="false"
          className="lexical-image"
        />

        {showCaption && caption && (
          <div className="image-caption-container">
            <div className="ImageNode__contentEditable" contentEditable>
              <span className="ImageNode__placeholder">Enter a caption...</span>
            </div>
          </div>
        )}
      </div>
    </Suspense>
  );
};

// The actual ImageNode class
export class ImageNode extends DecoratorNode<React.JSX.Element> {
  __src: string;
  __altText: string;
  __width: number | "inherit";
  __height: number | "inherit";
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
    width?: number | "inherit",
    height?: number | "inherit",
    showCaption?: boolean,
    caption?: string,
    key?: NodeKey
  ) {
    super(key);
    this.__src = src;
    this.__altText = altText;
    this.__width = width || "inherit";
    this.__height = height || "inherit";
    this.__showCaption = showCaption || false;
    this.__caption = caption || "";
  }

  // Export to DOM for serialization
  exportDOM(): DOMExportOutput {
    const element = document.createElement("img");
    element.setAttribute("src", this.__src);
    element.setAttribute("alt", this.__altText);
    if (this.__width !== "inherit") {
      element.setAttribute("width", this.__width.toString());
    }
    if (this.__height !== "inherit") {
      element.setAttribute("height", this.__height.toString());
    }
    return { element };
  }

  // Create DOM node
  createDOM(): HTMLElement {
    const div = document.createElement("div");
    div.className = "editor-image";
    return div;
  }

  // We don't need to update the DOM ourselves
  updateDOM(): false {
    return false;
  }

  // Getters
  getSrc(): string {
    return this.__src;
  }

  getAltText(): string {
    return this.__altText;
  }

  // Setters
  setWidthAndHeight(
    width: number | "inherit",
    height: number | "inherit"
  ): void {
    const writable = this.getWritable();
    writable.__width = width;
    writable.__height = height;
  }

  setShowCaption(showCaption: boolean): void {
    const writable = this.getWritable();
    writable.__showCaption = showCaption;
  }

  // Render the node with React
  decorate(): React.JSX.Element {
    return (
      <ImageComponent
        src={this.__src}
        altText={this.__altText}
        width={this.__width}
        height={this.__height}
        showCaption={this.__showCaption}
        caption={this.__caption}
        nodeKey={this.getKey()}
      />
    );
  }
}

// Helper function to create an ImageNode
export function $createImageNode(payload: ImagePayload): ImageNode {
  return $applyNodeReplacement(
    new ImageNode(
      payload.src,
      payload.altText,
      payload.width,
      payload.height,
      payload.showCaption,
      payload.caption,
      payload.key
    )
  );
}

// Helper function to check if a node is an ImageNode
export function $isImageNode(
  node: LexicalNode | null | undefined
): node is ImageNode {
  return node instanceof ImageNode;
}
