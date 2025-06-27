import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'El Hornito - Fridge to Recipe AI',
  description:
    'Transform your fridge contents into delicious recipes with AI. Upload a photo of your fridge and get personalized recipe suggestions instantly.',
  keywords: [
    'recipe',
    'AI',
    'cooking',
    'fridge',
    'ingredients',
    'food',
    'Claude AI',
  ],
  authors: [{ name: 'El Hornito Team' }],
  creator: 'El Hornito',
  publisher: 'El Hornito',
  openGraph: {
    title: 'El Hornito - Fridge to Recipe AI',
    description:
      'Transform your fridge contents into delicious recipes with AI',
    url: 'https://elhornito.vercel.app',
    siteName: 'El Hornito',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'El Hornito - Fridge to Recipe AI',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'El Hornito - Fridge to Recipe AI',
    description:
      'Transform your fridge contents into delicious recipes with AI',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
