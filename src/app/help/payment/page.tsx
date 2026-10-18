import { HelpArticle, HelpSection } from "@/components/help-article";

export const metadata = {
  title: "Payments — Kora Market",
  description: "Mobile money, pay-on-delivery and card options, plus how we keep each one safe.",
};

export default function PaymentHelpPage() {
  return (
    <HelpArticle
      topic="Payment"
      title="Ways to pay"
      intro="Pick the payment method at checkout; nothing is charged before you confirm the order summary. Fees and delivery are shown on the same screen so the total is never a surprise."
    >
      <HelpSection title="Mobile money">
        <p className="text-[13px] text-ink">
          MTN MoMo and Telecel Cash are accepted in full. You receive a payment prompt on the number linked to your order, approve
          it with your PIN, and the order confirmation appears immediately. If the prompt expires, it can be resent from the checkout
          screen within ten minutes.
        </p>
      </HelpSection>

      <HelpSection title="Pay on delivery">
        <p className="text-[13px] text-ink">
          Pay the courier in cash or by mobile money at your door, anywhere in Greater Accra and the major regional cities. Count
          your items before paying, and ask for the courier's receipt — the amount printed should match your order total exactly.
        </p>
      </HelpSection>

      <HelpSection title="Cards">
        <p className="text-[13px] text-ink">
          Visa and Mastercard are processed through a secure gateway; your card details are typed into the bank's own page, never
          stored by Kora Market. Card refunds follow the card issuer and typically settle in 3–5 working days.
        </p>
      </HelpSection>

      <HelpSection title="If a payment fails">
        <ol className="list-decimal space-y-2 pl-5 text-[13px] text-ink">
          <li>Check that the mobile money balance covers the total including the delivery fee.</li>
          <li>Retry once — bank networks occasionally drop the first prompt.</li>
          <li>If money left your wallet but the order did not confirm, contact us with the transaction ID and we reconcile it within one working day.</li>
        </ol>
      </HelpSection>
    </HelpArticle>
  );
}
