export const normalizeKenyanPhone = (value?: string | null): string | null => {
  if (!value) return null;
  const cleaned = value.replace(/[^\d+]/g, "");
  if (/^\+254[17]\d{8}$/.test(cleaned)) return cleaned;
  if (/^254[17]\d{8}$/.test(cleaned)) return `+${cleaned}`;
  if (/^0[17]\d{8}$/.test(cleaned)) return `+254${cleaned.slice(1)}`;
  return null;
};

export const isValidKenyanPhone = (phone: string): boolean => {
  const cleaned = phone.replace(/[\s\-()]/g, "");
  return /^(\+254|254|0)([17]\d{8})$/.test(cleaned);
};

export const formatKenyanPhone = (phone: string): string => {
  const cleaned = phone.replace(/[\s\-()]/g, "");
  if (cleaned.startsWith("+254")) return cleaned;
  if (cleaned.startsWith("254")) return "+" + cleaned;
  if (cleaned.startsWith("0")) return "+254" + cleaned.substring(1);
  return phone;
};
