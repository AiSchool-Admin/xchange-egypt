'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useRef, useEffect, useTransition } from 'react';

const languages = [
  { code: 'ar', name: 'العربية', flag: '🇪🇬', dir: 'rtl' },
  { code: 'en', name: 'English', flag: '🇬🇧', dir: 'ltr' },
];

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage = languages.find(lang => lang.code === locale) || languages[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const switchLanguage = (newLocale: string) => {
    // Get clean path without locale prefix
    let cleanPath = pathname;

    // Remove existing locale prefix if present
    const localePattern = /^\/(ar|en)(\/|$)/;
    if (localePattern.test(pathname)) {
      cleanPath = pathname.replace(localePattern, '/');
      if (cleanPath === '') cleanPath = '/';
    }

    // Build new path
    let newPath: string;
    if (newLocale === 'ar') {
      // Arabic is default, no prefix needed
      newPath = cleanPath;
    } else {
      // Other locales need prefix
      newPath = `/${newLocale}${cleanPath === '/' ? '' : cleanPath}`;
    }

    startTransition(() => {
      router.push(newPath);
      router.refresh();
    });
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${isPending ? 'opacity-50' : ''}`}
        aria-label="Switch language"
      >
        <span className="text-lg">{currentLanguage.flag}</span>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:inline">
          {currentLanguage.name}
        </span>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 min-w-[150px] z-50">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => switchLanguage(language.code)}
              disabled={isPending}
              className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                locale === language.code ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              <span className="text-lg">{language.flag}</span>
              <span className="font-medium">{language.name}</span>
              {locale === language.code && (
                <svg className="w-4 h-4 mr-auto text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Compact version for mobile
export function LanguageSwitcherCompact() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const toggleLanguage = () => {
    const newLocale = locale === 'ar' ? 'en' : 'ar';

    // Get clean path without locale prefix
    let cleanPath = pathname;
    const localePattern = /^\/(ar|en)(\/|$)/;
    if (localePattern.test(pathname)) {
      cleanPath = pathname.replace(localePattern, '/');
      if (cleanPath === '') cleanPath = '/';
    }

    // Build new path
    let newPath: string;
    if (newLocale === 'ar') {
      newPath = cleanPath;
    } else {
      newPath = `/${newLocale}${cleanPath === '/' ? '' : cleanPath}`;
    }

    startTransition(() => {
      router.push(newPath);
      router.refresh();
    });
  };

  return (
    <button
      onClick={toggleLanguage}
      disabled={isPending}
      className={`flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${isPending ? 'opacity-50' : ''}`}
      aria-label="Toggle language"
    >
      <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
        {locale === 'ar' ? 'EN' : 'ع'}
      </span>
    </button>
  );
}
