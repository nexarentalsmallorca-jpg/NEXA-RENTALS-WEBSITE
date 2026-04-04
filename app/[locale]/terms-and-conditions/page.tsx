import LegalPage from "../../components/LegalPage";

export default function TermsAndConditionsPage() {
  return (
    <LegalPage
      title="Terms & Conditions"
      subtitle="Please read these terms carefully before using Nexa Rentals services."
      sections={[
        {
          heading: "1. Rental Service",
          paragraphs: [
            "Nexa Rentals offers scooter and e-bike rental services subject to availability, identity verification, and compliance with the rental conditions.",
            "By making a booking or taking delivery of a vehicle, the customer agrees to these terms and conditions.",
          ],
        },
        {
          heading: "2. Eligibility to Rent",
          paragraphs: [
            "Customers must provide valid identification and any valid driving license required by Spanish law for the rented vehicle.",
            "Nexa Rentals reserves the right to refuse delivery if the customer does not meet the legal or safety requirements.",
          ],
        },
        {
          heading: "3. Vehicle Use",
          paragraphs: [
            "The rented vehicle must be used carefully, legally, and responsibly at all times.",
            "It is forbidden to use the vehicle under the influence of alcohol, drugs, or any substance affecting safe driving.",
            "The vehicle must not be used for racing, illegal transport, reckless driving, or any unauthorized commercial purpose.",
          ],
        },
        {
          heading: "4. Responsibility for Damage and Loss",
          paragraphs: [
            "The customer is responsible for damage, loss, theft, misuse, negligence, missing accessories, and any breach of the rental agreement, subject to the agreed rental conditions.",
            "Any accident, damage, theft, mechanical issue, or incident must be reported to Nexa Rentals immediately.",
          ],
        },
        {
          heading: "5. Fines and Penalties",
          paragraphs: [
            "The customer is fully responsible for traffic fines, parking penalties, towing costs, and any legal violations during the rental period.",
            "Administrative charges may apply for the management of fines or legal notifications when permitted by law.",
          ],
        },
        {
          heading: "6. Return of Vehicle",
          paragraphs: [
            "The vehicle must be returned on the agreed date, time, and location.",
            "Late return may result in additional charges, including an extra rental day when applicable.",
            "The vehicle must be returned in a condition consistent with normal use, together with its accessories and documents.",
          ],
        },
        {
          heading: "7. Right to Refuse or Cancel",
          paragraphs: [
            "Nexa Rentals may refuse, suspend, or cancel a rental if there are safety concerns, invalid documents, suspected misuse, or breach of these terms.",
          ],
        },
      ]}
    />
  );
}