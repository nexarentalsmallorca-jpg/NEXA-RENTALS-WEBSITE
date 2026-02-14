"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function Navbar() {
  const navRef = useRef<HTMLElement | null>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    // Measure navbar height for content offset
    const setNavOffset = () => {
      if (!navRef.current) return;
      const navHeight = navRef.current.offsetHeight;
      const topGap = 16; // top-4
      document.documentElement.style.setProperty(
        "--nav-offset",
        `${navHeight + topGap + 12}px`
      );
    };

    setNavOffset();
    window.addEventListener("resize", setNavOffset);

    // ✅ Simple + guaranteed hide behavior:
    // hide if scrollY > 120, show if <= 120
    const onScroll = () => {
      const y = window.scrollY;
      setHidden(y > 120);
      // Debug (uncomment once to test)
      // console.log("scrollY:", y, "hidden:", y > 1);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // run once at start

    return () => {
      window.removeEventListener("resize", setNavOffset);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <header
      ref={(el) => {
        navRef.current = el;
      }}
      className={[
        "fixed left-0 right-0 z-[9999] top-4",
        "transition-all duration-700 ease-out",
        hidden ? "-translate-y-[160%] opacity-0" : "translate-y-0 opacity-100",
      ].join(" ")}
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex items-center justify-between">
          <a href="/" className="block select-none">
            <Image
              src="/images/logo.png"
              alt="NEXA Rentals"
              width={210}
              height={70}
              priority
              className="h-14 w-auto md:h-26"
            />
          </a>

          <nav className="hidden md:flex items-center gap-10">
            <a className="nav-link" href="/">Home</a>
            <a className="nav-link" href="/#fleet">Our Fleet</a>
            <a className="nav-link" href="/#blogs">Blogs</a>
            <a className="nav-link" href="/#contact">Contact</a>
            <a className="nav-link" href="/#about">About Us</a>
          </nav>
        </div>
      </div>
    </header>
  );
}
