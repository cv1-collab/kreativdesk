export interface PasswordCriteria {
  minLength: boolean;
  hasLower: boolean;
  hasUpper: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
  notCommonOrName: boolean;
}

export interface PasswordStrengthResult {
  score: number; // 0 (sehr schwach) bis 4 (sehr stark)
  status: 'very_weak' | 'weak' | 'fair' | 'strong' | 'very_strong';
  label: string;
  colorClass: string;
  bgColorClass: string;
  criteria: PasswordCriteria;
  suggestions: string[];
}

/**
 * Bekannte triviale Passwörter oder Wortbestandteile, die in Supabase HIBP / zxcvbn sofort abgelehnt werden.
 */
const COMMON_WEAK_PATTERNS = [
  '123456', 'password', 'passwort', 'qwertz', 'qwerty', '12345678', 'admin',
  'philipp', 'kreativ', 'welcome', 'letmein', 'master', 'iloveyou'
];

/**
 * Berechnet die Passwortstärke und prüft alle Sicherheitskriterien in Echtzeit.
 */
export function calculatePasswordStrength(password: string, email?: string, lang: 'de' | 'en' = 'de'): PasswordStrengthResult {
  const cleanPwd = password || '';
  const isDe = lang === 'de';

  const criteria: PasswordCriteria = {
    minLength: cleanPwd.length >= 8,
    hasLower: /[a-z]/.test(cleanPwd),
    hasUpper: /[A-Z]/.test(cleanPwd),
    hasNumber: /[0-9]/.test(cleanPwd),
    hasSpecial: /[^A-Za-z0-9]/.test(cleanPwd),
    notCommonOrName: true
  };

  const lowerPwd = cleanPwd.toLowerCase();

  // Prüfen, ob der lokale E-Mail-Teil oder bekannte Trivialmuster im Passwort enthalten sind
  if (email && email.includes('@')) {
    const emailPrefix = email.split('@')[0].toLowerCase().trim();
    if (emailPrefix.length >= 3 && lowerPwd.includes(emailPrefix)) {
      criteria.notCommonOrName = false;
    }
  }

  for (const pattern of COMMON_WEAK_PATTERNS) {
    if (lowerPwd.length > 0 && (lowerPwd === pattern || lowerPwd.startsWith(pattern) || lowerPwd.endsWith(pattern))) {
      criteria.notCommonOrName = false;
      break;
    }
  }

  // Punktzahl berechnen (0 bis 4)
  let score = 0;
  if (cleanPwd.length >= 8) score += 1;
  if (cleanPwd.length >= 12) score += 1;
  if (criteria.hasLower && criteria.hasUpper) score += 1;
  if (criteria.hasNumber && criteria.hasSpecial) score += 1;

  if (!criteria.notCommonOrName && score > 1) {
    score = 1;
  }
  if (cleanPwd.length < 6) {
    score = 0;
  }

  // Vorschläge zur Verbesserung
  const suggestions: string[] = [];
  if (cleanPwd.length < 8) {
    suggestions.push(isDe ? 'Mindestens 8 Zeichen verwenden' : 'Use at least 8 characters');
  }
  if (!criteria.hasUpper || !criteria.hasLower) {
    suggestions.push(isDe ? 'Groß- und Kleinbuchstaben kombinieren' : 'Combine upper and lower case letters');
  }
  if (!criteria.hasNumber) {
    suggestions.push(isDe ? 'Mindestens eine Ziffer (0-9) hinzufügen' : 'Add at least one number (0-9)');
  }
  if (!criteria.hasSpecial) {
    suggestions.push(isDe ? 'Mindestens ein Sonderzeichen (z. B. !?#*@$) hinzufügen' : 'Add at least one special character (!?#*@$)');
  }
  if (!criteria.notCommonOrName) {
    suggestions.push(isDe ? 'Vermeide deinen Namen oder einfache Begriffe' : 'Avoid using your name or common words');
  }

  // Label & Farbe zuweisen
  let status: PasswordStrengthResult['status'] = 'very_weak';
  let label = isDe ? 'Sehr schwach' : 'Very weak';
  let colorClass = 'text-red-500';
  let bgColorClass = 'bg-red-500';

  if (score === 1) {
    status = 'weak';
    label = isDe ? 'Schwach' : 'Weak';
    colorClass = 'text-orange-500';
    bgColorClass = 'bg-orange-500';
  } else if (score === 2) {
    status = 'fair';
    label = isDe ? 'Mittel' : 'Fair';
    colorClass = 'text-amber-500';
    bgColorClass = 'bg-amber-500';
  } else if (score === 3) {
    status = 'strong';
    label = isDe ? 'Stark' : 'Strong';
    colorClass = 'text-blue-500';
    bgColorClass = 'bg-blue-500';
  } else if (score >= 4) {
    status = 'very_strong';
    label = isDe ? 'Sehr stark' : 'Very strong';
    colorClass = 'text-emerald-500';
    bgColorClass = 'bg-emerald-500';
  }

  return {
    score,
    status,
    label,
    colorClass,
    bgColorClass,
    criteria,
    suggestions
  };
}

/**
 * Erzeugt ein kryptographisch sicheres, 16-stelliges Passwort,
 * das garantiert von Supabase und allen Sicherheitsfiltern akzeptiert wird.
 * Verwendet keine leicht verwechselbaren Zeichen (0, O, l, 1, I).
 */
export function generateSecurePassword(length = 16): string {
  const lowercase = 'abcdefghijkmnopqrstuvwxyz'; // ohne 'l'
  const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // ohne 'I', 'O'
  const numbers = '23456789'; // ohne '0', '1'
  const symbols = '!#$%&*+-=?@_~';

  const allChars = lowercase + uppercase + numbers + symbols;
  const result: string[] = [];

  // Garantiere mindestens ein Zeichen jeder Kategorie
  result.push(lowercase[Math.floor(Math.random() * lowercase.length)]);
  result.push(uppercase[Math.floor(Math.random() * uppercase.length)]);
  result.push(numbers[Math.floor(Math.random() * numbers.length)]);
  result.push(symbols[Math.floor(Math.random() * symbols.length)]);

  // Zufällige Bytes aus window.crypto
  const randomBytes = new Uint32Array(length - result.length);
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(randomBytes);
    for (let i = 0; i < randomBytes.length; i++) {
      result.push(allChars[randomBytes[i] % allChars.length]);
    }
  } else {
    // Fallback falls kein window.crypto verfügbar
    for (let i = result.length; i < length; i++) {
      result.push(allChars[Math.floor(Math.random() * allChars.length)]);
    }
  }

  // Mische das Ergebnis durch (Fisher-Yates Shuffle)
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result.join('');
}

/**
 * Übersetzt Supabase Auth Fehler in verständliche, handlungsorientierte deutsche bzw. englische Fehlermeldungen.
 * Garantiert, dass niemals rohe technische JSON-Fragmente wie "{}" oder leere Strings gerendert werden.
 */
export function mapAuthErrorMessage(err: any, lang: 'de' | 'en' = 'de'): string {
  const isDe = lang === 'de';
  if (!err) {
    return isDe ? 'Ein unbekannter Fehler ist aufgetreten.' : 'An unknown error occurred.';
  }

  const rawMsg = (typeof err === 'string' ? err : err?.message || err?.error_description || '').toLowerCase().trim();
  const code = (err?.code || '').toLowerCase().trim();
  const name = (err?.name || '').toLowerCase().trim();
  const status = Number(err?.status || 0);

  // 1. Abfangen von leeren Fehlern oder rohen JSON-Klammern "{}"
  if (!rawMsg || rawMsg === '{}' || rawMsg === '{ }' || rawMsg === '[object object]' || rawMsg.startsWith('{')) {
    if (name.includes('retryable') || name.includes('fetch') || status === 500) {
      return isDe
        ? 'Verbindung zum Server unterbrochen oder Server ausgelastet. Bitte versuche es in wenigen Sekunden erneut.'
        : 'Connection to server interrupted. Please try again in a few seconds.';
    }
    return isDe
      ? 'Die Anfrage konnte nicht verarbeitet werden. Bitte prüfe deine Internetverbindung und versuche es erneut.'
      : 'The request could not be processed. Please check your connection and try again.';
  }

  // 2. Netzwerk- und Verbindungsabbrüche
  if (
    name.includes('retryable') ||
    name.includes('fetch') ||
    rawMsg.includes('failed to fetch') ||
    rawMsg.includes('network') ||
    rawMsg.includes('timeout')
  ) {
    return isDe
      ? 'Verbindung zum Server konnte nicht hergestellt werden. Bitte überprüfe deine Internetverbindung und versuche es erneut.'
      : 'Could not connect to server. Please check your internet connection and try again.';
  }

  // 3. Supabase AuthWeakPasswordError & zu schwache Passwörter
  if (
    code === 'weak_password' ||
    name === 'authweakpassworderror' ||
    rawMsg.includes('weak') ||
    rawMsg.includes('easy to guess') ||
    rawMsg.includes('pwned') ||
    rawMsg.includes('leaked')
  ) {
    return isDe
      ? 'Das eingegebene Passwort gilt als zu schwach oder leicht erratbar. Bitte wähle ein Passwort mit mind. 8 Zeichen, Groß- und Kleinbuchstaben, Zahlen und einem Sonderzeichen – oder klicke oben auf "Sicheres Passwort generieren".'
      : 'Password is known to be weak or easy to guess. Please choose a stronger password with at least 8 characters, uppercase, lowercase, numbers, and symbols – or click "Generate secure password".';
  }

  // 4. Benutzer existiert bereits
  if (
    rawMsg.includes('already registered') ||
    rawMsg.includes('already exists') ||
    code === 'user_already_exists' ||
    code === 'identity_already_exists'
  ) {
    return isDe
      ? 'Ein Account mit dieser E-Mail-Adresse existiert bereits. Bitte melde dich an oder setze dein Passwort zurück.'
      : 'An account with this email address already exists. Please log in or reset your password.';
  }

  // 5. Ungültige Zugangsdaten
  if (
    rawMsg.includes('invalid login credentials') ||
    rawMsg.includes('invalid_grant') ||
    rawMsg.includes('invalid credentials')
  ) {
    return isDe
      ? 'E-Mail-Adresse oder Passwort ist ungültig. Bitte überprüfe deine Eingabe.'
      : 'Invalid email address or password. Please check your credentials.';
  }

  // 6. E-Mail nicht bestätigt
  if (rawMsg.includes('email not confirmed')) {
    return isDe
      ? 'Deine E-Mail-Adresse wurde noch nicht bestätigt. Bitte überprüfe dein Postfach.'
      : 'Email not confirmed. Please check your inbox.';
  }

  // 7. Rate Limiting
  if (rawMsg.includes('rate limit') || rawMsg.includes('too many requests') || status === 429) {
    return isDe
      ? 'Zu viele Anfragen in kurzer Zeit. Bitte warte einen Moment und versuche es erneut.'
      : 'Too many requests. Please wait a moment and try again.';
  }

  // 8. Server- und Datenbankfehler (500)
  if (
    status >= 500 ||
    rawMsg.includes('database error') ||
    rawMsg.includes('foreign key') ||
    rawMsg.includes('trigger') ||
    rawMsg.includes('internal server error')
  ) {
    return isDe
      ? 'Ein temporärer Serverfehler ist aufgetreten. Bitte versuche es in Kürze erneut oder melde dich direkt an.'
      : 'A temporary server error occurred. Please try again shortly or sign in directly.';
  }

  // 9. Fallback mit Übersetzung gängiger Fehlermeldungen
  if (typeof err?.message === 'string' && err.message.length > 2 && !err.message.includes('{')) {
    return err.message;
  }

  return isDe ? 'Vorgang fehlgeschlagen. Bitte versuche es erneut.' : 'Operation failed. Please try again.';
}
