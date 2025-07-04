import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  // Typically corresponds to the `[locale]` segment
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: {
      common: (await import(`../locales/${locale}/common.json`)).default,
      errors: (await import(`../locales/${locale}/errors.json`)).default,
      settings: (await import(`../locales/${locale}/settings.json`)).default,
    },
  };
});
