import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Geist, Geist_Mono } from 'next/font/google';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { routing } from '@/i18n/routing';
import '../globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

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

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // Ensure that the incoming `locale` is valid
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          <ErrorBoundary>{children}</ErrorBoundary>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
