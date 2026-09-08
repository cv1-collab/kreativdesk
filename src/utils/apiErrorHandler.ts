/**
 * Centralized API & Supabase Error Handler
 * Translates low-level PostgREST, RLS, HTTP and network errors into clear,
 * user-friendly German and English feedback messages.
 */

export interface FormattedError {
  message: string;
  code?: string | number;
  isPermissionError: boolean;
  isNetworkError: boolean;
}

export function formatApiError(
  error: any,
  fallbackMessage?: string,
  lang: 'de' | 'en' = 'de'
): FormattedError {
  if (!error) {
    return {
      message: fallbackMessage || (lang === 'de' ? 'Unbekannter Fehler' : 'Unknown error'),
      isPermissionError: false,
      isNetworkError: false
    };
  }

  const rawMessage: string = error?.message || (typeof error === 'string' ? error : '');
  const code: string | number = error?.code || error?.status || '';

  // 1. Network / Offline errors
  if (
    rawMessage.includes('Failed to fetch') ||
    rawMessage.includes('NetworkError') ||
    rawMessage.includes('network') ||
    code === 'ERR_NETWORK' ||
    (typeof navigator !== 'undefined' && navigator.onLine === false)
  ) {
    return {
      message: lang === 'de' 
        ? 'Verbindung zum Server unterbrochen. Bitte prüfe deine Internetverbindung.' 
        : 'Network connection lost. Please check your internet connection.',
      code,
      isPermissionError: false,
      isNetworkError: true
    };
  }

  // 2. Row-Level-Security (RLS) & Permission denied (Postgres 42501)
  if (
    code === '42501' ||
    code === 403 ||
    rawMessage.includes('row-level security') ||
    rawMessage.includes('permission denied') ||
    rawMessage.includes('JWT expired') ||
    rawMessage.includes('not authorized')
  ) {
    return {
      message: lang === 'de'
        ? 'Zugriff verweigert: Du verfügst nicht über die erforderlichen Berechtigungen für diesen Vorgang.'
        : 'Access denied: You do not have the required permissions for this action.',
      code,
      isPermissionError: true,
      isNetworkError: false
    };
  }

  // 3. Unique violation (Postgres 23505)
  if (code === '23505' || rawMessage.includes('duplicate key') || rawMessage.includes('already exists')) {
    return {
      message: lang === 'de'
        ? 'Ein Datensatz mit dieser Kennung oder diesem Namen existiert bereits.'
        : 'A record with this identifier or name already exists.',
      code,
      isPermissionError: false,
      isNetworkError: false
    };
  }

  // 4. Foreign key violation (Postgres 23503)
  if (code === '23503' || rawMessage.includes('foreign key constraint')) {
    return {
      message: lang === 'de'
        ? 'Aktion nicht möglich: Der Eintrag ist noch mit anderen Elementen verknüpft.'
        : 'Action not possible: This record is still referenced by other items.',
      code,
      isPermissionError: false,
      isNetworkError: false
    };
  }

  // 5. Payload Too Large (413)
  if (code === 413 || rawMessage.includes('too large') || rawMessage.includes('Payload Too Large')) {
    return {
      message: lang === 'de'
        ? 'Datei zu gross: Das Upload-Limit wurde überschritten.'
        : 'File too large: The upload size limit has been exceeded.',
      code,
      isPermissionError: false,
      isNetworkError: false
    };
  }

  // 6. User-friendly fallback
  return {
    message: fallbackMessage || rawMessage || (lang === 'de' ? 'Ein unerwarteter Fehler ist aufgetreten.' : 'An unexpected error occurred.'),
    code,
    isPermissionError: false,
    isNetworkError: false
  };
}

export function getErrorMessage(error: any, fallbackMessage?: string, lang: 'de' | 'en' = 'de'): string {
  return formatApiError(error, fallbackMessage, lang).message;
}
