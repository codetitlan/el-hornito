'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { settingsManager } from '@/lib/settings';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLocaleChange = (newLocale: string) => {
    // Prevent unnecessary navigation if already on the same locale
    if (newLocale === locale) {
      return;
    }

    // Save locale preference to settings
    settingsManager.setLocale(newLocale as 'en' | 'es');

    // Use Next.js router to handle locale change properly
    const currentPath = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, '');
    const newPath = `/${newLocale}${currentPath}`;

    // Use Next.js router.push for proper navigation
    router.push(newPath);
  };

  return (
    <select
      value={locale}
      onChange={(e) => handleLocaleChange(e.target.value)}
      className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      aria-label="Select language"
    >
      <option value="en">🇺🇸 EN</option>
      <option value="es">🇪🇸 ES</option>
    </select>
  );
}
