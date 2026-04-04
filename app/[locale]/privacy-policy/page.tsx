import LegalPage from "../../components/LegalPage";

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      subtitle="This page explains how Nexa Rentals collects, uses, and protects your personal information."
      sections={[
        {
          heading: "1. Information We Collect",
          paragraphs: [
            "We may collect personal information such as your name, phone number, email address, booking details, identification details, and payment-related information when necessary for rental and communication purposes.",
          ],
        },
        {
          heading: "2. How We Use Your Information",
          paragraphs: [
            "We use your information to process bookings, confirm rentals, communicate with you, provide customer support, comply with legal obligations, and improve our services.",
          ],
        },
        {
          heading: "3. Legal Basis",
          paragraphs: [
            "Your data may be processed for contract performance, legal compliance, legitimate business interests, or your consent where applicable.",
          ],
        },
        {
          heading: "4. Data Sharing",
          paragraphs: [
            "Your information may be shared only when necessary with payment providers, service providers, professional advisers, insurers, or public authorities when required by law.",
          ],
        },
        {
          heading: "5. Data Security",
          paragraphs: [
            "We take reasonable technical and organizational measures to protect your information against unauthorized access, misuse, loss, or disclosure.",
          ],
        },
        {
          heading: "6. Data Retention",
          paragraphs: [
            "We keep personal data only for as long as necessary for bookings, legal obligations, dispute handling, accounting, and legitimate business recordkeeping.",
          ],
        },
        {
          heading: "7. Your Rights",
          paragraphs: [
            "Depending on applicable law, you may have the right to request access, correction, deletion, restriction, objection, or portability of your personal data.",
          ],
        },
        {
          heading: "8. Contact",
          paragraphs: [
            "If you have questions about privacy or data protection, you may contact Nexa Rentals using the contact details shown on this website.",
          ],
        },
      ]}
    />
  );
}