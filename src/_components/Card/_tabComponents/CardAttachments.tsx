// // CardAttachments.js
// import { Paperclip, ImageIcon, FileText, X, Upload } from "lucide-react";
// import { useState, useCallback, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { cn } from "../../../lib/utils";
// import { Button } from "../../../components/ui/button";

// interface CardAttachmentsProps {
//   cardId: string;
//   onSave: (files: File[]) => void;
// }

// interface FileWithPreview extends File {
//   preview?: string;
// }

// export const CardAttachments = ({ cardId, onSave }: CardAttachmentsProps) => {
//   const [attachments, setAttachments] = useState<FileWithPreview[]>([]);
//   const [isDragging, setIsDragging] = useState(false);

//   const handleFileUpload = useCallback((files: File[]) => {
//     files.forEach((file) => {
//       if (file.type.startsWith("image/") || file.type === "application/pdf") {
//         const fileWithPreview = file as FileWithPreview;
//         if (file.type.startsWith("image/")) {
//           fileWithPreview.preview = URL.createObjectURL(file);
//         }
//         setAttachments((prev) => [...prev, fileWithPreview]);
//       } else {
//         alert("Unsupported file type. Please upload images or PDFs.");
//       }
//     });
//   }, []);

//   const handleDrop = useCallback(
//     (event: React.DragEvent) => {
//       event.preventDefault();
//       setIsDragging(false);
//       const files = Array.from(event.dataTransfer.files);
//       handleFileUpload(files);
//     },
//     [handleFileUpload]
//   );

//   const handlePaste = useCallback(
//     (event: ClipboardEvent) => {
//       const items = event.clipboardData?.items;
//       if (!items) return;
      
//       for (const item of items) {
//         if (item.kind === "file") {
//           const file = item.getAsFile();
//           if (file) handleFileUpload([file]);
//         }
//       }
//     },
//     [handleFileUpload]
//   );

//   useEffect(() => {
//     document.addEventListener("paste", handlePaste);
//     return () => {
//       document.removeEventListener("paste", handlePaste);
//       // Cleanup previews
//       attachments.forEach(file => {
//         if (file.preview) URL.revokeObjectURL(file.preview);
//       });
//     };
//   }, [handlePaste, attachments]);

//   const handleDelete = (fileToDelete: File) => {
//     setAttachments(attachments.filter((file) => file !== fileToDelete));
//   };

//   const renderAttachment = (file: FileWithPreview) => {
//     const isImage = file.type.startsWith("image/");
//     const isPDF = file.type === "application/pdf";
//     const size = file.size / (isPDF ? 1024 * 1024 : 1024);
//     const sizeUnit = isPDF ? "MB" : "KB";

//     return (
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         exit={{ opacity: 0, y: -20 }}
//         transition={{ type: "spring", stiffness: 500, damping: 30 }}
//         key={file.name}
//         className={cn(
//           "flex items-center gap-2 p-2",
//           "border rounded-md",
//           "border-border/40 dark:border-border/40",
//           "group relative",
//           "bg-background/50 backdrop-blur-sm"
//         )}
//       >
//         {isImage ? (
//           <ImageIcon className="w-4 h-4 text-muted-foreground" />
//         ) : (
//           <FileText className="w-4 h-4 text-muted-foreground" />
//         )}
        
//         <div className="flex flex-col justify-between w-fit">
//           <span className="text-xs text-foreground/80">
//             {file.name}
//           </span>
//           <span className="text-[9px] text-muted-foreground">
//             {size.toFixed(isPDF ? 2 : 1)} {sizeUnit}
//           </span>
//         </div>

//         <motion.button
//           whileHover={{ scale: 1.1 }}
//           whileTap={{ scale: 0.9 }}
//           onClick={() => handleDelete(file)}
//           className={cn(
//             "absolute -top-2 -right-2",
//             "p-0.5 rounded-full",
//             "bg-muted hover:bg-muted/80",
//             "transition-colors"
//           )}
//         >
//           <X className="w-3 h-3" />
//         </motion.button>
//       </motion.div>
//     );
//   };

//   return (
//     <div
//       onDrop={handleDrop}
//       onDragOver={(e) => {
//         e.preventDefault();
//         setIsDragging(true);
//       }}
//       onDragLeave={() => setIsDragging(false)}
//       className="space-y-4"
//     >
//       <h3 className="text-sm font-medium text-foreground">Attachments</h3>
//       <motion.div
//         className={cn(
//           "border-2 border-dashed rounded-lg p-2",
//           "transition-colors duration-200",
//           isDragging 
//             ? "border-muted-foreground" 
//             : "border-border/40 dark:border-border/40"
//         )}
//       >
//         <AnimatePresence>
//           <div className="flex flex-wrap gap-2">
//             {attachments.map((file) => renderAttachment(file))}
//           </div>
//           {attachments.length === 0 && (
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               className={cn(
//                 "text-center text-muted-foreground",
//                 "flex flex-col items-center justify-center gap-1 p-4"
//               )}
//             >
//               <Upload className="w-4 h-4 mb-1" />
//               <label htmlFor="file-upload" className="text-xs cursor-pointer hover:text-foreground">
//                 Click to upload
//               </label>
//               <span className="text-xs">or drag and drop</span>
//               <span className="text-[10px] text-muted-foreground/80">
//                 Maximum file size 50 MB
//               </span>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </motion.div>

//       <input
//         type="file"
//         multiple
//         onChange={(e) => handleFileUpload(Array.from(e.target.files || []))}
//         className="hidden"
//         id="file-upload"
//         accept="image/*,.pdf"
//       />
      
//       <Button
//         onClick={() => onSave(attachments)}
//         className="w-full text-xs"
//         disabled={attachments.length === 0}
//       >
//         <Paperclip className="w-3 h-3 mr-1" />
//         Save Attachments
//       </Button>
//     </div>
//   );
// };