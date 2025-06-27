/**
 * Utility functions for the Notes editor component.
 * 
 * This module contains helper functions used by the rich text editor,
 * particularly for handling DOM selection, positioning of floating elements,
 * and working with Lexical editor selections.
 * 
 * @module NotesEditorUtils
 */

import {$isAtNodeEnd} from '@lexical/selection';
import {ElementNode, RangeSelection, TextNode} from 'lexical';

export const VERTICAL_GAP = 10;
export const HORIZONTAL_OFFSET = 5;

/**
 * Gets the bounding rectangle of a DOM selection range.
 * 
 * This function calculates the position and dimensions of the current text selection
 * or cursor position within the editor. It handles two scenarios:
 * 1. When the selection anchor is at the root element level, it finds the innermost
 *    child element and uses its bounding rectangle
 * 2. When the selection is within content, it uses the range's bounding rectangle directly
 * 
 * This is commonly used for positioning floating UI elements like toolbars, tooltips,
 * or menus relative to the user's text selection.
 * 
 * @param nativeSelection - The browser's native Selection object containing the current selection
 * @param rootElement - The root HTML element of the editor container
 * @returns The DOMRect object containing the position and dimensions of the selection (x, y, width, height)
 * 
 */
export function getDOMRangeRect(
    nativeSelection: Selection,
    rootElement: HTMLElement,
  ): DOMRect {
    const domRange = nativeSelection.getRangeAt(0);
  
    let rect;
  
    if (nativeSelection.anchorNode === rootElement) {
      let inner = rootElement;
      while (inner.firstElementChild != null) {
        inner = inner.firstElementChild as HTMLElement;
      }
      rect = inner.getBoundingClientRect();
    } else {
      rect = domRange.getBoundingClientRect();
    }
  
    return rect;
  }

/**
 * Gets the selected node from a Lexical RangeSelection.
 * 
 * This function determines which node should be considered "selected" when dealing
 * with a range selection in the Lexical editor. It handles various selection scenarios:
 * 
 * 1. **Same node selection**: When both anchor and focus are on the same node
 * 2. **Forward selection**: When selecting from left to right
 * 3. **Backward selection**: When selecting from right to left
 * 
 * The function uses Lexical's selection utilities to determine if the selection
 * ends at a node boundary, which helps in choosing the correct node for operations
 * like formatting or node manipulation.
 * 
 * @param selection - The Lexical RangeSelection object containing selection information
 * @returns The selected TextNode or ElementNode that should be considered active
 */
export function getSelectedNode(
  selection: RangeSelection,
): TextNode | ElementNode {
  const anchor = selection.anchor;
  const focus = selection.focus;
  const anchorNode = selection.anchor.getNode();
  const focusNode = selection.focus.getNode();
  
  // If anchor and focus are on the same node, return that node
  if (anchorNode === focusNode) {
    return anchorNode;
  }
  
  const isBackward = selection.isBackward();
  
  // For backward selections, check if focus is at node end
  if (isBackward) {
    return $isAtNodeEnd(focus) ? anchorNode : focusNode;
  } else {
    // For forward selections, check if anchor is at node end
    return $isAtNodeEnd(anchor) ? anchorNode : focusNode;
  }
}

export function setFloatingElemPosition(
  targetRect: DOMRect | null,
  floatingElem: HTMLElement,
  anchorElem: HTMLElement,
  isLink: boolean = false,
  verticalGap: number = VERTICAL_GAP,
  horizontalOffset: number = HORIZONTAL_OFFSET,
): void {
  const scrollerElem = anchorElem.parentElement;

  if (targetRect === null || !scrollerElem) {
    floatingElem.style.opacity = '0';
    floatingElem.style.transform = 'translate(-10000px, -10000px)';
    return;
  }

  const floatingElemRect = floatingElem.getBoundingClientRect();
  const anchorElementRect = anchorElem.getBoundingClientRect();
  const editorScrollerRect = scrollerElem.getBoundingClientRect();

  let top = targetRect.top - floatingElemRect.height - verticalGap;
  let left = targetRect.left - horizontalOffset;

  // Check if text is end-aligned
  const selection = window.getSelection();
  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const textNode = range.startContainer;
    if (textNode.nodeType === Node.ELEMENT_NODE || textNode.parentElement) {
      const textElement =
        textNode.nodeType === Node.ELEMENT_NODE
          ? (textNode as Element)
          : (textNode.parentElement as Element);
      const textAlign = window.getComputedStyle(textElement).textAlign;

      if (textAlign === 'right' || textAlign === 'end') {
        // For end-aligned text, position the toolbar relative to the text end
        left = targetRect.right - floatingElemRect.width + horizontalOffset;
      }
    }
  }

  if (top < editorScrollerRect.top) {
    // adjusted height for link element if the element is at top
    top +=
      floatingElemRect.height +
      targetRect.height +
      verticalGap * (isLink ? 9 : 2);
  }

  if (left + floatingElemRect.width > editorScrollerRect.right) {
    left = editorScrollerRect.right - floatingElemRect.width - horizontalOffset;
  }

  if (left < editorScrollerRect.left) {
    left = editorScrollerRect.left + horizontalOffset;
  }

  top -= anchorElementRect.top;
  left -= anchorElementRect.left;

  floatingElem.style.opacity = '1';
  floatingElem.style.transform = `translate(${left}px, ${top}px)`;
}