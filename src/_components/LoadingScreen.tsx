import { Loader2 } from "lucide-react";
import { cn } from "../lib/utils";

interface LoadingScreenProps {
  className?: string;
  size?: "default" | "sm" | "lg";
  fullScreen?: boolean;
}

const LoadingScreen = ({
  className,
  size = "default",
  fullScreen = true,
}: LoadingScreenProps) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-8 w-8 md:h-12 md:w-12",
    lg: "h-12 w-12 md:h-20 md:w-20",
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center",
        fullScreen && "absolute inset-0 w-full h-full",
        className
      )}
    >
      <div className="flex flex-col items-center gap-2">
        <Loader2 
          className={cn(
            "text-primary animate-spin",
            sizeClasses[size]
          )} 
        />
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    </div>
  );
};

export default LoadingScreen;
