import MainLayout from "@/layouts/Container";
import { ArrowRight,  FileText, Plus, Globe, Lock, Trash2 } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "@/context/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect } from "react";
import { iconMap } from "@/interfaces/notes";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Note, Category } from "@/interfaces/notes";

import { fetchCategories, createCategory, deleteCategory, createNote, updateNote, deleteNote } from "@/apis/notes";

const NotePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const queryClient = useQueryClient();
  
  // State for UI
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [deleteNoteDialogOpen, setDeleteNoteDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);
  const [createCategoryOpen, setCreateCategoryOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState("hover:text-purple-600");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    category: Category | null;
    type: 'category' | 'note' | null;
    note?: Note | null;
  }>({
    visible: false,
    x: 0,
    y: 0,
    category: null,
    type: null,
    note: null,
  });
  const contextMenuRef = useRef<HTMLDivElement>(null);

  // Handle clicking outside context menu to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        setContextMenu(prev => ({ ...prev, visible: false }));
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setContextMenu(prev => ({ ...prev, visible: false }));
      }
    };

    if (contextMenu.visible) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [contextMenu.visible]);
  
  // Available hover colors
  const hoverColors = [
    { label: "Blue", value: "hover:text-blue-600", color: "rgb(37, 99, 235)" },
    { label: "Green", value: "hover:text-emerald-600", color: "rgb(5, 150, 105)" },
    { label: "Yellow", value: "hover:text-yellow-600", color: "rgb(202, 138, 4)" },
    { label: "Red", value: "hover:text-red-600", color: "rgb(220, 38, 38)" },
    { label: "Purple", value: "hover:text-purple-600", color: "rgb(147, 51, 234)" },
    { label: "Pink", value: "hover:text-pink-600", color: "rgb(219, 39, 119)" },
    { label: "Indigo", value: "hover:text-indigo-600", color: "rgb(79, 70, 229)" },
    { label: "Orange", value: "hover:text-orange-600", color: "rgb(234, 88, 12)" },
  ];

  // Fetch categories from API
  const { data: categories = [], isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: (newCategory) => {
      queryClient.setQueryData(['categories'], (old: Category[] = []) => [...old, newCategory]);
      setCreateCategoryOpen(false);
      setNewCategoryName("");
      setNewCategoryColor("hover:text-purple-600");
      setErrorMessage(null);
      navigate(`/notes/${newCategory.slug}`);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.error || "Failed to create category";
      setErrorMessage(message);
    },
  });

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.setQueryData(['categories'], (old: Category[] = []) => 
        old.filter(cat => cat.id !== categoryToDelete?.id)
      );
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
      if (categoryToDelete?.slug === currentSlug) {
        navigate('/notes');
      }
    },
  });

  // Create note mutation
  const createNoteMutation = useMutation({
    mutationFn: createNote,
    onSuccess: (newNote) => {
      queryClient.setQueryData(['categories'], (old: Category[] = []) => 
        old.map(cat => 
          cat.slug === currentSlug 
            ? { ...cat, notes: [newNote, ...cat.notes] }
            : cat
        )
      );
    },
  });

  // Update note mutation
  const updateNoteMutation = useMutation({
    mutationFn: updateNote,
    onSuccess: (updatedNote) => {
      // Update the specific note in cache
      queryClient.setQueryData(['categories'], (old: Category[] = []) => 
        old.map(cat => ({
          ...cat,
          notes: cat.notes.map(note => 
            note.id === updatedNote.id ? updatedNote : note
          )
        }))
      );
      
      // Also invalidate to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['note', updatedNote.id] });
    },
    onError: (error) => {
      console.error('Error updating note:', error);
    },
  });

  // Delete note mutation
  const deleteNoteMutation = useMutation({
    mutationFn: deleteNote,
    onSuccess: () => {
      queryClient.setQueryData(['categories'], (old: Category[] = []) => 
        old.map(cat => ({
          ...cat,
          notes: cat.notes.filter(note => note.id !== noteToDelete?.id)
        }))
      );
      setDeleteNoteDialogOpen(false);
      setNoteToDelete(null);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.error || "Failed to delete note";
      setErrorMessage(message);
    },
  });
  
  // Determine current content based on slug
  const currentSlug = slug || 'plan';
  const currentCategory = categories.find(cat => cat.slug === currentSlug);
  const currentCards = currentCategory?.notes || [];
  
  // Generate dynamic heading from slug
  const dynamicHeading = currentCategory?.name || (currentSlug.charAt(0).toUpperCase() + currentSlug.slice(1));
  
  const handleCategoryClick = (categorySlug: string) => {
    if (categorySlug === 'plan') {
      navigate('/notes/plan');
    } else {
      navigate(`/notes/${categorySlug}`);
    }
  };

  const handleAddContent = () => {
    if (!currentCategory) return;
    
    createNoteMutation.mutate({
      categoryId: currentCategory.id,
      title: `New ${dynamicHeading} Item`,
      content: `This is a new ${currentSlug} item. Click to edit and customize.`,
      icon: "FileText",
      iconColor: `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`,
      isPublic: false,
    });
  };

  const handleCreateCategory = () => {
    if (!newCategoryName.trim()) return;
    
    createCategoryMutation.mutate({
      name: newCategoryName.trim(),
      hoverColor: newCategoryColor,
    });
  };

  const handleDeleteCategory = (category: Category) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteCategory = () => {
    if (categoryToDelete) {
      deleteCategoryMutation.mutate(categoryToDelete.id);
    }
  };

  const handleDeleteNote = (note: Note) => {
    setNoteToDelete(note);
    setDeleteNoteDialogOpen(true);
  };

  const confirmDeleteNote = () => {
    if (noteToDelete) {
      deleteNoteMutation.mutate(noteToDelete.id);
    }
  };

  if (isLoading) {
    return (
      <MainLayout title="Notes">
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading categories...</div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout title="Notes">
        <div className="flex items-center justify-center py-12">
          <div className="text-destructive">Failed to load categories. Please try again.</div>
        </div>
      </MainLayout>
    );
  }

  // If trying to access a category that doesn't exist, redirect to first available category
  if (currentSlug !== 'plan' && !currentCategory && categories.length > 0) {
    const firstCategory = categories[0];
    navigate(`/notes/${firstCategory.slug}`, { replace: true });
    return null;
  }

  return (
    <MainLayout title={dynamicHeading}>
      <div className="flex flex-col gap-6">
        {/* Navigation Categories with Action Buttons */}
        <div className="flex items-center">
          <div role="navigation" className="flex flex-wrap gap-4 items-center">
            {categories.map((category) => {
              const isActive = currentSlug === category.slug;
              return (
                <div key={category.id} className="group flex items-center gap-2">
                  <h1 
                    onClick={() => handleCategoryClick(category.slug)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setContextMenu({
                        visible: true,
                        x: e.clientX,
                        y: e.clientY,
                        category: category,
                        type: 'category',
                      });
                    }}
                    className={`text-3xl font-bold cursor-pointer transition-colors ease-in-out ${
                      isActive 
                        ? 'text-foreground' 
                        : `text-muted-foreground ${category.hoverColor}`
                    }`}
                    title="Left click to view, right click for options"
                  >
                    {category.name}
                  </h1>
                </div>
              );
            })}
            
            {/* Add New Category Button */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={() => setCreateCategoryOpen(true)}
              disabled={createCategoryMutation.isPending}
              title="Add New Category"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* Add New Note Card - Always shown as first card */}
          {currentCategory && (
            <div
              onClick={handleAddContent}
              className={`group relative flex flex-col p-4 rounded-lg cursor-pointer h-[180px] 
                transition-all duration-200 ease-in-out border-2 border-dashed
                ${isDark 
                  ? 'border-zinc-600 hover:border-zinc-500 hover:bg-zinc-800/50' 
                  : 'border-zinc-300 hover:border-zinc-400 hover:bg-zinc-50'
                } ${createNoteMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex flex-col items-center justify-center h-full">
                <Plus className={`w-8 h-8 mb-3 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`} />
                <h3 className={`text-sm font-medium mb-1 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                  {createNoteMutation.isPending ? 'Creating...' : `Add ${dynamicHeading}`}
                </h3>
                <p className={`text-xs text-center ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>
                  Click to create
                </p>
              </div>
            </div>
          )}

          {/* Empty State for categories with no notes */}
          {currentCards.length === 0 && currentCategory && (
            <div className="col-span-full flex flex-col items-center justify-center py-16">
              <FileText className={`w-16 h-16 mb-4 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`} />
              <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                No {dynamicHeading} Yet
              </h3>
              <p className={`text-sm text-center mb-6 max-w-md ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>
                Get started by creating your first {currentSlug} item. Click the "Add {dynamicHeading}" card above to begin.
              </p>
              <Button
                onClick={handleAddContent}
                disabled={createNoteMutation.isPending}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Create First {dynamicHeading}
              </Button>
            </div>
          )}

          {/* Existing Notes */}
          {currentCards.map((card) => {
            const IconComponent = iconMap[card.icon] || FileText;
            return (
              <div
                key={card.id}
                onClick={() => navigate(`/notes/${card.id}?slug=${currentSlug}&mode=view`)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setContextMenu({
                    visible: true,
                    x: e.clientX,
                    y: e.clientY,
                    category: null,
                    type: 'note',
                    note: card,
                  });
                }}
                className={`group relative flex flex-col p-4 rounded-lg cursor-pointer h-[180px] 
                  transition-all duration-200 ease-in-out
                  ${isDark 
                    ? 'bg-zinc-800 border-zinc-700 hover:bg-zinc-750' 
                    : 'bg-white border-zinc-200 hover:bg-zinc-50'
                  } border`}
                title="Left click to open, right click to delete"
              >
                {/* Privacy indicator - top right corner */}
                <div 
                  className="absolute top-3 right-3 flex items-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateNoteMutation.mutate({
                      id: card.id,
                      isPublic: !card.isPublic
                    });
                  }}
                  title={`Click to make ${card.isPublic ? 'Private' : 'Public'}`}
                >
                  {card.isPublic ? (
                    <Globe className="w-3 h-3 text-emerald-500 cursor-pointer hover:scale-110 transition-transform" />
                  ) : (
                    <Lock className="w-3 h-3 text-zinc-400 cursor-pointer hover:scale-110 transition-transform" />
                  )}
                </div>

                {/* Category with icon */}
                <div className="flex items-center gap-2 mb-3">
                  <IconComponent 
                    className="w-4 h-4" 
                    style={{ color: card.iconColor }}
                  />
                  <span className={`text-xs font-medium uppercase tracking-wide
                    ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                    {currentCategory?.name}
                  </span>
                </div>
                
                {/* Title */}
                <h2 className={`text-base font-semibold mb-2 line-clamp-2 flex items-center gap-2
                  ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                  {card.emoji && (
                    <span className="text-lg flex-shrink-0">{card.emoji}</span>
                  )}
                  <span className="truncate">{card.title}</span>
                </h2>
                
                {/* Description */}
                <p className={`text-sm flex-1 line-clamp-3
                  ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  {card.content}
                </p>
                
                {/* Bottom action area */}
                <div className="flex justify-end items-end mt-auto pt-2">
                  <div className={`flex items-center gap-1 text-xs font-medium opacity-0 
                    group-hover:opacity-100 transition-opacity duration-150 ease-in-out
                    ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                    <span>Open</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Error Message Display */}
        {errorMessage && (
          <div className={`p-4 rounded-lg mb-4 ${isDark ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200'} border`}>
            <p className="text-destructive text-sm">{errorMessage}</p>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setErrorMessage(null)}
              className="mt-2 h-6 px-2 text-xs"
            >
              Dismiss
            </Button>
          </div>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu.visible && (
        <div
          ref={contextMenuRef}
          className={`fixed z-50 min-w-[160px] ${
            isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-zinc-200'
          } border rounded-md shadow-lg`}
          style={{
            left: contextMenu.x,
            top: contextMenu.y,
          }}
        >
          {contextMenu.type === 'category' && contextMenu.category && (
            <div className="">
              <button
                onClick={() => {
                  handleDeleteCategory(contextMenu.category!);
                  setContextMenu(prev => ({ ...prev, visible: false }));
                }}
                className={`w-full px-3 py-2 text-left text-xs font-semibold flex items-center gap-2 hover:bg-red-50 hover:text-red-700 text-red-600 transition-colors ${
                  isDark ? 'hover:bg-red-900/20 hover:text-red-400' : ''
                } ${
                  deleteCategoryMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={deleteCategoryMutation.isPending}
              >
                <Trash2 className="w-3 h-3" />
                Remove {contextMenu.category.name}
              </button>
            </div>
          )}
          
          {contextMenu.type === 'note' && contextMenu.note && (
            <div className="py-1">
              <button
                onClick={() => {
                  handleDeleteNote(contextMenu.note!);
                  setContextMenu(prev => ({ ...prev, visible: false }));
                }}
                className={`w-full px-3 py-2 text-left text-xs font-bold flex items-center gap-2 hover:bg-red-50 hover:text-red-700 text-red-600 transition-colors ${
                  isDark ? 'hover:bg-red-900/20 hover:text-red-400' : ''
                } ${
                  deleteNoteMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={deleteNoteMutation.isPending}
              >
                <Trash2 className="w-3 h-3" />
                Delete {contextMenu.note.title}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Create Category Dialog */}
      <Dialog open={createCategoryOpen} onOpenChange={(open) => {
        setCreateCategoryOpen(open);
        if (!open) setErrorMessage(null);
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {errorMessage && (
              <div className={`p-3 rounded-md ${isDark ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200'} border`}>
                <p className="text-destructive text-sm">{errorMessage}</p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="category-name">Category Name</Label>
              <Input
                id="category-name"
                placeholder="Enter category name..."
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newCategoryName.trim()) {
                    handleCreateCategory();
                  }
                }}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Color Theme</Label>
              <div className="grid grid-cols-4 gap-2">
                {hoverColors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setNewCategoryColor(color.value)}
                    className={`p-3 rounded-lg border text-sm transition-colors ${
                      newCategoryColor === color.value
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:bg-muted'
                    }`}
                  >
                    <div 
                      className="w-4 h-4 rounded-full mx-auto mb-1" 
                      style={{ backgroundColor: color.color }}
                    />
                    {color.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setCreateCategoryOpen(false)}
              disabled={createCategoryMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateCategory}
              disabled={!newCategoryName.trim() || createCategoryMutation.isPending}
            >
              {createCategoryMutation.isPending ? 'Creating...' : 'Create Category'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Category Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className={`${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}>
          <AlertDialogHeader>
            <AlertDialogTitle className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              Remove "{categoryToDelete?.name}" Category
            </AlertDialogTitle>
            <AlertDialogDescription className={`${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              This action will permanently remove the "{categoryToDelete?.name}" category and all{' '}
              <span className="font-medium text-destructive">
                {categoryToDelete?.notes.length || 0} note{(categoryToDelete?.notes.length || 0) !== 1 ? 's' : ''}
              </span>{' '}
              inside it.
              <br />
              <br />
              <span className="font-medium">This cannot be undone.</span> Are you absolutely sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              disabled={deleteCategoryMutation.isPending}
              className={`${isDark ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : ''}`}
            >
              Keep Category
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteCategory}
              disabled={deleteCategoryMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteCategoryMutation.isPending ? 'Removing...' : 'Yes, Remove Category'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Note Confirmation Dialog */}
      <AlertDialog open={deleteNoteDialogOpen} onOpenChange={setDeleteNoteDialogOpen}>
        <AlertDialogContent className={`${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}>
          <AlertDialogHeader>
            <AlertDialogTitle className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              Delete "{noteToDelete?.title}"
            </AlertDialogTitle>
            <AlertDialogDescription className={`${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              This will permanently delete this note and all its content.
              <br />
              <br />
              <span className="font-medium">This action cannot be undone.</span> Are you sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              disabled={deleteNoteMutation.isPending}
              className={`${isDark ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : ''}`}
            >
              Keep Note
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteNote}
              disabled={deleteNoteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteNoteMutation.isPending ? 'Deleting...' : 'Yes, Delete Note'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
};

export default NotePage;
