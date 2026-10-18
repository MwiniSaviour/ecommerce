import { HelpArticle, HelpSection } from "@/components/help-article";

export const metadata = {
  title: "Delivery info — Kora Market",
  description: "Delivery fees, timelines and express options for every region we serve.",
};

const feeRows = [
  { route: "Standard, Greater Accra", fee: "GH₵ 20", window: "2–4 working days" },
  { route: "Standard, other regions", fee: "GH₵ 25", window: "3–6 working days" },
  { route: "Express, Greater Accra", fee: "GH₵ 40", window: "Same or next working day" },
  { route: "Express, Kumasi & Takoradi", fee: "GH₵ 45", window: "Next working day" },
];

export default function DeliveryHelpPage() {
  return (
    <HelpArticle
      topic="Delivery"
      title="Where and when your parcel arrives"
      intro="Deliveries run Monday to Saturday from our Accra fulfilment hub. Every order shows its fee and window at checkout before you pay — nothing is added later."
    >
      <HelpSection title="Fees and timelines">
        <div className="overflow-hidden rounded-[2px] border border-border">
          <table className="w-full text-left text-[12px]">
            <thead className="bg-cream text-[11px] uppercase tracking-wide text-muted">
              <tr>
                <th className="px-3 py-2 font-bold">Route</th>
                <th className="px-3 py-2 font-bold">Fee</th>
                <th className="px-3 py-2 font-bold">Arrives within</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-paper">
              {feeRows.map((row) => (
                <tr key={row.route}>
                  <td className="px-3 py-2 font-medium text-ink">{row.route}</td>
                  <td className="px-3 py-2 text-ink">{row.fee}</td>
                  <td className="px-3 py-2 text-muted">{row.window}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[12px] text-muted">
          Oversized items such as large appliances book a two-person delivery slot, and the courier calls one hour before arriving.
        </p>
      </HelpSection>

      <HelpSection title="What to expect after checkout">
        <ol className="list-decimal space-y-2 pl-5 text-[13px] text-ink">
          <li>A confirmation lands in your order history the moment payment clears.</li>
          <li>Your parcel is packed the same day the hub lives through packing — usually within 24 hours.</li>
          <li>The courier telephones you on the saved number before the final stretch, so keep your phone reachable.</li>
          <li>Handover happens at the door; count and eyeball the carton before signing the delivery note.</li>
        </ol>
      </HelpSection>

      <HelpSection title="If a parcel runs late">
        <p className="text-[13px] text-ink">
          If the window slips by more than two working days, message us through{" "}
          <span className="font-bold text-ink">Help → Contact us</span> with your order number. We trace the parcel with the courier
          company and, where a delay is confirmed, refund the express fee in full.
        </p>
      </HelpSection>
    </HelpArticle>
  );
}
