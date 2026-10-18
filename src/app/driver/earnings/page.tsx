import { EarningsView } from "@/components/driver/earnings-view";

export const dynamic = "force-static";

export const metadata = {
  title: "Kora Fleet — Earnings",
  description: "Weekly delivery earnings and MoMo payouts.",
};

export default function DriverEarningsPage() {
  return <EarningsView />;
}
