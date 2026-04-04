import LegalPage from "../../components/LegalPage";

export default function DepositPolicyPage() {
  return (
    <LegalPage
      title="Deposit Policy"
      subtitle="This page explains how the security deposit works at Nexa Rentals."
      sections={[
        {
          heading: "1. Security Deposit Requirement",
          paragraphs: [
            "A refundable security deposit may be required before the vehicle is handed over to the customer.",
            "The deposit amount may vary depending on the vehicle type, rental duration, and booking conditions.",
          ],
        },
        {
          heading: "2. Purpose of the Deposit",
          paragraphs: [
            "The security deposit is intended to cover possible damage, loss, missing accessories, unpaid fines, late return charges, fuel or battery-related misuse where applicable, or other contractual breaches.",
          ],
        },
        {
          heading: "3. Deposit Hold or Collection",
          paragraphs: [
            "The deposit may be pre-authorized, blocked, or collected using an accepted payment method according to the rental conditions in force at the time of pickup.",
          ],
        },
        {
          heading: "4. Return of Deposit",
          paragraphs: [
            "If the vehicle is returned in the agreed condition and there are no pending charges, the deposit will be released or refunded after the return inspection.",
            "Bank processing times may vary depending on the payment provider or card issuer.",
          ],
        },
        {
          heading: "5. Partial or Full Retention",
          paragraphs: [
            "Part or all of the deposit may be retained if there is damage, loss, missing equipment, excessive dirt, contractual breach, unpaid penalties, or any outstanding amount related to the rental.",
          ],
        },
        {
          heading: "6. Additional Charges",
          paragraphs: [
            "If the total amount owed exceeds the security deposit, the customer remains responsible for paying the remaining balance.",
          ],
        },
      ]}
    />
  );
}