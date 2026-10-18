import { Suspense } from "react";

import { DropoffView } from "@/components/driver/dropoff-view";

export const dynamic = "force-static";

export const metadata = {
  title: "Kora Fleet — Dropoff",
  description: "Prove delivery with photo, signature or customer PIN and close the task.",
};

export default function DriverDropoffPage() {
  return (
    <Suspense fallback={null}>
      <DropoffView />
    </Suspense>
  );
}
