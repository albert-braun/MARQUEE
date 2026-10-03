"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/cn";

export function Poster({
  src,
  initial,
  sizes,
  priority = false,
}: {
  src: string | null;
  initial: string;
  sizes: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="absolute inset-0 grid place-items-center bg-card-2 text-gold">
        <span className="font-display text-3xl">{initial.slice(0, 1).toUpperCase()}</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt=""
      fill
      sizes={sizes}
      priority={priority}
      unoptimized
      className={cn("object-cover poster-zoom transition duration-500 group-hover:scale-[1.04]")}
      onError={() => setFailed(true)}
    />
  );
}
