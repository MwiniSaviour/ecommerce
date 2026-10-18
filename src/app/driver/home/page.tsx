import { HomeView } from "@/components/driver/home-view";

export const dynamic = "force-static";

export const metadata = {
  title: "Kora Fleet — Home",
  description: "Go online, accept your next delivery, and track today's earnings.",
};

export default function DriverHomePage() {
  return <HomeView />;
}
