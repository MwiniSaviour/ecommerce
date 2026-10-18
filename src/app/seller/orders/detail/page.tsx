import { Suspense } from "react";

import { OrderView } from "./order-view";

export const dynamic = "force-static";

export const metadata = {
  title: "Aries & Co. — Order detail",
  description: "Manage one order: mark ready, print label or invoice, or cancel.",
};

export default function SellerOrderDetailPage() {
  return (
    <Suspense fallback={null}>
      <OrderView />
    </Suspense>
  );
}
