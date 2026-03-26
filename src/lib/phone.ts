export const normalizeKenyanPhone = (raw: string) => {
  const cleaned = raw.replace(/[\s\-()]/g, "");
  if (/^\+254[17]\d{8}$/.test(cleaned)) return cleaned;
  if (/^254[17]\d{8}$/.test(cleaned)) return `+${cleaned}`;
  if (/^0[17]\d{8}$/.test(cleaned)) return `+254${cleaned.slice(1)}`;
  return null;
};

export const isLikelyPhoneNumber = (value: string) =>
  !value.includes("@") && /^[+\d\s\-()]+$/.test(value);
