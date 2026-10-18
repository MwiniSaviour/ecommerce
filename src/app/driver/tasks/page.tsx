import { TasksView } from "@/components/driver/tasks-view";

export const dynamic = "force-static";

export const metadata = {
  title: "Kora Fleet — My tasks",
  description: "Offers, active deliveries, and completed trips.",
};

export default function DriverTasksPage() {
  return <TasksView />;
}
