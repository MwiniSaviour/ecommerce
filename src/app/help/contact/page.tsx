import { HelpArticle, HelpSection } from "@/components/help-article";

export const metadata = {
  title: "Contact us — Kora Market",
  description: "Ways to reach the Kora Market team plus answers to the questions we hear most.",
};

const faqs = [
  {
    question: "Can I collect my order instead of waiting for delivery?",
    answer:
      "Yes. Choose pickup at checkout and collect from the Accra hub counter, open 9am to 6pm, Monday to Saturday. Bring the order number and a photo ID.",
  },
  {
    question: "Can I change or cancel an order after paying?",
    answer:
      "Before the parcel is packed you can cancel free of charge from your order history. Once the courier is en route, refuse the delivery at the door and we refund once it returns to the hub.",
  },
  {
    question: "Do you ship to villages without a street address?",
    answer:
      "Yes. Use the nearest landmark in the street field and keep the phone number accurate — the courier calls before arriving.",
  },
  {
    question: "Are prices negotiable?",
    answer:
      "Prices are as listed, but flash sales and bulk packs bring the line down. Watch the Deals page for what is currently marked down.",
  },
];

export default function ContactHelpPage() {
  return (
    <HelpArticle
      topic="Contact"
      title="Talk to the Kora Market team"
      intro="We answer every message. Parcel questions move fastest with the order number attached — add it as the first line."
    >
      <HelpSection title="Ways to reach us">
        <ul className="list-disc space-y-2 pl-5 text-[13px] text-ink">
          <li>
            Phone and mobile money line: <span className="font-bold text-ink">+233 30 123 4567</span>
          </li>
          <li>
            Email: <span className="font-bold text-ink">support@kora.market</span> — replies within one working day
          </li>
          <li>
            Live agent hours: <span className="font-bold text-ink">8am–7pm, Monday to Saturday</span>
          </li>
          <li>Courier disputes: call the number on the delivery note, then email us the case number so it is tracked here too.</li>
        </ul>
      </HelpSection>

      <HelpSection title="Questions we hear most">
        <div className="space-y-2" data-testid="contact-faq">
          {faqs.map((faq) => (
            <details key={faq.question} className="rounded-[2px] border border-border bg-cream">
              <summary className="cursor-pointer px-4 py-3 text-[13px] font-bold text-ink select-none hover:text-brand">
                {faq.question}
              </summary>
              <p className="px-4 pb-3 text-[12px] leading-relaxed text-muted">{faq.answer}</p>
            </details>
          ))}
        </div>
      </HelpSection>

      <HelpSection title="Business enquiries">
        <p className="text-[13px] text-ink">
          Sellers who want to join the marketplace should use the same email with the subject line <span className="font-bold text-ink">New seller</span>.
          Include the categories you stock and a phone number so our onboarding team calls.
        </p>
      </HelpSection>
    </HelpArticle>
  );
}
