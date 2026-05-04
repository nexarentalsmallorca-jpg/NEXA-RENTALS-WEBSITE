import React from "react";
import AdminShell from "../components/dashboard/AdminShell";

export default function AdminNexaSecretLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminShell>{children}</AdminShell>;
}