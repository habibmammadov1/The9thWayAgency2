import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function fetchMessagesFromAPI(locale: string): Promise<Record<string, any> | null> {
  try {
    const res = await fetch(`${API_BASE}/api/translations?locale=${locale}`, {
      // next-intl runs on the server — revalidate frequently so admin edits show quickly
      next: { revalidate: 30 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    // API unreachable (build time, cold start, etc.)
    return null;
  }
}

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  // Load static JSON as base (contains all namespaces)
  const staticMessages = (await import(`./messages/${locale}.json`)).default;

  // Try to fetch DB-backed translations and deep-merge them on top
  const dbMessages = await fetchMessagesFromAPI(locale);

  const messages = dbMessages
    ? { ...staticMessages, ...dbMessages }
    : staticMessages;

  return { locale, messages };
});

