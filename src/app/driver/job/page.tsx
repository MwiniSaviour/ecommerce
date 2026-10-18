import { Suspense } from "react";

import { JobView } from "@/components/driver/job-view";

export const dynamic = "force-static";

export const metadata = {
  title: "Kora Fleet — Task",
  description: "Offer timer and delivery timeline for one driver task.",
};

export default function DriverJobPage() {
  return (
    <Suspense fallback={null}>
      <JobView />
    </Suspense>
  );
}
