import { AccountView } from "@/components/driver/account-view";

export const dynamic = "force-static";

export const metadata = {
  title: "Kora Fleet — Account",
  description: "Rider profile, documents, availability, and help.",
};

export default function DriverAccountPage() {
  return <AccountView />;
}
