import { Check } from "lucide-react";
import clsx from "clsx";
import useBoardForm from "@/hooks/useBoardForm";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

// Macintosh-inspired colors
const macColors = [
  { id: "mac-blue", color: "#1E90FF", name: "Macintosh Blue" },
  { id: "mac-pink", color: "#FF69B4", name: "Macintosh Pink" },
  { id: "mac-green", color: "#32CD32", name: "Macintosh Green" },
  { id: "mac-yellow", color: "#FFD700", name: "Macintosh Yellow" },
  { id: "mac-orange", color: "#FF8C00", name: "Macintosh Orange" },
  { id: "mac-purple", color: "#9370DB", name: "Macintosh Purple" },
  { id: "mac-red", color: "#FF6347", name: "Macintosh Red" },
  { id: "mac-teal", color: "#20B2AA", name: "Macintosh Teal" },
  { id: "mac-gray", color: "#708090", name: "Macintosh Gray" },
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
    <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
      <div className="flex flex-col">
        <Label className="pb-2 text-xs font-bold text-center text-gray-300">
          Choose Background Color
        </Label>
        <div className="grid grid-cols-3 gap-2 mb-2">
          {macColors.map((colorOption) => (
            <div
              key={colorOption.id}
              className={clsx(
                "cursor-pointer relative aspect-video group hover:opacity-75 transition",
                isPending && "opacity-50 hover:opacity-50 cursor-auto"
              )}
              onClick={() => {
                if (isPending) return;
                setSelectedImageId(colorOption.id);
              }}
            >
              <input
                type="radio"
                id="color"
                name="color"
                onChange={() => setSelectedImageId(colorOption.id)}
                className="hidden"
                checked={selectedImageId === colorOption.id}
                value={`${colorOption.id}|${colorOption.color}|${colorOption.name}`}
              />
              <div 
                className="w-full h-16 rounded-sm"
                style={{ backgroundColor: colorOption.color }}
              />
              {selectedImageId === colorOption.id && (
                <div className="absolute inset-y-0 flex items-center justify-center w-full h-full bg-black/30">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
              <div className="absolute bottom-0 w-full text-[10px] truncate text-white p-1 bg-black/50">
                {colorOption.name}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="board-title">Board title</Label>
        <Input
          id="board-title"
          name="title"
          value={currentBoardInput}
          onChange={(e) => setCurrentBoardInput(e.target.value)}
          className="border text-zinc-200 bg-zinc-700 border-zinc-600 focus-visible:ring-0"
        />

        <Button
          type="submit"
          disabled={
            isPending || (!selectedImageId && !currentBoardInput.trim())
          }
          className="w-full mt-2"
          variant="secondary"
        >
          Create
        </Button>
      </div>
    </form>
  );
};

export default BoardForm;
