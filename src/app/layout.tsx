import { ReactNode } from 'react';

// Minimal root layout - the middleware will handle redirects to /en
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
