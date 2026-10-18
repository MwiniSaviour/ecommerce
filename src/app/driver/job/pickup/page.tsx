import { Suspense } from "react";

import { PickupView } from "@/components/driver/pickup-view";

export const dynamic = "force-static";

export const metadata = {
  title: "Kora Fleet — Pickup",
  description: "Confirm pickup checklist, PIN and photo for one driver task.",
};

export default function DriverPickupPage() {
  return (
    <Suspense fallback={null}>
      <PickupView />
    </Suspense>
  );
}
