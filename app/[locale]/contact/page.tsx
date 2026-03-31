"use client";

import Navbar from "@/app/Navbar";
import { FormEvent, Suspense, useState } from "react";

const ORANGE = "#FF7A00";

const WHATSAPP_NUMBER = "34971482342";
const PHONE_DISPLAY = "+34 971 48 23 42";
const EMAIL = "info@nexarentals.es";
const ADDRESS = "Carrer Galeón 13, Magaluf, Mallorca";
const MAPS_LINK =
  "https://www.google.com/maps/search/?api=1&query=Carrer+Gale%C3%B3n+13,+Magaluf,+Mallorca";

function ContactPageContent() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      setSuccessMessage("Thank you. Your message has been sent successfully.");
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to send message. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Suspense fallback={null}>
        <Navbar />
      </Suspense>

      <main className="min-h-screen bg-[#0a0a0a] text-white px-4 sm:px-6 py-12 sm:py-16 md:py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-14 md:mb-16">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Contact <span style={{ color: ORANGE }}>NEXA Rentals</span>
            </h1>
            <p className="text-sm sm:text-base text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Have questions about scooter or e-bike rentals in Mallorca?
              Send us a message and we’ll get back to you quickly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-10 sm:mb-14 md:mb-16">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#111] p-5 sm:p-6 rounded-xl border border-[#1f1f1f] hover:border-[#FF7A00] transition-all duration-300 block"
            >
              <h3 className="font-semibold mb-2 text-lg">WhatsApp</h3>
              <p className="text-gray-400 text-sm sm:text-base">
                Fast support for bookings
              </p>
              <p className="mt-3 text-white font-medium break-words underline underline-offset-4">
                {PHONE_DISPLAY}
              </p>
            </a>

            <a
              href={`mailto:${EMAIL}`}
              className="bg-[#111] p-5 sm:p-6 rounded-xl border border-[#1f1f1f] hover:border-[#FF7A00] transition-all duration-300 block"
            >
              <h3 className="font-semibold mb-2 text-lg">Email</h3>
              <p className="text-gray-400 text-sm sm:text-base">
                General inquiries
              </p>
              <p className="mt-3 text-white font-medium break-words underline underline-offset-4">
                {EMAIL}
              </p>
            </a>

            <a
              href={MAPS_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#111] p-5 sm:p-6 rounded-xl border border-[#1f1f1f] hover:border-[#FF7A00] transition-all duration-300 block"
            >
              <h3 className="font-semibold mb-2 text-lg">Pickup Location</h3>
              <p className="text-gray-400 text-sm sm:text-base">Magaluf</p>
              <p className="mt-3 text-white font-medium underline underline-offset-4 leading-relaxed">
                {ADDRESS}
              </p>
            </a>
          </div>

          <div className="bg-[#111] p-5 sm:p-7 md:p-8 rounded-2xl border border-[#1f1f1f]">
            <h2 className="text-xl sm:text-2xl font-semibold mb-6">
              Send us a message
            </h2>

            <form onSubmit={handleSubmit} className="grid gap-4">
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="bg-[#0a0a0a] border border-[#222] p-3 sm:p-4 rounded-lg outline-none focus:border-[#FF7A00] text-sm sm:text-base"
              />

              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
                className="bg-[#0a0a0a] border border-[#222] p-3 sm:p-4 rounded-lg outline-none focus:border-[#FF7A00] text-sm sm:text-base"
              />

              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                className="bg-[#0a0a0a] border border-[#222] p-3 sm:p-4 rounded-lg outline-none focus:border-[#FF7A00] text-sm sm:text-base"
              />

              <input
                type="text"
                name="subject"
                placeholder="Subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="bg-[#0a0a0a] border border-[#222] p-3 sm:p-4 rounded-lg outline-none focus:border-[#FF7A00] text-sm sm:text-base"
              />

              <textarea
                name="message"
                placeholder="Your message..."
                rows={6}
                value={formData.message}
                onChange={handleChange}
                required
                className="bg-[#0a0a0a] border border-[#222] p-3 sm:p-4 rounded-lg outline-none focus:border-[#FF7A00] text-sm sm:text-base resize-none"
              />

              {successMessage && (
                <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">
                  {successMessage}
                </div>
              )}

              {errorMessage && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-2 bg-[#FF7A00] hover:bg-[#ff8c1a] disabled:opacity-70 disabled:cursor-not-allowed transition-all text-black font-semibold py-3 sm:py-4 rounded-lg text-sm sm:text-base"
              >
                {loading ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}

export default function ContactPage() {
  return (
    <Suspense fallback={null}>
      <ContactPageContent />
    </Suspense>
  );
}