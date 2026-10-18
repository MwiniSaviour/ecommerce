import { DriverShell } from "@/components/driver/driver-shell";

export const metadata = {
  title: "Kora Fleet — Driver",
  description: "Kora Market delivery partner app.",
};

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  return <DriverShell>{children}</DriverShell>;
}
