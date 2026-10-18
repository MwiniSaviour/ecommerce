import { JobView } from "@/components/driver/job-view";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return {
    title: `Kora Fleet — Task ${id}`,
    description: "Delivery task detail: pickup, dropoff, and proof of delivery.",
  };
}

export default async function DriverJobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <JobView id={id} />;
}
