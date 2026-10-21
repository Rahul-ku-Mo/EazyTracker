import { create } from 'zustand';

export type EditorType = 'comment' | 'reply' | 'edit';

export interface EditorState {
  /** Unique identifier for the editor instance */
  id: string;
  /** Type of editor */
  type: EditorType;
  /** ID of the comment being edited (for edit type) */
  commentId?: number;
  /** ID of the parent comment (for reply type) */
  parentCommentId?: number;
  /** ID of the card this editor belongs to */
  cardId: number;
}

interface CommentReplyStore {
  /** Currently active editor */
  activeEditor: EditorState | null;
  
  /** History of recently active editors for cleanup */
  editorHistory: EditorState[];
  
  /** Set an editor as active, deactivating any previous one */
  setActiveEditor: (editor: EditorState) => void;
  
  /** Deactivate the currently active editor */
  deactivateEditor: () => void;
  
  /** Deactivate a specific editor by ID */
  deactivateEditorById: (editorId: string) => void;
  
  /** Check if a specific editor is active */
  isEditorActive: (editorId: string) => boolean;
  
  /** Check if any editor of a specific type is active */
  isEditorTypeActive: (type: EditorType) => boolean;
  
  /** Check if any editor for a specific card is active */
  isCardEditorActive: (cardId: number) => boolean;
  
  /** Get the active editor for a specific card */
  getActiveEditorForCard: (cardId: number) => EditorState | null;
  
  /** Clear all editors for a specific card */
  clearEditorsForCard: (cardId: number) => void;
  
  /** Clear all editors */
  clearAllEditors: () => void;
  
  /** Get editor state by ID */
  getEditorById: (editorId: string) => EditorState | null;
}

export const useCommentReplyStore = create<CommentReplyStore>((set, get) => ({
  activeEditor: null,
  editorHistory: [],
  
  setActiveEditor: (editor: EditorState) => {
    const { activeEditor, editorHistory } = get();
    
    // If there's already an active editor, deactivate it first
    if (activeEditor && activeEditor.id !== editor.id) {
      set({
        activeEditor: editor,
        editorHistory: [activeEditor, ...editorHistory.slice(0, 4)], // Keep last 5 for history
      });
    } else {
      set({
        activeEditor: editor,
        editorHistory: activeEditor && activeEditor.id !== editor.id 
          ? [activeEditor, ...editorHistory.slice(0, 4)]
          : editorHistory,
      });
    }
  },
  
  deactivateEditor: () => {
    const { activeEditor, editorHistory } = get();
    if (activeEditor) {
      set({
        activeEditor: null,
        editorHistory: [activeEditor, ...editorHistory.slice(0, 4)],
      });
    }
  },
  
  deactivateEditorById: (editorId: string) => {
    const { activeEditor, editorHistory } = get();
    if (activeEditor?.id === editorId) {
      set({
        activeEditor: null,
        editorHistory: [activeEditor, ...editorHistory.slice(0, 4)],
      });
    }
  },
  
  isEditorActive: (editorId: string) => {
    const { activeEditor } = get();
    return activeEditor?.id === editorId;
  },
  
  isEditorTypeActive: (type: EditorType) => {
    const { activeEditor } = get();
    return activeEditor?.type === type;
  },
  
  isCardEditorActive: (cardId: number) => {
    const { activeEditor } = get();
    return activeEditor?.cardId === cardId;
  },
  
  getActiveEditorForCard: (cardId: number) => {
    const { activeEditor } = get();
    return activeEditor?.cardId === cardId ? activeEditor : null;
  },
  
  clearEditorsForCard: (cardId: number) => {
    const { activeEditor, editorHistory } = get();
    
    // If the active editor belongs to this card, deactivate it
    if (activeEditor?.cardId === cardId) {
      set({
        activeEditor: null,
        editorHistory: [activeEditor, ...editorHistory.filter(e => e.cardId !== cardId)],
      });
    } else {
      // Just remove from history
      set({
        editorHistory: editorHistory.filter(e => e.cardId !== cardId),
      });
    }
  },
  
  clearAllEditors: () => {
    set({
      activeEditor: null,
      editorHistory: [],
    });
  },
  
  getEditorById: (editorId: string) => {
    const { activeEditor, editorHistory } = get();
    
    if (activeEditor?.id === editorId) {
      return activeEditor;
    }
    
    return editorHistory.find(e => e.id === editorId) || null;
  },
}));

// Helper functions to generate editor IDs
export const generateEditorId = {
  comment: (cardId: number) => `comment-${cardId}`,
  reply: (cardId: number, parentCommentId: number) => `reply-${cardId}-${parentCommentId}`,
  edit: (cardId: number, commentId: number) => `edit-${cardId}-${commentId}`,
};

// Helper hooks for common use cases
export const useCommentEditor = (cardId: number) => {
  const store = useCommentReplyStore();
  const editorId = generateEditorId.comment(cardId);
  
  return {
    isActive: store.isEditorActive(editorId),
    activate: () => store.setActiveEditor({
      id: editorId,
      type: 'comment',
      cardId,
    }),
    deactivate: () => store.deactivateEditorById(editorId),
  };
};

export const useReplyEditor = (cardId: number, parentCommentId: number) => {
  const store = useCommentReplyStore();
  const editorId = generateEditorId.reply(cardId, parentCommentId);
  
  return {
    isActive: store.isEditorActive(editorId),
    activate: () => store.setActiveEditor({
      id: editorId,
      type: 'reply',
      cardId,
      parentCommentId,
    }),
    deactivate: () => store.deactivateEditorById(editorId),
  };
};

export const useEditEditor = (cardId: number, commentId: number) => {
  const store = useCommentReplyStore();
  const editorId = generateEditorId.edit(cardId, commentId);
  
  return {
    isActive: store.isEditorActive(editorId),
    activate: () => store.setActiveEditor({
      id: editorId,
      type: 'edit',
      cardId,
      commentId,
    }),
    deactivate: () => store.deactivateEditorById(editorId),
  };
};
