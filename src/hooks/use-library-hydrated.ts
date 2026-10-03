"use client";

import { useEffect, useState } from "react";
import { useLibrary } from "@/store/library";

export function useLibraryHydrated() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const finish = () => setHydrated(true);
    if (useLibrary.persist.hasHydrated()) {
      finish();
      return;
    }
    const unsubscribe = useLibrary.persist.onFinishHydration(finish);
    void useLibrary.persist.rehydrate();
    return unsubscribe;
  }, []);

  return hydrated;
}
