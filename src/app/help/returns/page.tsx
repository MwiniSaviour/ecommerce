import { HelpArticle, HelpSection } from "@/components/help-article";

export const metadata = {
  title: "Returns policy — Kora Market",
  description: "Seven-day returns, refund timelines and the products that cannot come back.",
};

export default function ReturnsHelpPage() {
  return (
    <HelpArticle
      topic="Returns"
      title="Returning something is allowed"
      intro="If a delivery disappoints, you have seven days from handover to change your mind. Start the return from your order history or by messaging us — either path reaches the same team."
    >
      <HelpSection title="What qualifies">
        <ul className="list-disc space-y-2 pl-5 text-[13px] text-ink">
          <li>Unopened items in original packaging with all labels still attached.</li>
          <li>Wrong item, wrong size or wrong colour delivered from our hub.</li>
          <li>Items that arrived visibly damaged — photograph the carton before opening so we can claim from the courier.</li>
          <li>Dead-on-arrival electronics: tell us within 48 hours and we swap the unit first, then investigate.</li>
        </ul>
      </HelpSection>

      <HelpSection title="What we cannot take back">
        <p className="text-[13px] text-ink">
          For hygiene and safety we cannot resell some categories once the seal breaks: personal care and sunscreen, earrings and
          nose studs, food, baby products beyond unopened feeds and nappies, and discounted clearance flagged{" "}
          <span className="font-bold text-ink">Final sale</span> on the product page.
        </p>
      </HelpSection>

      <HelpSection title="How to start a return">
        <ol className="list-decimal space-y-2 pl-5 text-[13px] text-ink">
          <li>Open <span className="font-bold text-ink">Account → My orders</span> and pick the order.</li>
          <li>Message us with the item, the reason and a photo if the box or product left damaged.</li>
          <li>Keep the item in its packaging until a courier collects — usually within two working days and free where we caused the problem.</li>
          <li>Once the item reaches our hub, a refund is approved within 24 hours.</li>
        </ol>
      </HelpSection>

      <HelpSection title="Refund timelines">
        <p className="text-[13px] text-ink">
          Mobile money refunds land in 1–2 working days after approval. Card payments follow the card issuer, usually 3–5 working
          days. Pay-on-delivery orders are refunded to any mobile money number you give us.
        </p>
      </HelpSection>
    </HelpArticle>
  );
}
