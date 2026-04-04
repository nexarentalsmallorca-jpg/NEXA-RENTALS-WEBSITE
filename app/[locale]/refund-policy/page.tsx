import LegalPage from "../../components/LegalPage";

export default function RefundPolicyPage() {
  return (
    <LegalPage
      title="Refund Policy"
      subtitle="This page explains when refunds may apply for bookings made with Nexa Rentals."
      sections={[
        {
          heading: "1. Booking Payments",
          paragraphs: [
            "Refund eligibility depends on the booking conditions, cancellation timing, payment status, and the reason for cancellation.",
          ],
        },
        {
          heading: "2. Customer Cancellation",
          paragraphs: [
            "If the customer cancels a booking, refund eligibility will depend on the cancellation terms communicated at the time of booking.",
            "Late cancellations or no-shows may result in partial or full loss of the amount paid.",
          ],
        },
        {
          heading: "3. Company Cancellation",
          paragraphs: [
            "If Nexa Rentals cannot provide the booked vehicle for operational or safety reasons and no suitable alternative is offered, the customer may be entitled to a partial or full refund of the amount paid.",
          ],
        },
        {
          heading: "4. Non-Refundable Situations",
          paragraphs: [
            "Refunds may not apply in cases such as missing required documents, failure to meet legal driving requirements, no-show, unsafe behavior, or breach of the rental terms.",
          ],
        },
        {
          heading: "5. Early Return",
          paragraphs: [
            "If the customer returns the vehicle early, unused rental time is generally not refundable unless otherwise agreed in writing.",
          ],
        },
        {
          heading: "6. Processing Time",
          paragraphs: [
            "Approved refunds are processed through the original payment method whenever possible. Processing times may vary depending on the payment provider or bank.",
          ],
        },
      ]}
    />
  );
}