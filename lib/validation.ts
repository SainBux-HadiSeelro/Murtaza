/**
 * Validates a Pakistani phone number.
 * Accepts: 03XXXXXXXXX (11 digits) or +923XXXXXXXXX (13 chars)
 */
export const PAKISTAN_PHONE_REGEX = /^(\+92|0)3[0-9]{9}$/;

export function validatePakistaniPhone(phone: string): boolean {
  return PAKISTAN_PHONE_REGEX.test(phone.trim());
}

export function getPhoneError(phone: string): string | null {
  if (!phone.trim()) return 'Phone number is required.';
  if (!validatePakistaniPhone(phone)) {
    return 'Please enter a valid Pakistani number (e.g. 03001234567 or +923001234567)';
  }
  return null;
}
