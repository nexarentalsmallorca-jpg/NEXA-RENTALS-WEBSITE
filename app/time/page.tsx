"use client";

import dynamic from "next/dynamic";

const TimeClient = dynamic(() => import("./TimeClient"), { ssr: false });

export default function TimePage() {
  return <TimeClient />;
}
