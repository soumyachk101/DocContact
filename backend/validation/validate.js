// HTTP request validation helpers — small, dependency-free, used by route handlers.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\d{10}$/;

export function isNonEmptyString(v) {
    return typeof v === 'string' && v.trim().length > 0;
}

export function requireString(value, fieldName, { minLength = 1, maxLength = 200 } = {}) {
    if (!isNonEmptyString(value)) {
        return `${fieldName} is required.`;
    }
    const trimmed = value.trim();
    if (trimmed.length < minLength) {
        return `${fieldName} must be at least ${minLength} characters.`;
    }
    if (trimmed.length > maxLength) {
        return `${fieldName} must be at most ${maxLength} characters.`;
    }
    return null;
}

export function isValidEmail(v) {
    return typeof v === 'string' && EMAIL_RE.test(v.trim());
}

export function isValidPhone(v) {
    return typeof v === 'string' && PHONE_RE.test(v.trim());
}

export function parseIntInRange(v, min, max) {
    const n = parseInt(v, 10);
    if (Number.isNaN(n)) return null;
    if (n < min || n > max) return null;
    return n;
}

export function escapeHtml(v) {
    if (v === null || v === undefined) return '';
    return String(v)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
