// app/(root)/layout.tsx

import "../globals.css";

type Props = {
  children: React.ReactNode;
};

export default function RootRedirectLayout({ children }: Props) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}