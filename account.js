const MIN_NAME_LENGTH = 3;
const MAX_NAME_LENGTH = 16;

export function validatePlayerName(value) {
  if (typeof value !== 'string') return { valid: false, message: 'Enter a player name.' };
  const name = value.trim();
  if (name.length < MIN_NAME_LENGTH) return { valid: false, message: 'Your name must be at least 3 characters long.' };
  if (name.length > MAX_NAME_LENGTH) return { valid: false, message: 'Your name cannot be longer than 16 characters.' };
  if (!/^[\p{L}\p{N} _.-]+$/u.test(name)) return { valid: false, message: 'Use letters, numbers, spaces, dots, hyphens, or underscores only.' };
  return { valid: true, name };
}

export function formatCredits(value) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value);
}

export function formatDate(isoString) {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}

export function getInitial(name) {
  return (name?.trim()?.[0] || 'P').toLocaleUpperCase('en-US');
}
