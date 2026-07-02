"use client";

import React, { FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Montserrat } from "next/font/google";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";

const pageFont = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const WHATSAPP_NUMBER = "34971482342";
const PHONE_DISPLAY = "+34 971 48 23 42";
const EMAIL = "info@nexarentals.es";
const ADDRESS = "Carrer Galeón 13, Magaluf, Mallorca";
const MAPS_LINK = "https://maps.app.goo.gl/YZBz7UeeHicKD4B99";

type Locale =
  | "en"
  | "es"
  | "de"
  | "fr"
  | "it"
  | "pt"
  | "sv"
  | "nl"
  | "pl"
  | "da"
  | "no"
  | "cs"
  | "uk";

type CopyLocale = "en" | "es" | "de" | "fr" | "it" | "pt" | "sv";

type ContactCopy = {
  back: string;
  selectLanguage: string;
  active: string;
  hero: {
    title: string;
    intro: string;
    text: string;
  };
  form: {
    eyebrow: string;
    title: string;
    text: string;
    fullName: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
    send: string;
    sending: string;
    success: string;
    error: string;
  };
  contact: {
    title: string;
    text: string;
    whatsapp: string;
    email: string;
    location: string;
    openWhatsApp: string;
    openEmail: string;
    openDirections: string;
  };
};

const LANGUAGES: {
  code: Locale;
  label: string;
  short: string;
  flagSrc: string;
}[] = [
  { code: "en", label: "English", short: "EN", flagSrc: "/images/en.png" },
  { code: "es", label: "Español", short: "ES", flagSrc: "/images/es.png" },
  { code: "de", label: "Deutsch", short: "DE", flagSrc: "/images/de.png" },
  { code: "fr", label: "Français", short: "FR", flagSrc: "/images/fr.png" },
  { code: "it", label: "Italiano", short: "IT", flagSrc: "/images/it.png" },
  { code: "nl", label: "Nederlands", short: "NL", flagSrc: "/images/NL.png" },
  { code: "pl", label: "Polski", short: "PL", flagSrc: "/images/PL.png" },
  { code: "sv", label: "Svenska", short: "SV", flagSrc: "/images/sv.png" },
  { code: "da", label: "Dansk", short: "DA", flagSrc: "/images/DA.png" },
  { code: "no", label: "Norsk", short: "NO", flagSrc: "/images/NO.png" },
  { code: "pt", label: "Português", short: "PT", flagSrc: "/images/pt.png" },
  { code: "cs", label: "Čeština", short: "CS", flagSrc: "/images/CS.png" },
  { code: "uk", label: "Українська", short: "UK", flagSrc: "/images/UK.png" },
];

function isLocale(value: string | undefined): value is Locale {
  return Boolean(value && LANGUAGES.some((language) => language.code === value));
}

function getLocaleFromPath(pathname: string): Locale {
  const firstPart = pathname.split("/").filter(Boolean)[0];

  if (isLocale(firstPart)) return firstPart;

  return "en";
}

function getSafeCopyLocale(locale: string): CopyLocale {
  return ["en", "es", "de", "fr", "it", "pt", "sv"].includes(locale)
    ? (locale as CopyLocale)
    : "en";
}

function replaceLocaleInPath(pathname: string, nextLocale: Locale) {
  const parts = pathname.split("/").filter(Boolean);
  const firstPart = parts[0];

  if (isLocale(firstPart)) {
    parts[0] = nextLocale;
    return `/${parts.join("/")}`;
  }

  return `/${nextLocale}${pathname === "/" ? "" : pathname}`;
}

const COPY: Record<CopyLocale, ContactCopy> = {
  en: {
    back: "Back",
    selectLanguage: "Select language",
    active: "Active",
    hero: {
      title: "Contact NEXA Rentals.",
      intro:
        "Send us a message about scooter rental, e-bike rental, bookings, licence rules, deposit, pickup location or anything else you need.",
      text:
        "We are based in Magaluf, Mallorca. Fill in the form and the NEXA Rentals team will get back to you as soon as possible.",
    },
    form: {
      eyebrow: "MESSAGE FORM",
      title: "Send us your request",
      text:
        "Write your details below. Keep the message clear so we can help you faster.",
      fullName: "Full name",
      email: "Email address",
      phone: "Phone number",
      subject: "Subject",
      message: "Your message",
      send: "Send Message",
      sending: "Sending...",
      success: "Thank you. Your message has been sent successfully.",
      error: "Failed to send message. Please try again.",
    },
    contact: {
      title: "Direct contact",
      text:
        "For fast questions, WhatsApp is usually the quickest option. For detailed requests, the form is better.",
      whatsapp: "WhatsApp",
      email: "Email",
      location: "Pickup location",
      openWhatsApp: "Open WhatsApp",
      openEmail: "Send Email",
      openDirections: "Open Directions",
    },
  },

  es: {
    back: "Volver",
    selectLanguage: "Seleccionar idioma",
    active: "Activo",
    hero: {
      title: "Contacta con NEXA Rentals.",
      intro:
        "Envíanos un mensaje sobre alquiler de scooters, e-bikes, reservas, normas de licencia, depósito, ubicación de recogida o cualquier duda.",
      text:
        "Estamos en Magaluf, Mallorca. Rellena el formulario y el equipo de NEXA Rentals responderá lo antes posible.",
    },
    form: {
      eyebrow: "FORMULARIO",
      title: "Envíanos tu consulta",
      text:
        "Escribe tus datos abajo. Cuanto más claro sea el mensaje, más rápido podremos ayudarte.",
      fullName: "Nombre completo",
      email: "Correo electrónico",
      phone: "Número de teléfono",
      subject: "Asunto",
      message: "Tu mensaje",
      send: "Enviar mensaje",
      sending: "Enviando...",
      success: "Gracias. Tu mensaje se ha enviado correctamente.",
      error: "No se pudo enviar el mensaje. Inténtalo de nuevo.",
    },
    contact: {
      title: "Contacto directo",
      text:
        "Para preguntas rápidas, WhatsApp suele ser la opción más rápida. Para consultas detalladas, usa el formulario.",
      whatsapp: "WhatsApp",
      email: "Email",
      location: "Lugar de recogida",
      openWhatsApp: "Abrir WhatsApp",
      openEmail: "Enviar email",
      openDirections: "Abrir ubicación",
    },
  },

  de: {
    back: "Zurück",
    selectLanguage: "Sprache wählen",
    active: "Aktiv",
    hero: {
      title: "Kontakt zu NEXA Rentals.",
      intro:
        "Sende uns eine Nachricht zu Scooter-Miete, E-Bike-Miete, Buchungen, Führerscheinregeln, Kaution, Abholort oder anderen Fragen.",
      text:
        "Wir befinden uns in Magaluf, Mallorca. Fülle das Formular aus und das NEXA Rentals Team meldet sich so schnell wie möglich.",
    },
    form: {
      eyebrow: "NACHRICHT",
      title: "Sende uns deine Anfrage",
      text:
        "Schreibe deine Daten unten ein. Je klarer die Nachricht ist, desto schneller können wir helfen.",
      fullName: "Vollständiger Name",
      email: "E-Mail-Adresse",
      phone: "Telefonnummer",
      subject: "Betreff",
      message: "Deine Nachricht",
      send: "Nachricht senden",
      sending: "Wird gesendet...",
      success: "Danke. Deine Nachricht wurde erfolgreich gesendet.",
      error: "Nachricht konnte nicht gesendet werden. Bitte versuche es erneut.",
    },
    contact: {
      title: "Direkter Kontakt",
      text:
        "Für kurze Fragen ist WhatsApp meistens am schnellsten. Für detaillierte Anfragen ist das Formular besser.",
      whatsapp: "WhatsApp",
      email: "E-Mail",
      location: "Abholort",
      openWhatsApp: "WhatsApp öffnen",
      openEmail: "E-Mail senden",
      openDirections: "Route öffnen",
    },
  },

  fr: {
    back: "Retour",
    selectLanguage: "Choisir la langue",
    active: "Actif",
    hero: {
      title: "Contactez NEXA Rentals.",
      intro:
        "Envoyez-nous un message pour la location de scooter, e-bike, réservation, règles de permis, caution, lieu de retrait ou toute autre question.",
      text:
        "Nous sommes basés à Magaluf, Majorque. Remplissez le formulaire et l’équipe NEXA Rentals vous répondra dès que possible.",
    },
    form: {
      eyebrow: "FORMULAIRE",
      title: "Envoyez votre demande",
      text:
        "Écrivez vos informations ci-dessous. Plus le message est clair, plus nous pourrons vous aider rapidement.",
      fullName: "Nom complet",
      email: "Adresse email",
      phone: "Numéro de téléphone",
      subject: "Sujet",
      message: "Votre message",
      send: "Envoyer le message",
      sending: "Envoi...",
      success: "Merci. Votre message a été envoyé avec succès.",
      error: "Impossible d’envoyer le message. Veuillez réessayer.",
    },
    contact: {
      title: "Contact direct",
      text:
        "Pour les questions rapides, WhatsApp est généralement l’option la plus rapide. Pour les demandes détaillées, utilisez le formulaire.",
      whatsapp: "WhatsApp",
      email: "Email",
      location: "Lieu de retrait",
      openWhatsApp: "Ouvrir WhatsApp",
      openEmail: "Envoyer un email",
      openDirections: "Ouvrir l’itinéraire",
    },
  },

  it: {
    back: "Indietro",
    selectLanguage: "Seleziona lingua",
    active: "Attiva",
    hero: {
      title: "Contatta NEXA Rentals.",
      intro:
        "Inviaci un messaggio per noleggio scooter, e-bike, prenotazioni, regole patente, deposito, luogo di ritiro o qualsiasi altra domanda.",
      text:
        "Siamo a Magaluf, Maiorca. Compila il modulo e il team NEXA Rentals ti risponderà il prima possibile.",
    },
    form: {
      eyebrow: "MODULO",
      title: "Inviaci la tua richiesta",
      text:
        "Scrivi i tuoi dati qui sotto. Più chiaro è il messaggio, più velocemente possiamo aiutarti.",
      fullName: "Nome completo",
      email: "Indirizzo email",
      phone: "Numero di telefono",
      subject: "Oggetto",
      message: "Il tuo messaggio",
      send: "Invia messaggio",
      sending: "Invio...",
      success: "Grazie. Il tuo messaggio è stato inviato correttamente.",
      error: "Impossibile inviare il messaggio. Riprova.",
    },
    contact: {
      title: "Contatto diretto",
      text:
        "Per domande rapide, WhatsApp è di solito l’opzione più veloce. Per richieste dettagliate, usa il modulo.",
      whatsapp: "WhatsApp",
      email: "Email",
      location: "Luogo di ritiro",
      openWhatsApp: "Apri WhatsApp",
      openEmail: "Invia email",
      openDirections: "Apri indicazioni",
    },
  },

  pt: {
    back: "Voltar",
    selectLanguage: "Selecionar idioma",
    active: "Ativo",
    hero: {
      title: "Contacte a NEXA Rentals.",
      intro:
        "Envie-nos uma mensagem sobre aluguer de scooter, e-bike, reservas, regras da carta, caução, local de levantamento ou qualquer outra questão.",
      text:
        "Estamos em Magaluf, Maiorca. Preencha o formulário e a equipa NEXA Rentals responderá o mais rápido possível.",
    },
    form: {
      eyebrow: "FORMULÁRIO",
      title: "Envie-nos o seu pedido",
      text:
        "Escreva os seus dados abaixo. Quanto mais clara for a mensagem, mais rápido poderemos ajudar.",
      fullName: "Nome completo",
      email: "Endereço de email",
      phone: "Número de telefone",
      subject: "Assunto",
      message: "A sua mensagem",
      send: "Enviar mensagem",
      sending: "A enviar...",
      success: "Obrigado. A sua mensagem foi enviada com sucesso.",
      error: "Não foi possível enviar a mensagem. Tente novamente.",
    },
    contact: {
      title: "Contacto direto",
      text:
        "Para perguntas rápidas, o WhatsApp é normalmente a opção mais rápida. Para pedidos detalhados, use o formulário.",
      whatsapp: "WhatsApp",
      email: "Email",
      location: "Local de levantamento",
      openWhatsApp: "Abrir WhatsApp",
      openEmail: "Enviar email",
      openDirections: "Abrir direções",
    },
  },

  sv: {
    back: "Tillbaka",
    selectLanguage: "Välj språk",
    active: "Aktiv",
    hero: {
      title: "Kontakta NEXA Rentals.",
      intro:
        "Skicka ett meddelande om scooteruthyrning, elcyklar, bokningar, körkortsregler, deposition, upphämtningsplats eller andra frågor.",
      text:
        "Vi finns i Magaluf, Mallorca. Fyll i formuläret så återkommer NEXA Rentals-teamet så snart som möjligt.",
    },
    form: {
      eyebrow: "FORMULÄR",
      title: "Skicka din fråga",
      text:
        "Skriv dina uppgifter nedan. Ju tydligare meddelandet är, desto snabbare kan vi hjälpa dig.",
      fullName: "Fullständigt namn",
      email: "E-postadress",
      phone: "Telefonnummer",
      subject: "Ämne",
      message: "Ditt meddelande",
      send: "Skicka meddelande",
      sending: "Skickar...",
      success: "Tack. Ditt meddelande har skickats.",
      error: "Det gick inte att skicka meddelandet. Försök igen.",
    },
    contact: {
      title: "Direktkontakt",
      text:
        "För snabba frågor är WhatsApp vanligtvis snabbast. För detaljerade frågor är formuläret bättre.",
      whatsapp: "WhatsApp",
      email: "Email",
      location: "Upphämtningsplats",
      openWhatsApp: "Öppna WhatsApp",
      openEmail: "Skicka email",
      openDirections: "Öppna vägbeskrivning",
    },
  },
};

export default function ContactPage() {
  const providerLocale = useLocale();
  const pathname = usePathname() || "/";
  const router = useRouter();

  const pathLocale = getLocaleFromPath(pathname);
  const locale: Locale = isLocale(providerLocale) ? providerLocale : pathLocale;
  const copyLocale = getSafeCopyLocale(locale);
  const copy = COPY[copyLocale];

  const [langOpen, setLangOpen] = useState(false);
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

  const currentLanguage = useMemo(() => {
    return LANGUAGES.find((language) => language.code === locale) || LANGUAGES[0];
  }, [locale]);

  const backHref = `/${locale}/home`;

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setLangOpen(false);
      }
    }

    window.addEventListener("keydown", closeOnEscape);

    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  function handleLanguageChange(nextLocale: Locale) {
    setLangOpen(false);

    const nextPath = replaceLocaleInPath(pathname, nextLocale);
    const queryString =
      typeof window !== "undefined" ? window.location.search : "";
    const finalPath = `${nextPath}${queryString}`;

    router.push(finalPath);

    window.setTimeout(() => {
      router.refresh();
    }, 50);
  }

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          locale,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || copy.form.error);
      }

      setSuccessMessage(copy.form.success);
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : copy.form.error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <main
        className={`${pageFont.className} min-h-screen bg-white text-[#26313d] selection:bg-black selection:text-white`}
        style={{ fontFamily: pageFont.style.fontFamily }}
      >
        <div className="fixed left-5 top-5 z-[100] md:left-8 md:top-8">
          <Link
            href={backHref}
            className="inline-flex min-h-[46px] items-center justify-center gap-2 border border-[#26313d]/20 bg-white/90 px-5 text-[12px] font-extrabold uppercase tracking-[0.18em] text-[#26313d] shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur-xl transition duration-300 hover:border-[#26313d] hover:bg-[#26313d] hover:text-white"
          >
            <span className="text-lg leading-none">←</span>
            <span>{copy.back}</span>
          </Link>
        </div>

        <div className="fixed right-5 top-5 z-[100] md:right-8 md:top-8">
          <div className="relative">
            <button
              type="button"
              onClick={() => setLangOpen((current) => !current)}
              className="inline-flex min-h-[46px] min-w-[96px] items-center justify-center gap-2 border border-[#26313d]/20 bg-white/90 px-4 text-[12px] font-extrabold uppercase tracking-[0.16em] text-[#26313d] shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur-xl transition duration-300 hover:border-[#26313d] hover:bg-white"
              aria-label={copy.selectLanguage}
              aria-expanded={langOpen}
            >
              <Image
                src={currentLanguage.flagSrc}
                alt={currentLanguage.label}
                width={18}
                height={18}
                className="rounded-full"
              />
              <span>{currentLanguage.short}</span>
              <span
                className={[
                  "text-[10px] transition-transform duration-300",
                  langOpen ? "rotate-180" : "rotate-0",
                ].join(" ")}
              >
                ▾
              </span>
            </button>

            <div
              className={[
                "absolute right-0 top-[calc(100%+10px)] z-[110] w-[245px] border border-[#26313d]/14 bg-white/95 p-2 text-[#26313d] shadow-[0_26px_90px_rgba(0,0,0,0.18)] backdrop-blur-2xl transition-all duration-300",
                langOpen
                  ? "translate-y-0 scale-100 opacity-100"
                  : "pointer-events-none -translate-y-2 scale-[0.98] opacity-0",
              ].join(" ")}
            >
              <div className="px-3 pb-2 pt-2 text-[10px] font-extrabold uppercase tracking-[0.22em] text-[#26313d]/42">
                {copy.selectLanguage}
              </div>

              <div className="max-h-[430px] overflow-y-auto">
                {LANGUAGES.map((language) => {
                  const active = language.code === locale;

                  return (
                    <button
                      key={language.code}
                      type="button"
                      onClick={() => handleLanguageChange(language.code)}
                      className={[
                        "flex w-full items-center justify-between px-3 py-2.5 text-left transition active:scale-[0.98]",
                        active
                          ? "bg-[#26313d] text-white"
                          : "text-[#26313d]/72 hover:bg-[#26313d]/[0.06] hover:text-[#26313d]",
                      ].join(" ")}
                    >
                      <span className="flex items-center gap-3">
                        <Image
                          src={language.flagSrc}
                          alt={language.label}
                          width={22}
                          height={22}
                          className="rounded-full shadow-[0_0_0_1px_rgba(38,49,61,0.12)]"
                        />
                        <span className="text-sm font-semibold">
                          {language.label}
                        </span>
                      </span>

                      <span
                        className={[
                          "text-[10px] font-extrabold uppercase tracking-[0.16em]",
                          active ? "text-white" : "text-[#26313d]/38",
                        ].join(" ")}
                      >
                        {active ? copy.active : language.short}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <section className="border-b border-[#26313d]/12 bg-white">
          <div className="mx-auto grid max-w-6xl gap-14 px-6 pb-16 pt-[104px] md:px-10 md:pb-24 md:pt-[118px] lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
            <div>
              <h1 className="max-w-4xl text-[42px] font-semibold leading-[1.08] tracking-[-0.045em] text-[#26313d] sm:text-[56px] md:text-[72px]">
                {copy.hero.title}
              </h1>

              <p className="mt-7 max-w-3xl text-[18px] font-medium leading-8 tracking-[-0.01em] text-[#26313d]/82 md:text-[21px] md:leading-9">
                {copy.hero.intro}
              </p>

              <p className="mt-5 max-w-3xl text-[15px] leading-8 text-[#26313d]/68 md:text-[16px]">
                {copy.hero.text}
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="border border-[#26313d]/20 bg-white p-6 md:p-8"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#26313d]/50">
                {copy.form.eyebrow}
              </p>

              <h2 className="mt-4 text-[30px] font-semibold leading-[1.1] tracking-[-0.035em] text-[#26313d] md:text-[42px]">
                {copy.form.title}
              </h2>

              <p className="mt-4 text-[15px] leading-7 text-[#26313d]/62">
                {copy.form.text}
              </p>

              <div className="mt-8 grid gap-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <InputField
                    type="text"
                    name="fullName"
                    placeholder={copy.form.fullName}
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />

                  <InputField
                    type="email"
                    name="email"
                    placeholder={copy.form.email}
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <InputField
                    type="tel"
                    name="phone"
                    placeholder={copy.form.phone}
                    value={formData.phone}
                    onChange={handleChange}
                  />

                  <InputField
                    type="text"
                    name="subject"
                    placeholder={copy.form.subject}
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />
                </div>

                <textarea
                  name="message"
                  placeholder={copy.form.message}
                  rows={7}
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="resize-none border border-[#26313d]/20 bg-white px-4 py-4 text-[15px] font-medium text-[#26313d] outline-none transition duration-300 placeholder:text-[#26313d]/38 focus:border-[#26313d]"
                />

                {successMessage ? (
                  <div className="border border-green-700/25 bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">
                    {successMessage}
                  </div>
                ) : null}

                {errorMessage ? (
                  <div className="border border-red-700/25 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
                    {errorMessage}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 inline-flex min-h-[54px] items-center justify-center border border-[#26313d] bg-[#26313d] px-8 text-[12px] font-extrabold uppercase tracking-[0.18em] text-white transition duration-300 hover:bg-white hover:text-[#26313d] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? copy.form.sending : copy.form.send}
                </button>
              </div>
            </form>
          </div>
        </section>

        <section className="bg-white">
          <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:px-10 md:py-24 lg:grid-cols-[0.86fr_1.14fr]">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.24em] text-[#26313d]/50">
                {copy.contact.title}
              </p>

              <h2 className="mt-5 max-w-2xl text-[30px] font-semibold leading-[1.14] tracking-[-0.035em] text-[#26313d] md:text-[46px]">
                {copy.contact.text}
              </h2>
            </div>

            <div className="border border-[#26313d]/20 bg-white">
              <ContactRow
                label={copy.contact.whatsapp}
                value={PHONE_DISPLAY}
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                action={copy.contact.openWhatsApp}
              />

              <ContactRow
                label={copy.contact.email}
                value={EMAIL}
                href={`mailto:${EMAIL}`}
                action={copy.contact.openEmail}
              />

              <ContactRow
                label={copy.contact.location}
                value={ADDRESS}
                href={MAPS_LINK}
                action={copy.contact.openDirections}
              />
            </div>
          </div>
        </section>
      </main>

      <style jsx global>{`
        body {
          background: #ffffff;
        }
      `}</style>
    </>
  );
}

function InputField({
  type,
  name,
  placeholder,
  value,
  onChange,
  required = false,
}: {
  type: string;
  name: string;
  placeholder: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}) {
  return (
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      className="border border-[#26313d]/20 bg-white px-4 py-4 text-[15px] font-medium text-[#26313d] outline-none transition duration-300 placeholder:text-[#26313d]/38 focus:border-[#26313d]"
    />
  );
}

function ContactRow({
  label,
  value,
  href,
  action,
}: {
  label: string;
  value: string;
  href: string;
  action: string;
}) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      className="grid gap-3 border-b border-[#26313d]/20 p-5 transition duration-300 last:border-b-0 hover:bg-[#26313d]/[0.035] md:grid-cols-[0.55fr_1fr_0.55fr] md:items-center"
    >
      <div className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-[#26313d]/45">
        {label}
      </div>

      <div className="text-[15px] font-semibold text-[#26313d]">{value}</div>

      <div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#26313d] md:text-right">
        {action}
      </div>
    </a>
  );
}