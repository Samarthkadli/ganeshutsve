/**
 * Email Validation & Typo Suggestion Utility
 */

const DOMAIN_MAP: Record<string, string> = {
  // Gmail typos
  'gnail.com': 'gmail.com',
  'gmai.com': 'gmail.com',
  'gamil.com': 'gmail.com',
  'gmial.com': 'gmail.com',
  'gmal.com': 'gmail.com',
  'gamil.co': 'gmail.com',
  'gmail.co': 'gmail.com',
  'gmaill.com': 'gmail.com',
  'gmaill.co': 'gmail.com',
  'gmaim.com': 'gmail.com',
  'gmai.co.in': 'gmail.com',
  'gmail.con': 'gmail.com',
  'gmaill.con': 'gmail.com',
  
  // Yahoo typos
  'yaho.com': 'yahoo.com',
  'yahooo.com': 'yahoo.com',
  'yaho.co.in': 'yahoo.co.in',
  'yahou.com': 'yahoo.com',
  'yaho.in': 'yahoo.in',

  // Hotmail / Outlook typos
  'hotmai.com': 'hotmail.com',
  'hotmial.com': 'hotmail.com',
  'hotmaill.com': 'hotmail.com',
  'outlok.com': 'outlook.com',
  'outloo.com': 'outlook.com',
  'outlok.co': 'outlook.com',

  // Rediff / iCloud
  'rediffmai.com': 'rediffmail.com',
  'redifmail.com': 'rediffmail.com',
  'icloud.co': 'icloud.com',
};

/**
 * Validates strict email syntax format
 */
export function isValidEmailFormat(email: string): boolean {
  if (!email) return false;
  const trimmed = email.trim().toLowerCase();
  
  // Basic regex check
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmed)) return false;

  // Additional checks: no double dots in domain, no consecutive dots
  if (trimmed.includes('..')) return false;

  return true;
}

/**
 * Returns a corrected email suggestion if domain typo is detected
 */
export function getSuggestedEmail(email: string): string | null {
  if (!email || !email.includes('@')) return null;

  const trimmed = email.trim().toLowerCase();
  const parts = trimmed.split('@');
  if (parts.length !== 2) return null;

  const username = parts[0];
  const domain = parts[1];

  if (!username || !domain) return null;

  const suggestedDomain = DOMAIN_MAP[domain];
  if (suggestedDomain && suggestedDomain !== domain) {
    return `${username}@${suggestedDomain}`;
  }

  return null;
}
