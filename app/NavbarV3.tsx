"use client";

import Image from "next/image";
import Link from "next/link";
import { Poppins } from "next/font/google";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const navFont = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

type Locale =
  | "en"
  | "es"
  | "de"
  | "fr"
  | "sv"
  | "it"
  | "pt"
  | "nl"
  | "pl"
  | "da"
  | "no"
  | "cs"
  | "uk";

type NavbarTone = "dark" | "light" | "auto";

type NavbarV3Props = {
  fixed?: boolean;
  onBookClick?: () => void;
  tone?: NavbarTone;
};

declare global {
  interface Window {
    __nexaBookNowClicked?: boolean;
    __nexaTriggerBookingPanelAttention?: boolean;
  }
}

const LANGUAGES: {
  code: Locale;
  label: string;
  short: string;
  flagSrc: string;
}[] = [
  {
    code: "en",
    label: "English",
    short: "EN",
    flagSrc: "/images/en.png",
  },
  {
    code: "es",
    label: "Español",
    short: "ES",
    flagSrc: "/images/es.png",
  },
  {
    code: "de",
    label: "Deutsch",
    short: "DE",
    flagSrc: "/images/de.png",
  },
  {
    code: "fr",
    label: "Français",
    short: "FR",
    flagSrc: "/images/fr.png",
  },
  {
    code: "it",
    label: "Italiano",
    short: "IT",
    flagSrc: "/images/it.png",
  },
  {
    code: "nl",
    label: "Nederlands",
    short: "NL",
    flagSrc: "/images/NL.png",
  },
  {
    code: "pl",
    label: "Polski",
    short: "PL",
    flagSrc: "/images/PL.png",
  },
  {
    code: "sv",
    label: "Svenska",
    short: "SV",
    flagSrc: "/images/sv.png",
  },
  {
    code: "da",
    label: "Dansk",
    short: "DA",
    flagSrc: "/images/DA.png",
  },
  {
    code: "no",
    label: "Norsk",
    short: "NO",
    flagSrc: "/images/NO.png",
  },
  {
    code: "pt",
    label: "Português",
    short: "PT",
    flagSrc: "/images/pt.png",
  },
  {
    code: "cs",
    label: "Čeština",
    short: "CS",
    flagSrc: "/images/CS.png",
  },
  {
    code: "uk",
    label: "Українська",
    short: "UK",
    flagSrc: "/images/UK.png",
  },
];

/*
  DESKTOP ONLY:
  Change this value if you want the desktop logo bigger/smaller.
  Mobile logo is NOT controlled by this.
*/
const DESKTOP_LOGO_HEIGHT_PX = 72;

/*
  MOBILE ONLY:
  This controls how much the page starts lower under the mobile navbar.
*/
const MOBILE_PAGE_TOP_OFFSET_PX = 0;

/*
  MOBILE ONLY:
  This controls when the mobile navbar becomes fully black.
*/
const MOBILE_NAV_BLACK_SCROLL_TRIGGER_PX = 1;

const NAV_COPY: Record<
  Locale,
  {
    home: string;
    fleet: string;
    blog: string;
    about: string;
    contact: string;
    book: string;
    menu: string;
    close: string;
    selectLanguage: string;
    active: string;
  }
> = {
  en: {
    home: "Home",
    fleet: "Our Fleet",
    blog: "Blog",
    about: "About NEXA",
    contact: "Contact",
    book: "Book Now",
    menu: "Menu",
    close: "Close",
    selectLanguage: "Select language",
    active: "Active",
  },

  es: {
    home: "Inicio",
    fleet: "Flota",
    blog: "Blog",
    about: "Sobre NEXA",
    contact: "Contacto",
    book: "Reservar",
    menu: "Menú",
    close: "Cerrar",
    selectLanguage: "Seleccionar idioma",
    active: "Activo",
  },

  de: {
    home: "Home",
    fleet: "Flotte",
    blog: "Blog",
    about: "Über NEXA",
    contact: "Kontakt",
    book: "Buchen",
    menu: "Menü",
    close: "Schließen",
    selectLanguage: "Sprache wählen",
    active: "Aktiv",
  },

  fr: {
    home: "Accueil",
    fleet: "Flotte",
    blog: "Blog",
    about: "À propos",
    contact: "Contact",
    book: "Réserver",
    menu: "Menu",
    close: "Fermer",
    selectLanguage: "Choisir la langue",
    active: "Actif",
  },

  sv: {
    home: "Hem",
    fleet: "Vår flotta",
    blog: "Blogg",
    about: "Om NEXA",
    contact: "Kontakt",
    book: "Boka nu",
    menu: "Meny",
    close: "Stäng",
    selectLanguage: "Välj språk",
    active: "Aktiv",
  },

  it: {
    home: "Home",
    fleet: "Flotta",
    blog: "Blog",
    about: "Chi siamo",
    contact: "Contatto",
    book: "Prenota",
    menu: "Menu",
    close: "Chiudi",
    selectLanguage: "Seleziona lingua",
    active: "Attiva",
  },

  pt: {
    home: "Início",
    fleet: "Frota",
    blog: "Blog",
    about: "Sobre NEXA",
    contact: "Contacto",
    book: "Reservar",
    menu: "Menu",
    close: "Fechar",
    selectLanguage: "Selecionar idioma",
    active: "Ativo",
  },

  nl: {
    home: "Home",
    fleet: "Onze vloot",
    blog: "Blog",
    about: "Over NEXA",
    contact: "Contact",
    book: "Boek nu",
    menu: "Menu",
    close: "Sluiten",
    selectLanguage: "Taal kiezen",
    active: "Actief",
  },

  pl: {
    home: "Strona główna",
    fleet: "Nasza flota",
    blog: "Blog",
    about: "O NEXA",
    contact: "Kontakt",
    book: "Rezerwuj",
    menu: "Menu",
    close: "Zamknij",
    selectLanguage: "Wybierz język",
    active: "Aktywny",
  },

  da: {
    home: "Hjem",
    fleet: "Vores flåde",
    blog: "Blog",
    about: "Om NEXA",
    contact: "Kontakt",
    book: "Book nu",
    menu: "Menu",
    close: "Luk",
    selectLanguage: "Vælg sprog",
    active: "Aktiv",
  },

  no: {
    home: "Hjem",
    fleet: "Vår flåte",
    blog: "Blogg",
    about: "Om NEXA",
    contact: "Kontakt",
    book: "Book nå",
    menu: "Meny",
    close: "Lukk",
    selectLanguage: "Velg språk",
    active: "Aktiv",
  },

  cs: {
    home: "Domů",
    fleet: "Naše flotila",
    blog: "Blog",
    about: "O NEXA",
    contact: "Kontakt",
    book: "Rezervovat",
    menu: "Menu",
    close: "Zavřít",
    selectLanguage: "Vybrat jazyk",
    active: "Aktivní",
  },

  uk: {
    home: "Головна",
    fleet: "Наш парк",
    blog: "Блог",
    about: "Про NEXA",
    contact: "Контакти",
    book: "Забронювати",
    menu: "Меню",
    close: "Закрити",
    selectLanguage: "Вибрати мову",
    active: "Активна",
  },
};

function isLocale(
  value: string | undefined
): value is Locale {
  return Boolean(
    value &&
      LANGUAGES.some(
        (language) =>
          language.code === value
      )
  );
}

function getLocaleFromPath(
  pathname: string
): Locale {
  const firstPart =
    pathname
      .split("/")
      .filter(Boolean)[0];

  if (
    isLocale(firstPart)
  ) {
    return firstPart;
  }

  return "en";
}

export default function NavbarV3({
  fixed = false,
  onBookClick,
  tone = "auto",
}: NavbarV3Props) {
  const providerLocale =
    useLocale();

  const pathname =
    usePathname() || "/";

  const router =
    useRouter();

  const pathLocale =
    getLocaleFromPath(
      pathname
    );

  const locale: Locale =
    isLocale(providerLocale)
      ? providerLocale
      : pathLocale;

  const normalizedPathname =
    pathname.replace(
      /\/+$/,
      ""
    ) || "/";

  const isMainLandingPage =
    normalizedPathname === "/" ||
    normalizedPathname ===
      `/${locale}`;

  const showAngledLogoPanel =
    !isMainLandingPage;

  const copy =
    NAV_COPY[locale] ||
    NAV_COPY.en;

  const currentLanguage =
    useMemo(() => {
      return (
        LANGUAGES.find(
          (language) =>
            language.code === locale
        ) ||
        LANGUAGES[0]
      );
    }, [
      locale,
    ]);

  const [
    langOpen,
    setLangOpen,
  ] =
    useState(false);

  const [
    mobileMenuOpen,
    setMobileMenuOpen,
  ] =
    useState(false);

  const [
    autoLightTone,
    setAutoLightTone,
  ] =
    useState(false);

  const [
    bookNowClicked,
    setBookNowClicked,
  ] =
    useState(false);

  const [
    mobileScrolled,
    setMobileScrolled,
  ] =
    useState(false);

  const homeHref =
    `/${locale}/home`;

  const blogHref =
    `/${locale}/blog`;

  const aboutHref =
    `/${locale}/about`;

  const contactHref =
    `/${locale}/contact`;

  const navItems = [
    {
      label:
        copy.home,

      href:
        homeHref,
    },

    {
      label:
        copy.blog,

      href:
        blogHref,
    },

    {
      label:
        copy.about,

      href:
        aboutHref,
    },

    {
      label:
        copy.contact,

      href:
        contactHref,
    },
  ];

  useEffect(() => {
    if (
      typeof window ===
      "undefined"
    ) {
      return;
    }

    setBookNowClicked(
      Boolean(
        window.__nexaBookNowClicked
      )
    );
  }, []);

  useEffect(() => {
    if (
      typeof window ===
      "undefined"
    ) {
      return;
    }

    function getScrollTop() {
      return Math.max(
        window.scrollY || 0,
        document.documentElement
          .scrollTop || 0,
        document.body
          .scrollTop || 0
      );
    }

    function updateMobileScrolled() {
      setMobileScrolled(
        getScrollTop() >
          MOBILE_NAV_BLACK_SCROLL_TRIGGER_PX
      );
    }

    updateMobileScrolled();

    window.addEventListener(
      "scroll",
      updateMobileScrolled,
      {
        passive: true,
      }
    );

    window.addEventListener(
      "resize",
      updateMobileScrolled
    );

    document.addEventListener(
      "scroll",
      updateMobileScrolled,
      {
        passive: true,
        capture: true,
      }
    );

    return () => {
      window.removeEventListener(
        "scroll",
        updateMobileScrolled
      );

      window.removeEventListener(
        "resize",
        updateMobileScrolled
      );

      document.removeEventListener(
        "scroll",
        updateMobileScrolled,
        {
          capture: true,
        } as AddEventListenerOptions
      );
    };
  }, [
    pathname,
  ]);

  useEffect(() => {
    if (
      tone !== "auto"
    ) {
      return;
    }

    function updateToneFromBookingSection() {
      const bookingElement =
        document.getElementById(
          "booking"
        );

      if (
        !bookingElement
      ) {
        setAutoLightTone(
          false
        );

        return;
      }

      const rect =
        bookingElement.getBoundingClientRect();

      const viewportHeight =
        window.innerHeight ||
        document.documentElement
          .clientHeight;

      const sectionCenter =
        rect.top +
        rect.height / 2;

      const isBookingVisible =
        rect.top <
          viewportHeight *
            0.58 &&
        rect.bottom >
          viewportHeight *
            0.28 &&
        sectionCenter > 0;

      setAutoLightTone(
        isBookingVisible
      );
    }

    updateToneFromBookingSection();

    window.addEventListener(
      "scroll",
      updateToneFromBookingSection,
      {
        passive: true,
      }
    );

    window.addEventListener(
      "resize",
      updateToneFromBookingSection
    );

    return () => {
      window.removeEventListener(
        "scroll",
        updateToneFromBookingSection
      );

      window.removeEventListener(
        "resize",
        updateToneFromBookingSection
      );
    };
  }, [
    tone,
    pathname,
  ]);

  useEffect(() => {
    setLangOpen(
      false
    );

    setMobileMenuOpen(
      false
    );
  }, [
    pathname,
  ]);

  useEffect(() => {
    function closeOnEscape(
      event: KeyboardEvent
    ) {
      if (
        event.key ===
        "Escape"
      ) {
        setLangOpen(
          false
        );

        setMobileMenuOpen(
          false
        );
      }
    }

    window.addEventListener(
      "keydown",
      closeOnEscape
    );

    return () =>
      window.removeEventListener(
        "keydown",
        closeOnEscape
      );
  }, []);

  const isLightTone =
    tone === "light" ||
    (
      tone === "auto" &&
      autoLightTone
    );

  const navTextClass =
    isLightTone
      ? "text-[#202226] drop-shadow-[0_1px_14px_rgba(255,255,255,0.58)] hover:text-black"
      : "text-white/86 drop-shadow-[0_16px_36px_rgba(0,0,0,0.86)] hover:text-white";

  const navUnderlineClass =
    isLightTone
      ? "bg-[linear-gradient(90deg,transparent,rgba(32,34,38,0.95),rgba(255,157,61,1),rgba(32,34,38,0.95),transparent)] shadow-[0_0_14px_rgba(255,157,61,0.72)]"
      : "bg-[linear-gradient(90deg,transparent,rgba(255,157,61,1),rgba(255,255,255,0.86),rgba(255,157,61,1),transparent)] shadow-[0_0_14px_rgba(255,157,61,0.75)]";

  const navHoverTextShadowClass =
    isLightTone
      ? "group-hover:[text-shadow:0_0_12px_rgba(255,255,255,0.56),0_10px_26px_rgba(0,0,0,0.16)]"
      : "group-hover:[text-shadow:0_0_14px_rgba(255,157,61,0.24),0_0_10px_rgba(255,255,255,0.14),0_16px_36px_rgba(0,0,0,0.84)]";

  const languageButtonClass =
    isLightTone
      ? "border border-[#202226]/14 bg-white/12 text-[#202226] shadow-[0_16px_44px_rgba(255,255,255,0.18)] hover:border-[#202226]/26 hover:bg-white/20 hover:text-black"
      : "border border-white/14 bg-black/10 text-white/88 shadow-[0_16px_44px_rgba(0,0,0,0.36)] hover:border-white/30 hover:bg-white/[0.08] hover:text-white";

  const languageArrowClass =
    isLightTone
      ? "text-[#202226]/55 group-hover:text-black/80"
      : "text-white/50 group-hover:text-white/80";

  const desktopBookButtonClass =
    isLightTone
      ? "bg-[#24262b] text-white shadow-[0_22px_62px_rgba(24,25,30,0.30)] hover:bg-[#2b2e34] hover:shadow-[0_28px_80px_rgba(24,25,30,0.40)]"
      : "bg-white text-black shadow-[0_22px_62px_rgba(0,0,0,0.42)] hover:shadow-[0_28px_80px_rgba(255,255,255,0.20)]";

  const mobileNavShellClass =
    mobileScrolled
      ? "bg-black shadow-[0_18px_46px_rgba(0,0,0,0.58)] backdrop-blur-none"
      : "bg-transparent shadow-none backdrop-blur-0";

  const mobileLanguageButtonClass =
    mobileScrolled
      ? "border border-white/16 bg-white/[0.09] text-white shadow-[0_14px_34px_rgba(0,0,0,0.44)] hover:bg-white/[0.13]"
      : "border border-white/[0.16] bg-black/[0.28] text-white/94 shadow-[0_14px_34px_rgba(0,0,0,0.28)] hover:bg-black/[0.34]";

  const mobileLanguageDropdownClass =
    mobileScrolled
      ? "border-white/10 bg-black/94 text-white shadow-[0_26px_90px_rgba(0,0,0,0.72)]"
      : "border-white/10 bg-black/86 text-white shadow-[0_26px_90px_rgba(0,0,0,0.62)]";

  const mobilePanelClass =
    isLightTone
      ? "border border-[#202226]/10 bg-white/88 text-[#202226]/82 shadow-[0_26px_90px_rgba(0,0,0,0.30)]"
      : "border border-white/10 bg-black/88 text-white/82 shadow-[0_26px_90px_rgba(0,0,0,0.72)]";

  function closeMenus() {
    setLangOpen(
      false
    );

    setMobileMenuOpen(
      false
    );
  }

  function handleLanguageChange(
    nextLocale: Locale
  ) {
    closeMenus();

    const pathParts =
      pathname
        .split("/")
        .filter(Boolean);

    if (
      pathParts.length === 0
    ) {
      router.push(
        `/${nextLocale}`
      );

      return;
    }

    if (
      isLocale(
        pathParts[0]
      )
    ) {
      pathParts[0] =
        nextLocale;

      router.push(
        `/${pathParts.join("/")}`
      );

      return;
    }

    router.push(
      `/${nextLocale}`
    );
  }

  function handleBookClick() {
    closeMenus();

    if (
      typeof window !==
      "undefined"
    ) {
      window.__nexaBookNowClicked =
        true;

      window.__nexaTriggerBookingPanelAttention =
        true;

      window.dispatchEvent(
        new CustomEvent(
          "nexa:book-now-clicked"
        )
      );
    }

    setBookNowClicked(
      true
    );

    if (
      onBookClick
    ) {
      onBookClick();

      return;
    }

    const bookingElement =
      document.getElementById(
        "booking"
      );

    if (
      bookingElement
    ) {
      bookingElement.scrollIntoView({
        behavior:
          "smooth",

        block:
          "start",
      });

      return;
    }

    router.push(
      `/${locale}/home#booking`
    );
  }

  const headerPositionClass =
    fixed
      ? "fixed"
      : "fixed lg:absolute";

  return (
    <header
      data-mobile-scrolled={
        mobileScrolled
          ? "true"
          : "false"
      }
      className={`${navFont.className} ${headerPositionClass} nexa-navbar-shell pointer-events-none left-0 right-0 top-0 z-[2147483000] bg-transparent lg:z-[90]`}
    >
      {showAngledLogoPanel ? (
        <div className="nexa-angled-logo-panel pointer-events-none absolute left-0 top-0 hidden lg:block" />
      ) : null}

      <div className="nexa-desktop-nav pointer-events-auto mx-auto hidden h-[96px] max-w-[1510px] items-center justify-between bg-transparent px-[clamp(28px,4vw,66px)] transition-all duration-300 lg:flex">
        <Link
          href={
            homeHref
          }
          aria-label="NEXA Rentals home"
          onClick={
            closeMenus
          }
          className="group relative z-10 flex items-center"
        >
          <Image
            src="/images/reallogo.png"
            alt="NEXA Rentals"
            width={340}
            height={116}
            priority
            style={{
              height:
                DESKTOP_LOGO_HEIGHT_PX,

              width:
                "auto",
            }}
            className={[
              "nexa-desktop-logo object-contain transition duration-300 group-hover:scale-[1.03]",

              showAngledLogoPanel ||
              isLightTone
                ? "drop-shadow-[0_14px_28px_rgba(0,0,0,0.55)]"
                : "drop-shadow-[0_18px_34px_rgba(0,0,0,0.72)]",
            ].join(" ")}
          />
        </Link>

        <nav className="ml-auto mr-9 flex items-center gap-7">
          {navItems.map(
            (item) => (
              <Link
                key={
                  item.href
                }
                href={
                  item.href
                }
                onClick={
                  closeMenus
                }
                className={[
                  "group relative px-1 py-3 text-[11.5px] font-black uppercase tracking-[0.17em] transition-all duration-300 hover:-translate-y-0.5 hover:tracking-[0.19em]",
                  navTextClass,
                  navHoverTextShadowClass,
                ].join(" ")}
              >
                <span>
                  {
                    item.label
                  }
                </span>

                <span
                  className={[
                    "pointer-events-none absolute bottom-1 left-1/2 h-px w-0 -translate-x-1/2 opacity-0 transition-all duration-300 group-hover:w-full group-hover:opacity-100",
                    navUnderlineClass,
                  ].join(" ")}
                />
              </Link>
            )
          )}
        </nav>

        <div className="flex items-center gap-6">
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setLangOpen(
                  (
                    current
                  ) =>
                    !current
                );

                setMobileMenuOpen(
                  false
                );
              }}
              className={[
                "group flex h-10 min-w-[92px] items-center justify-center gap-2 rounded-full px-4 text-[11px] font-black uppercase tracking-[0.16em] backdrop-blur-xl transition-all duration-300 active:scale-95",
                languageButtonClass,
              ].join(" ")}
              aria-label={
                copy.selectLanguage
              }
              aria-expanded={
                langOpen
              }
            >
              <Image
                src={
                  currentLanguage.flagSrc
                }
                alt={
                  currentLanguage.label
                }
                width={18}
                height={18}
                className="rounded-full"
              />

              <span>
                {
                  currentLanguage.short
                }
              </span>

              <span
                className={[
                  "text-[10px] transition-transform duration-300",
                  languageArrowClass,

                  langOpen
                    ? "rotate-180"
                    : "rotate-0",
                ].join(" ")}
              >
                ▾
              </span>
            </button>

            <div
              className={[
                "absolute right-0 top-[calc(100%+12px)] z-[95] w-[245px] overflow-hidden rounded-[24px] border backdrop-blur-2xl transition-all duration-300",

                isLightTone
                  ? "border-[#202226]/10 bg-white/90 text-[#202226] shadow-[0_26px_90px_rgba(0,0,0,0.22)]"
                  : "border-white/10 bg-black/78 text-white shadow-[0_26px_90px_rgba(0,0,0,0.58)]",

                langOpen
                  ? "translate-y-0 scale-100 opacity-100"
                  : "pointer-events-none -translate-y-2 scale-[0.98] opacity-0",
              ].join(" ")}
            >
              <div
                className={[
                  "px-4 pb-2 pt-4 text-[10px] font-extrabold uppercase tracking-[0.22em]",

                  isLightTone
                    ? "text-[#202226]/44"
                    : "text-white/42",
                ].join(" ")}
              >
                {
                  copy.selectLanguage
                }
              </div>

              <div className="max-h-[430px] overflow-y-auto p-2">
                {LANGUAGES.map(
                  (
                    language
                  ) => {
                    const active =
                      language.code ===
                      locale;

                    return (
                      <button
                        key={
                          language.code
                        }
                        type="button"
                        onClick={() =>
                          handleLanguageChange(
                            language.code
                          )
                        }
                        className={[
                          "group flex w-full cursor-pointer items-center justify-between rounded-[18px] px-3 py-2.5 text-left opacity-100 transition hover:scale-[1.01] active:scale-[0.98]",

                          isLightTone
                            ? active
                              ? "bg-[#202226]/8 text-[#202226]"
                              : "text-[#202226]/68 hover:bg-[#202226]/[0.055] hover:text-[#202226]"
                            : active
                              ? "bg-white/[0.10] text-white"
                              : "text-white/68 hover:bg-white/[0.065] hover:text-white",
                        ].join(
                          " "
                        )}
                      >
                        <span className="flex items-center gap-3">
                          <Image
                            src={
                              language.flagSrc
                            }
                            alt={
                              language.label
                            }
                            width={
                              22
                            }
                            height={
                              22
                            }
                            className={[
                              "rounded-full",

                              isLightTone
                                ? "shadow-[0_0_0_1px_rgba(31,33,37,0.14)]"
                                : "shadow-[0_0_0_1px_rgba(255,255,255,0.16)]",
                            ].join(
                              " "
                            )}
                          />

                          <span className="text-sm font-semibold">
                            {
                              language.label
                            }
                          </span>
                        </span>

                        <span
                          className={[
                            "text-[10px] font-extrabold uppercase tracking-[0.16em]",

                            active
                              ? "text-[#ff7a00]"
                              : isLightTone
                                ? "text-[#202226]/44"
                                : "text-white/44",
                          ].join(
                            " "
                          )}
                        >
                          {active
                            ? copy.active
                            : language.short}
                        </span>
                      </button>
                    );
                  }
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={
              handleBookClick
            }
            className={[
              !bookNowClicked
                ? "book-now-pulse"
                : "",

              "group relative inline-flex items-center justify-center overflow-hidden rounded-full px-7 py-3.5 text-[11.5px] font-black uppercase tracking-[0.19em] transition duration-300 hover:-translate-y-0.5 hover:scale-[1.07] active:translate-y-0 active:scale-[0.90]",

              desktopBookButtonClass,
            ].join(" ")}
          >
            <span className="absolute inset-0 translate-x-[-120%] bg-[linear-gradient(90deg,transparent,rgba(255,157,61,0.34),transparent)] transition duration-700 group-hover:translate-x-[120%]" />

            <span
              className={[
                "absolute inset-0 rounded-full ring-1 ring-inset",

                isLightTone
                  ? "ring-white/16"
                  : "ring-black/10",
              ].join(" ")}
            />

            <span className="relative">
              {
                copy.book
              }
            </span>
          </button>
        </div>
      </div>

      <div
        className={[
          "nexa-mobile-nav pointer-events-auto flex h-[76px] items-center justify-between px-5 transition-all duration-300 lg:hidden",
          mobileNavShellClass,
        ].join(" ")}
      >
        <Link
          href={
            homeHref
          }
          aria-label="NEXA Rentals home"
          onClick={
            closeMenus
          }
          className="group relative z-10 flex items-center"
        >
          <Image
            src="/images/reallogo.png"
            alt="NEXA Rentals"
            width={300}
            height={100}
            priority
            className={[
              "relative h-[48px] w-auto object-contain",

              showAngledLogoPanel ||
              isLightTone
                ? "drop-shadow-[0_12px_28px_rgba(0,0,0,0.55)]"
                : "drop-shadow-[0_18px_34px_rgba(0,0,0,0.72)]",
            ].join(" ")}
          />
        </Link>

        <div className="relative z-20 flex items-center gap-4">
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setLangOpen(
                  (
                    current
                  ) =>
                    !current
                );

                setMobileMenuOpen(
                  false
                );
              }}
              className={[
                "inline-flex h-10 items-center justify-center gap-1.5 rounded-[14px] px-3 text-[11px] font-black uppercase tracking-[0.14em] backdrop-blur-xl transition active:scale-95",
                mobileLanguageButtonClass,
              ].join(" ")}
              aria-label={
                copy.selectLanguage
              }
              aria-expanded={
                langOpen
              }
            >
              <Image
                src={
                  currentLanguage.flagSrc
                }
                alt={
                  currentLanguage.label
                }
                width={17}
                height={17}
                className="rounded-full shadow-[0_0_0_1px_rgba(255,255,255,0.16)]"
              />

              <span>
                {
                  currentLanguage.short
                }
              </span>

              <span
                className={[
                  "text-[10px] text-white/72 transition-transform duration-300",

                  langOpen
                    ? "rotate-180"
                    : "rotate-0",
                ].join(" ")}
              >
                ▾
              </span>
            </button>

            <div
              className={[
                "absolute right-0 top-[calc(100%+12px)] z-[110] w-[224px] overflow-hidden rounded-[24px] border backdrop-blur-2xl transition-all duration-300",

                mobileLanguageDropdownClass,

                langOpen
                  ? "translate-y-0 scale-100 opacity-100"
                  : "pointer-events-none -translate-y-2 scale-[0.98] opacity-0",
              ].join(" ")}
            >
              <div className="px-4 pb-2 pt-4 text-[10px] font-extrabold uppercase tracking-[0.22em] text-white/42">
                {
                  copy.selectLanguage
                }
              </div>

              <div className="max-h-[360px] overflow-y-auto p-2">
                {LANGUAGES.map(
                  (
                    language
                  ) => {
                    const active =
                      language.code ===
                      locale;

                    return (
                      <button
                        key={
                          language.code
                        }
                        type="button"
                        onClick={() =>
                          handleLanguageChange(
                            language.code
                          )
                        }
                        className={[
                          "group flex w-full cursor-pointer items-center justify-between rounded-[18px] px-3 py-2.5 text-left opacity-100 transition hover:scale-[1.01] active:scale-[0.98]",

                          active
                            ? "bg-white/[0.12] text-white"
                            : "text-white/68 hover:bg-white/[0.065] hover:text-white",
                        ].join(
                          " "
                        )}
                      >
                        <span className="flex items-center gap-3">
                          <Image
                            src={
                              language.flagSrc
                            }
                            alt={
                              language.label
                            }
                            width={
                              21
                            }
                            height={
                              21
                            }
                            className="rounded-full shadow-[0_0_0_1px_rgba(255,255,255,0.16)]"
                          />

                          <span className="text-sm font-semibold">
                            {
                              language.label
                            }
                          </span>
                        </span>

                        <span
                          className={[
                            "text-[10px] font-extrabold uppercase tracking-[0.16em]",

                            active
                              ? "text-[#ff7a00]"
                              : "text-white/44",
                          ].join(
                            " "
                          )}
                        >
                          {active
                            ? copy.active
                            : language.short}
                        </span>
                      </button>
                    );
                  }
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(
                (
                  current
                ) =>
                  !current
              );

              setLangOpen(
                false
              );
            }}
            className="nexa-hamburger-button"
            aria-label={
              mobileMenuOpen
                ? copy.close
                : copy.menu
            }
            aria-expanded={
              mobileMenuOpen
            }
          >
            <span className="nexa-hamburger-lines">
              <span
                className={[
                  "nexa-hamburger-line",

                  mobileMenuOpen
                    ? "top-[10px] rotate-45"
                    : "top-0 rotate-0",
                ].join(" ")}
              />

              <span
                className={[
                  "nexa-hamburger-line top-[10px]",

                  mobileMenuOpen
                    ? "opacity-0"
                    : "opacity-100",
                ].join(" ")}
              />

              <span
                className={[
                  "nexa-hamburger-line",

                  mobileMenuOpen
                    ? "top-[10px] -rotate-45"
                    : "top-[20px] rotate-0",
                ].join(" ")}
              />
            </span>
          </button>
        </div>
      </div>

      <div
        className={[
          "pointer-events-auto fixed inset-x-4 top-[116px] z-[90] overflow-hidden rounded-[30px] backdrop-blur-2xl transition-all duration-300 lg:hidden",

          mobilePanelClass,

          mobileMenuOpen
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none -translate-y-4 scale-[0.98] opacity-0",
        ].join(" ")}
      >
        <nav className="flex flex-col p-3 text-sm font-semibold">
          {navItems.map(
            (item) => (
              <Link
                key={
                  item.href
                }
                href={
                  item.href
                }
                onClick={
                  closeMenus
                }
                className={[
                  "rounded-[22px] px-4 py-3 transition active:scale-[0.98]",

                  isLightTone
                    ? "hover:bg-[#202226]/[0.055] hover:text-black"
                    : "hover:bg-white/[0.065] hover:text-white",
                ].join(" ")}
              >
                {
                  item.label
                }
              </Link>
            )
          )}

          <div
            className={[
              "mt-2 border-t pt-3",

              isLightTone
                ? "border-[#202226]/10"
                : "border-white/10",
            ].join(" ")}
          >
            <div
              className={[
                "px-4 pb-2 text-[10px] font-extrabold uppercase tracking-[0.22em]",

                isLightTone
                  ? "text-[#202226]/38"
                  : "text-white/38",
              ].join(" ")}
            >
              {
                copy.selectLanguage
              }
            </div>

            <div className="grid max-h-[260px] grid-cols-2 gap-2 overflow-y-auto px-2 pb-2">
              {LANGUAGES.map(
                (
                  language
                ) => {
                  const active =
                    language.code ===
                    locale;

                  return (
                    <button
                      key={
                        language.code
                      }
                      type="button"
                      onClick={() =>
                        handleLanguageChange(
                          language.code
                        )
                      }
                      className={[
                        "flex cursor-pointer items-center justify-between gap-2 rounded-[18px] px-3 py-2.5 text-left text-xs opacity-100 transition hover:scale-[1.02] active:scale-[0.98]",

                        isLightTone
                          ? active
                            ? "bg-[#202226]/8 text-[#202226]"
                            : "text-[#202226]/66 hover:bg-[#202226]/[0.055] hover:text-[#202226]"
                          : active
                            ? "bg-white/[0.12] text-white"
                            : "text-white/66 hover:bg-white/[0.065] hover:text-white",
                      ].join(
                        " "
                      )}
                    >
                      <Image
                        src={
                          language.flagSrc
                        }
                        alt={
                          language.label
                        }
                        width={
                          18
                        }
                        height={
                          18
                        }
                        className="rounded-full"
                      />

                      <span className="font-extrabold uppercase tracking-[0.14em]">
                        {
                          language.short
                        }
                      </span>
                    </button>
                  );
                }
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={
              handleBookClick
            }
            className={[
              !bookNowClicked
                ? "book-now-pulse"
                : "",

              "mt-3 rounded-full px-4 py-3.5 text-center text-[11px] font-black uppercase tracking-[0.2em] transition hover:scale-[1.04] active:scale-[0.92]",

              isLightTone
                ? "bg-[#24262b] text-white shadow-[0_18px_50px_rgba(24,25,30,0.22)] hover:bg-[#2b2e34] hover:shadow-[0_22px_62px_rgba(24,25,30,0.30)]"
                : "bg-white text-black shadow-[0_18px_50px_rgba(255,255,255,0.12)] hover:shadow-[0_22px_62px_rgba(255,255,255,0.18)]",
            ].join(" ")}
          >
            {
              copy.book
            }
          </button>
        </nav>
      </div>

      <style jsx global>{`
        html,
        body {
          width: 100%;
          max-width: 100%;
          overflow-x: hidden;
        }

        @media (max-width: 1023px) {
          body {
            padding-top: ${MOBILE_PAGE_TOP_OFFSET_PX}px !important;
          }

          .nexa-navbar-shell {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            z-index: 2147483000 !important;
            isolation: isolate !important;
            transform: translateZ(0) !important;
            -webkit-transform: translateZ(0) !important;
          }

          .nexa-navbar-shell
            .nexa-mobile-nav {
            position: relative !important;
            z-index: 2 !important;
          }
        }

        .nexa-navbar-shell[data-mobile-scrolled="true"]
          .nexa-mobile-nav {
          background: #000000 !important;
          box-shadow: 0 18px 46px
            rgba(
              0,
              0,
              0,
              0.58
            ) !important;
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
        }

        .nexa-navbar-shell[data-mobile-scrolled="false"]
          .nexa-mobile-nav {
          background: transparent !important;
          box-shadow: none !important;
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
        }

        .nexa-angled-logo-panel {
          width:
            min(
              48vw,
              760px
            );
          min-width: 500px;
          height: 96px;
          background: #000000;
          clip-path:
            polygon(
              0 0,
              100% 0,
              calc(
                  100% -
                    92px
                )
                100%,
              0 100%
            );
          box-shadow:
            0 20px 54px
            rgba(
              0,
              0,
              0,
              0.28
            );
        }

        .nexa-desktop-logo {
          max-height: 86px;
        }

        .nexa-hamburger-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          padding: 0;
          margin: 0;
          border: none !important;
          outline: none !important;
          background: none !important;
          background-color: transparent !important;
          background-image: none !important;
          box-shadow: none !important;
          appearance: none;
          -webkit-appearance: none;
          -webkit-tap-highlight-color: transparent;
          cursor: pointer;
        }

        .nexa-hamburger-button::before,
        .nexa-hamburger-button::after {
          display: none !important;
          content: none !important;
        }

        .nexa-hamburger-button:hover,
        .nexa-hamburger-button:focus,
        .nexa-hamburger-button:active,
        .nexa-hamburger-button:focus-visible {
          border: none !important;
          outline: none !important;
          background: none !important;
          background-color: transparent !important;
          background-image: none !important;
          box-shadow: none !important;
        }

        .nexa-hamburger-lines {
          position: relative;
          display: block;
          width: 31px;
          height: 23px;
          background: transparent !important;
          box-shadow: none !important;
        }

        .nexa-hamburger-line {
          position: absolute;
          left: 0;
          display: block;
          width: 31px;
          height: 3.2px;
          border-radius: 999px;
          background: #ffffff;
          box-shadow:
            0 0 10px
              rgba(
                255,
                255,
                255,
                0.7
              ),
            0 2px 5px
              rgba(
                0,
                0,
                0,
                0.35
              );
          transform-origin: center;
          transition:
            top 260ms ease,
            transform 260ms ease,
            opacity 200ms ease;
        }

        .book-now-pulse {
          animation:
            nexa-book-heartbeat
            1.8s ease-in-out
            infinite;
          will-change: transform;
        }

        .book-now-pulse:hover {
          animation: none;
        }

        @keyframes nexa-book-heartbeat {
          0% {
            transform:
              scale(1);
          }

          12% {
            transform:
              scale(1.055);
          }

          22% {
            transform:
              scale(1);
          }

          34% {
            transform:
              scale(1.035);
          }

          46% {
            transform:
              scale(1);
          }

          100% {
            transform:
              scale(1);
          }
        }

        @media (max-width: 1023px) {
          .nexa-mobile-nav {
            margin-top: 0 !important;
            border-top: 0 !important;
          }

        }

        @media (min-width: 1024px) and (max-height: 700px) {
          .nexa-desktop-nav {
            height: 78px;
          }

          .nexa-desktop-logo {
            height: 52px !important;
          }

          .nexa-angled-logo-panel {
            height: 78px;
            width:
              min(
                47vw,
                680px
              );
            min-width: 430px;
            clip-path:
              polygon(
                0 0,
                100% 0,
                calc(
                    100% -
                      74px
                  )
                  100%,
                0 100%
              );
          }
        }

        @media (min-width: 1024px) and (max-width: 1220px) {
          .nexa-desktop-nav
            nav {
            gap: 16px;
          }

          .nexa-desktop-nav
            nav
            a {
            font-size:
              10.5px;
            letter-spacing:
              0.145em;
          }

          .nexa-desktop-nav
            nav
            a:hover {
            letter-spacing:
              0.155em;
          }

          .nexa-angled-logo-panel {
            width:
              min(
                50vw,
                650px
              );
            min-width:
              420px;
            clip-path:
              polygon(
                0 0,
                100% 0,
                calc(
                    100% -
                      72px
                  )
                  100%,
                0 100%
              );
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .book-now-pulse {
            animation: none;
          }

        }
      `}</style>
    </header>
  );
}