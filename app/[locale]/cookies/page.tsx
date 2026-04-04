import LegalPage from "../../components/LegalPage";

export default function CookiesPage() {
  return (
    <LegalPage
      title="Cookies Policy"
      subtitle="This page explains how cookies and similar technologies may be used on the Nexa Rentals website."
      sections={[
        {
          heading: "1. What Are Cookies",
          paragraphs: [
            "Cookies are small text files stored on your device when you visit a website. They help websites function properly and improve the user experience.",
          ],
        },
        {
          heading: "2. How We Use Cookies",
          paragraphs: [
            "We may use cookies to improve website performance, remember user preferences, analyze traffic, and support essential site functions.",
          ],
        },
        {
          heading: "3. Types of Cookies",
          paragraphs: [
            "The website may use essential cookies, analytics cookies, functional cookies, and third-party cookies depending on the tools integrated into the site.",
          ],
        },
        {
          heading: "4. Managing Cookies",
          paragraphs: [
            "You can control or delete cookies through your browser settings. Disabling certain cookies may affect website functionality.",
          ],
        },
        {
          heading: "5. Third-Party Services",
          paragraphs: [
            "Some third-party tools or embedded services may place cookies on your device according to their own privacy and cookie policies.",
          ],
        },
      ]}
    />
  );
}