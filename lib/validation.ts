/**
 * Shared form-validation helpers.
 *
 * These are plain functions with no server-only or browser-only APIs, so the
 * same rules can run twice: once in the browser for instant inline feedback,
 * and again inside the Server Actions as the source of truth. Never trust the
 * client-side pass alone — Server Actions are reachable directly over the
 * network, not just through this UI.
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const PASSWORD_MIN_LENGTH = 8;

export function validateFullName(fullName: string): string | null {
  if (!fullName.trim()) {
    return "Please enter your full name.";
  }
  if (fullName.trim().length < 2) {
    return "Full name must be at least 2 characters long.";
  }
  return null;
}

export function validateEmail(email: string): string | null {
  if (!email.trim()) {
    return "Please enter your email address.";
  }
  if (!EMAIL_PATTERN.test(email.trim())) {
    return "Please enter a valid email address.";
  }
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) {
    return "Please enter a password.";
  }
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters long.`;
  }
  return null;
}

export function validateConfirmPassword(
  password: string,
  confirmPassword: string
): string | null {
  if (!confirmPassword) {
    return "Please confirm your password.";
  }
  if (password !== confirmPassword) {
    return "Passwords do not match.";
  }
  return null;
}

/**
 * Accepts international phone numbers (Rwanda numbers such as
 * +250 7XX XXX XXX included) without restricting to a single country.
 * Strips spaces, dashes, and parentheses before checking that what's left
 * is an optional leading "+" followed by 8-15 digits — a permissive but
 * meaningful check that rejects obviously invalid input.
 */
export function validatePhoneNumber(phone: string): string | null {
  const trimmed = phone.trim();
  if (!trimmed) {
    return "Please enter a valid phone number.";
  }
  const stripped = trimmed.replace(/[\s\-().]/g, "");
  if (!/^\+?[1-9]\d{7,14}$/.test(stripped)) {
    return "Please enter a valid phone number.";
  }
  return null;
}

export const EDUCATION_LEVELS = [
  "Secondary School",
  "Undergraduate",
  "Graduate",
  "Other",
] as const;

export type EducationLevel = (typeof EDUCATION_LEVELS)[number];

export function validateEducationLevel(value: string): string | null {
  if (!value.trim()) {
    return "Please select your education level.";
  }
  if (!(EDUCATION_LEVELS as readonly string[]).includes(value)) {
    return "Please select a valid education level.";
  }
  return null;
}

export const INTEREST_AREAS = [
  "Scholarships",
  "Internships",
  "Jobs",
  "Fellowships",
  "Training & Courses",
  "Competitions",
] as const;

export type InterestArea = (typeof INTEREST_AREAS)[number];

export function validateInterests(interests: string[]): string | null {
  if (!interests.length) {
    return "Please select at least one area of interest.";
  }
  return null;
}

export function validateCareerInterest(value: string): string | null {
  if (!value.trim()) {
    return "Please tell us your career or study interest.";
  }
  return null;
}
