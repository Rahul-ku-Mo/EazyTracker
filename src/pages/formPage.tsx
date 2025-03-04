import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { X } from "lucide-react";
import { useTheme } from "../context/ThemeProvider";
import { cn } from "../lib/utils";

interface FormPageProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FormPage({ isOpen, onClose }: FormPageProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Clear error when user types
    if (name === "message" && error) {
      setError("");
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check word count
    const wordCount = formData.message.trim().split(/\s+/).length;
    if (wordCount > 300) {
      setError("You thought you can spam. Not that ez");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // In a real implementation, you would send this data to a server
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log("Form submitted:", {
        ...formData,
        to: "rajamohanty12345@gmail.com",
      });

      setIsSubmitted(true);
      setFormData({ name: "", email: "", message: "" });

      // Close the form after 3 seconds
      setTimeout(() => {
        onClose();
        setIsSubmitted(false);
      }, 3000);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-y-0 right-0 z-50 flex items-center justify-center"
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
    >
      <div
        className={cn(
          "w-full max-w-md p-6 rounded-l-xl shadow-xl h-full overflow-y-auto",
          isDark
            ? "bg-zinc-900 text-zinc-100 border-l border-zinc-800"
            : "bg-white text-zinc-900 border-l border-zinc-200"
        )}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold gt-walsheim-font">
            Let's Collaborate
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {isSubmitted ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-[80%] text-center"
          >
            <div
              className={cn(
                "w-16 h-16 mb-4 rounded-full flex items-center justify-center",
                "bg-emerald-100 text-emerald-600"
              )}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-8 h-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-bold">Message Sent!</h3>
            <p
              className={cn(
                "text-sm",
                isDark ? "text-zinc-400" : "text-zinc-600"
              )}
            >
              Thanks for reaching out. I'll get back to you soon.
            </p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="name"
                className={cn(
                  "block text-sm font-medium",
                  isDark ? "text-zinc-300" : "text-zinc-700"
                )}
              >
                Name
              </label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className={cn(
                  isDark
                    ? "bg-zinc-800 border-zinc-700 focus:border-emerald-500"
                    : "bg-zinc-50 border-zinc-200 focus:border-emerald-500"
                )}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="email"
                className={cn(
                  "block text-sm font-medium",
                  isDark ? "text-zinc-300" : "text-zinc-700"
                )}
              >
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className={cn(
                  isDark
                    ? "bg-zinc-800 border-zinc-700 focus:border-emerald-500"
                    : "bg-zinc-50 border-zinc-200 focus:border-emerald-500"
                )}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="message"
                className={cn(
                  "block text-sm font-medium",
                  isDark ? "text-zinc-300" : "text-zinc-700"
                )}
              >
                Message (max 300 words)
              </label>
              <Textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={6}
                className={cn(
                  isDark
                    ? "bg-zinc-800 border-zinc-700 focus:border-emerald-500"
                    : "bg-zinc-50 border-zinc-200 focus:border-emerald-500",
                  error ? "border-red-500" : ""
                )}
              />
              {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || !!error}
              className="w-full rounded-full"
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </Button>

            <p
              className={cn(
                "text-xs text-center mt-4",
                isDark ? "text-zinc-500" : "text-zinc-600"
              )}
            >
              Your message will be sent to Rahul Mohanty.
            </p>
          </form>
        )}
      </div>
    </motion.div>
  );
}
