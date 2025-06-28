import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'common' });

  return {
    metadataBase: new URL('https://elhornito.vercel.app'),
    title: t('app.title'),
    description: t('app.description'),
    keywords: t('app.keywords').split(', '),
    authors: [{ name: t('app.author') }],
    creator: t('app.publisher'),
    publisher: t('app.publisher'),
    openGraph: {
      title: t('app.title'),
      description: t('app.ogDescription'),
      url: 'https://elhornito.vercel.app',
      siteName: t('app.title').split(' - ')[0],
      images: [
        {
          url: '/og-image.jpg',
          width: 1200,
          height: 630,
          alt: t('app.ogAlt'),
        },
      ],
      locale: locale === 'en' ? 'en_US' : locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('app.title'),
      description: t('app.twitterDescription'),
      images: ['/og-image.jpg'],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

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
