import { PickupView } from "@/components/driver/pickup-view";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return {
    title: `Kora Fleet — Pickup ${id}`,
    description: "Hub pickup checklist and handover code.",
  };
}

export default async function DriverPickupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PickupView id={id} />;
}
