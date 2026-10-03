import type { Metadata } from "next";
import { ShowScreen } from "@/components/show-screen";
import { excerpt, plainText } from "@/lib/present";
import type { Show } from "@/lib/types";
import { ApiError, fetchShow } from "@/lib/tvmaze";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const loaded = await loadShow(params);
  if (!loaded.show) return { title: "Show not found" };
  const description = excerpt(plainText(loaded.show.summary), 150);
  return {
    title: loaded.show.name,
    description: description || "A show page in the MARQUEE guide",
  };
}

export default async function ShowPage({ params }: Props) {
  const { id } = await params;
  const numericId = Number(id);
  const loaded = await loadShow(params);
  return <ShowScreen id={numericId} initial={loaded.show} missing={loaded.missing} />;
}

async function loadShow(params: Promise<{ id: string }>): Promise<{ show: Show | null; missing: boolean }> {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) return { show: null, missing: true };
  try {
    return { show: await fetchShow(numericId), missing: false };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return { show: null, missing: true };
    return { show: null, missing: false };
  }
}
