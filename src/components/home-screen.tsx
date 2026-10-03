"use client";

import { useSearchParams } from "next/navigation";
import { Browse } from "@/components/browse";
import { ShowScreen } from "@/components/show-screen";

export function HomeScreen() {
  const show = useSearchParams().get("show");
  const id = show == null ? Number.NaN : Number(show);
  if (Number.isInteger(id) && id > 0) {
    return <ShowScreen id={id} initial={null} missing={false} />;
  }
  return <Browse />;
}
