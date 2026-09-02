// app/admin-nexa-secret/layout.tsx

import "../globals.css";

type Props = {
  children: React.ReactNode;
};

export default function AdminNexaSecretLayout({ children }: Props) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}