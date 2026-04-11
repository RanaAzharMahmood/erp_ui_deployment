/**
 * Shared client-side validators.
 *
 * Keep these in sync with the backend validators — they're a UX
 * improvement, not a security boundary.
 */

// Standard RFC-5322-ish email pattern (good enough for form validation)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Returns true when the string looks like a valid email address. */
export const isValidEmail = (value: string): boolean => EMAIL_REGEX.test(value.trim());

/**
 * Returns an error message for an email field, or an empty string when valid.
 * Pass `required: false` for optional email fields so empty values pass.
 */
export const validateEmail = (value: string, { required = true }: { required?: boolean } = {}): string => {
  const trimmed = value.trim();
  if (!trimmed) {
    return required ? 'Email is required' : '';
  }
  if (!isValidEmail(trimmed)) {
    return 'Please enter a valid email address';
  }
  return '';
};
