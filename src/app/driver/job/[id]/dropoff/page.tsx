import { DropoffView } from "@/components/driver/dropoff-view";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return {
    title: `Kora Fleet — Dropoff ${id}`,
    description: "Proof of delivery and cash collection.",
  };
}

export default async function DriverDropoffPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DropoffView id={id} />;
}
