import { Suspense } from "react";
import { Browse } from "@/components/browse";
import { GridSkeleton } from "@/components/grid-skeleton";

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <GridSkeleton />
        </div>
      }
    >
      <Browse />
    </Suspense>
  );
}
