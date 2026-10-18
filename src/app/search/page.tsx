import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchView } from "@/components/search-view";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Search — Kora Market",
};

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchView />
    </Suspense>
  );
}
