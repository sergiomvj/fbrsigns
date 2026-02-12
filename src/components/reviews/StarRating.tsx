import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  className?: string;
}

export function StarRating({
  rating,
  maxRating = 5,
  size = "md",
  interactive = false,
  onRatingChange,
  className,
}: StarRatingProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-8 w-8",
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {Array.from({ length: maxRating }).map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= rating;
        const isHalf = !isFilled && starValue - 0.5 <= rating;

        return (
          <button
            key={index}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onRatingChange?.(starValue)}
            className={cn(
              "relative transition-colors",
              interactive ? "cursor-pointer hover:scale-110" : "cursor-default"
            )}
          >
            {/* Background star (empty) */}
            <Star
              className={cn(
                sizeClasses[size],
                "text-slate-200",
                "fill-slate-200"
              )}
            />
            
            {/* Filled star overlay */}
            {(isFilled || isHalf) && (
              <div
                className={cn(
                  "absolute inset-0 overflow-hidden",
                  isHalf ? "w-1/2" : "w-full"
                )}
              >
                <Star
                  className={cn(
                    sizeClasses[size],
                    "text-yellow-400 fill-yellow-400"
                  )}
                />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function StarRatingDisplay({
  rating,
  reviewCount,
  size = "md",
}: {
  rating: number;
  reviewCount?: number;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <div className="flex items-center gap-2">
      <StarRating rating={rating} size={size} />
      {reviewCount !== undefined && (
        <span className="text-sm text-slate-500">
          ({reviewCount} {reviewCount === 1 ? "avaliação" : "avaliações"})
        </span>
      )}
    </div>
  );
}
