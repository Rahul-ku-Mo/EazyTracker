import { useCallback, useState } from "react";
import EmojiPicker from "../emojiPicker";
import { Pencil, Rocket, X, Upload, Palette } from "lucide-react";
import { Input } from "@/components/ui/input";
  
    import { useTheme } from "@/context/ThemeProvider";
import { NotesEditor } from "../_editor";

interface Cover {
  type: "image" | "color";
  value: string; // URL for image, hex code for color
}

const NoteMainContent = ({
  currentTitle,
  currentContent,
  currentEmoji,
  onTitleChange,
  onContentChange,
  onEmojiChange,
}: {
  currentTitle: string;
  currentContent: string;
  currentEmoji: any;
  onTitleChange?: (title: string) => void;
  onContentChange?: (content: string) => void;
  onEmojiChange?: (emoji: string) => void;
}) => {
  const { isDark } = useTheme();
  const [title, setTitle] = useState(currentTitle);
  const [content, setContent] = useState(currentContent);
  const [emoji, setEmoji] = useState<string>(currentEmoji);
  const [isOpen, setIsOpen] = useState(false);


  // Cover-related state
  const [cover, setCover] = useState<Cover | null>(null);
  const [showCoverModal, setShowCoverModal] = useState(false);

  // Memoized emoji handlers to prevent unnecessary re-renders
  const handleEmojiSelect = useCallback(
    (selectedEmoji: string) => {
      setEmoji(selectedEmoji);
      setIsOpen(false);
      onEmojiChange?.(selectedEmoji);
    },
    [onEmojiChange]
  );

  const handleEmojiRemove = useCallback(() => {
    setEmoji("");
    setIsOpen(false);
    onEmojiChange?.("");
  }, [onEmojiChange]);

  // Cover handlers
  const handleAddCover = useCallback(() => {
    setShowCoverModal(true);
  }, []);

  const handleCoverSelect = useCallback(
    (type: "image" | "color", value: string) => {
      setCover({ type, value });
      setShowCoverModal(false);
    },
    []
  );

  const handleRemoveCover = useCallback(() => {
    setCover(null);
  }, []);

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setCover({ type: "image", value: result });
          setShowCoverModal(false);
        };
        reader.readAsDataURL(file);
      }
    },
    []
  );

  // Predefined gradient colors for cover
  const coverColors = [
    {
      name: "Ocean Blue",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      value: "#667eea",
    },
    {
      name: "Emerald",
      gradient: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
      value: "#11998e",
    },
    {
      name: "Royal Purple",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      value: "#667eea",
    },
    {
      name: "Rose Pink",
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      value: "#f093fb",
    },
    {
      name: "Sunset Orange",
      gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      value: "#4facfe",
    },
    {
      name: "Cherry Red",
      gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
      value: "#fa709a",
    },
    {
      name: "Teal",
      gradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
      value: "#a8edea",
    },
    {
      name: "Indigo",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      value: "#667eea",
    },
    {
      name: "Slate Gray",
      gradient: "linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)",
      value: "#bdc3c7",
    },
  ];

  return (
    <div
      className={`min-h-screen ${
        isDark ? "bg-zinc-900 text-white" : "bg-white text-zinc-900"
      }`}
    >
      {/* Conditionally render cover section only when cover exists */}

      {/* Main content container */}
      <div className="grid grid-cols-[1fr_4fr_1fr]">
        {/* Content textarea */}
        {cover && (
          <div className="relative col-start-1 col-end-4 h-[30vh] max-h-[280px] overflow-hidden">
            {cover.type === "image" ? (
              <img
                src={cover.value}
                alt="Cover"
                className="w-full h-full col-start-1 col-end-3 object-cover"
              />
            ) : (
              <div
                className="w-full h-full"
                style={{ backgroundColor: cover.value }}
              />
            )}

            {/* Cover image controls overlay */}
            <div className="absolute bottom-4 right-4 opacity-0 hover:opacity-100 transition-opacity duration-200">
              <div className="flex bg-zinc-800/90 backdrop-blur-sm rounded border border-zinc-700">
                <button
                  onClick={handleAddCover}
                  className="px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-700 border-r border-zinc-700"
                >
                  Change cover
                </button>
                <button
                  onClick={handleRemoveCover}
                  className="px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-700"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="max-w-none col-start-2 col-end-3">
          {/* Emoji icon - positioned to overlap cover image */}

          {emoji && (
            <div className={`flex ${cover ? "h-10" : "h-40"} items-end`}>
              <div className={`relative z-20`}>
                <span
                  className="text-7xl leading-none cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/50 rounded-md inline-block p-0.5 transition-colors duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(true);
                  }}
                  title="Click to change or remove emoji"
                >
                  {emoji}
                </span>
              </div>
            </div>
          )}

          {/* Page controls */}
          <div className="flex items-center gap-2 text-xs text-zinc-500 my-2 group flex-wrap relative">
            <div className="emoji-picker-container relative">
              <EmojiPicker
                isOpen={isOpen}
                setIsOpen={setIsOpen}
                currentEmoji={emoji}
                onEmojiSelect={handleEmojiSelect}
                onEmojiRemove={handleEmojiRemove}
              />
            </div>

            <div
              role="button"
              className="inline-flex items-center gap-2 cursor-pointer px-2 py-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 opacity-0 group-hover:opacity-100 dark:text-zinc-400/90 transition-all duration-200"
            >
              <Pencil className="w-3 h-3" />
              Add Comment
            </div>


            {/* Only show Add Cover Image button when no cover exists */}
            {!cover && (
              <div
                role="button"
                onClick={handleAddCover}
                className="inline-flex items-center gap-2 cursor-pointer px-2 py-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 opacity-0 group-hover:opacity-100 dark:text-zinc-400/90 transition-all duration-200"
              >
                <Rocket className="w-3 h-3" />
                Add Cover Image
              </div>
            )}

            {/* Title input */}
           
          </div>
          <Input
              value={title}
              name="title"
              onChange={(e) => {
                setTitle(e.target.value);
                onTitleChange?.(e.target.value);
              }}
              placeholder="Untitled"
              className={`w-full mb-2 !text-4xl font-bold border-none p-0 h-auto bg-transparent resize-none outline-none
              ${
                isDark
                  ? "text-white placeholder:text-zinc-600"
                  : "text-zinc-900 placeholder:text-zinc-400"
              }
              focus-visible:ring-0 focus-visible:ring-offset-0`}
              style={{
                boxShadow: "none",
                lineHeight: "1.2",
                fontWeight: "700",
              }}
            />
          <NotesEditor description={content} />
        </div>

        {/* Bottom spacing */}
      </div>

      {/* Cover Selection Modal */}
      {showCoverModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-900 rounded-lg p-6 border border-zinc-700">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-zinc-700 rounded-full flex items-center justify-center">
                  <Palette className="w-4 h-4 text-zinc-300" />
                </div>
                <h2 className="text-lg font-semibold text-white">Add Cover</h2>
              </div>
              <button
                onClick={() => setShowCoverModal(false)}
                className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-zinc-400 text-sm mb-6">
              Choose a color theme for your note cover
            </p>

            {/* Background Color Section */}
            <div className="mb-6">
              <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                Background Color
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {coverColors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => handleCoverSelect("color", color.value)}
                    className="relative h-20 rounded-lg border-2 border-transparent hover:border-zinc-400 transition-all duration-200 overflow-hidden group"
                    style={{ background: color.gradient }}
                  >
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                    <div className="absolute bottom-2 left-2 right-2">
                      <span className="text-white text-xs font-medium drop-shadow-lg">
                        {color.name}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Upload Option */}
            <div className="mb-6">
              <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                Upload Image
              </h3>
              <label className="block">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="border-2 border-dashed border-zinc-600 hover:border-zinc-500 rounded-lg p-6 text-center cursor-pointer transition-colors">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-zinc-400" />
                  <p className="text-sm text-zinc-400">
                    Click to upload an image
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close emoji picker */}
      {isOpen && (
        <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
};

export default NoteMainContent;
