import { Check, Palette } from "lucide-react";
import clsx from "clsx";
import useBoardForm from "@/hooks/useBoardForm";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Macintosh-inspired colors with better contrast
const macColors = [
  { id: "board-blue", color: "#3B82F6", name: "Ocean Blue", lightColor: "#60A5FA" },
  { id: "board-emerald", color: "#10B981", name: "Emerald", lightColor: "#34D399" },
  { id: "board-purple", color: "#8B5CF6", name: "Royal Purple", lightColor: "#A78BFA" },
  { id: "board-pink", color: "#EC4899", name: "Rose Pink", lightColor: "#F472B6" },
  { id: "board-orange", color: "#F59E0B", name: "Sunset Orange", lightColor: "#FBBF24" },
  { id: "board-red", color: "#EF4444", name: "Cherry Red", lightColor: "#F87171" },
  { id: "board-teal", color: "#14B8A6", name: "Teal", lightColor: "#2DD4BF" },
  { id: "board-indigo", color: "#6366F1", name: "Indigo", lightColor: "#818CF8" },
  { id: "board-slate", color: "#64748B", name: "Slate Gray", lightColor: "#94A3B8" },
];

interface BoardFormProps {
  count: number;
}

const BoardForm = ({ count }: BoardFormProps) => {
  const {
    isPending,
    selectedImageId,
    setCurrentBoardInput,
    currentBoardInput,
    setSelectedImageId,
    handleSubmit,
  } = useBoardForm(count);

  return (
    <Card className="w-full max-w-md mx-auto border-border/50 shadow-lg">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2 text-foreground">
          <Palette className="h-5 w-5 text-primary" />
          Create New Board
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Choose a color theme and give your board a name
        </p>
      </CardHeader>
      
      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Color Selection Section */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-foreground flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              Background Color
            </Label>
            
            <div className="grid grid-cols-3 gap-3">
              {macColors.map((colorOption) => (
                <div
                  key={colorOption.id}
                  className={clsx(
                    "cursor-pointer relative group transition-all duration-200",
                    "hover:scale-105 hover:shadow-md",
                    isPending && "opacity-50 hover:scale-100 hover:shadow-none cursor-not-allowed",
                    selectedImageId === colorOption.id && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                  )}
                  onClick={() => {
                    if (isPending) return;
                    setSelectedImageId(colorOption.id);
                  }}
                >
                  <input
                    type="radio"
                    id={colorOption.id}
                    name="color"
                    onChange={() => setSelectedImageId(colorOption.id)}
                    className="sr-only"
                    checked={selectedImageId === colorOption.id}
                    value={`${colorOption.id}|${colorOption.color}|${colorOption.name}`}
                    disabled={isPending}
                  />
                  
                  <div 
                    className="w-full h-16 rounded-lg border border-border/20 shadow-sm relative overflow-hidden"
                    style={{ 
                      background: `linear-gradient(135deg, ${colorOption.color} 0%, ${colorOption.lightColor} 100%)`
                    }}
                  >
                    {/* Overlay for better contrast */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-black/10" />
                    
                    {/* Selection indicator */}
                    {selectedImageId === colorOption.id && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
                        <div className="bg-white/90 rounded-full p-1">
                          <Check className="w-4 h-4 text-gray-800" />
                        </div>
                      </div>
                    )}
                    
                    {/* Color name tooltip */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                      <span className="text-[10px] font-medium text-white truncate block">
                        {colorOption.name}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Board Title Section */}
          <div className="space-y-3">
            <Label 
              htmlFor="board-title" 
              className="text-sm font-medium text-foreground flex items-center gap-2"
            >
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              Board Title
            </Label>
            
            <Input
              id="board-title"
              name="title"
              placeholder="Enter board name..."
              value={currentBoardInput}
              onChange={(e) => setCurrentBoardInput(e.target.value)}
              className={clsx(
                "transition-all duration-200",
                "border-input bg-background text-foreground",
                "placeholder:text-muted-foreground",
                "focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background",
                "focus:border-primary focus-visible:ring-primary",
                isPending && "opacity-50 cursor-not-allowed"
              )}
              disabled={isPending}
              maxLength={50}
            />
            
            {/* Character counter */}
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>Choose a descriptive name for your board</span>
              <span>{currentBoardInput.length}/50</span>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isPending || (!selectedImageId && !currentBoardInput.trim())}
            className={clsx(
              "w-full h-11 font-medium transition-all duration-200",
              "bg-primary hover:bg-primary/90 text-primary-foreground",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
            )}
          >
            {isPending ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Creating Board...
              </div>
            ) : (
              "Create Board"
            )}
          </Button>
          
          {/* Validation message */}
          {!selectedImageId && !currentBoardInput.trim() && (
            <p className="text-xs text-muted-foreground text-center">
              Please select a color and enter a board title
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default BoardForm;
