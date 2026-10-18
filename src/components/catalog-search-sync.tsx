"use client";

import { useEffect } from "react";
import { useStorefront } from "@/components/storefront-provider";

export function CatalogSearchSync({ term }: { term: string }) {
  const { setSearchTerm } = useStorefront();

  useEffect(() => {
    setSearchTerm(term);
    return () => {
      setSearchTerm("");
    };
  }, [setSearchTerm, term]);

  return null;
}
