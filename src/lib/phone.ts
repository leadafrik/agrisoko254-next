export const normalizeKenyanPhone = (raw: string) => {
  // Strip everything except digits and leading +
  const cleaned = raw.replace(/[^\d+]/g, "");
  if (/^\+254\d{9}$/.test(cleaned)) return cleaned;
  if (/^254\d{9}$/.test(cleaned)) return `+${cleaned}`;
  if (/^0\d{9}$/.test(cleaned)) return `+254${cleaned.slice(1)}`;
  // 9-digit number without country code or leading zero (e.g. 712345678)
  if (/^\d{9}$/.test(cleaned)) return `+254${cleaned}`;
  return null;
};

export const isLikelyPhoneNumber = (value: string) =>
  !value.includes("@") && /^[+\d\s\-()]+$/.test(value);
