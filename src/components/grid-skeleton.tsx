import { cn } from "@/lib/cn";

export function GridSkeleton({ count = 12, compact = false }: { count?: number; compact?: boolean }) {
  return (
    <div className={cn("grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4", compact ? "xl:grid-cols-6" : "xl:grid-cols-5")}>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="animate-pulse">
          <div className="aspect-[2/3] rounded-lg bg-card-2" />
          <div className="mt-2 h-4 w-4/5 rounded bg-card-2" />
          <div className="mt-2 h-3 w-1/2 rounded bg-card-2" />
        </div>
      ))}
    </div>
  );
}
