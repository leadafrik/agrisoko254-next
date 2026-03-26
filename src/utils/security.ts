export const enforceHttps = (): void => {
  if (
    process.env.NODE_ENV === "production" &&
    typeof window !== "undefined" &&
    window.location.protocol === "http:" &&
    !window.location.hostname.includes("localhost")
  ) {
    window.location.href = window.location.href.replace("http://", "https://");
  }
};

export const sanitizeInput = (input: string): string => {
  if (typeof document === "undefined") return input;
  const div = document.createElement("div");
  div.textContent = input;
  return div.innerHTML;
};

export const isSafeHtml = (html: string): boolean => {
  const scriptPattern = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
  const javascriptPattern = /javascript:/gi;
  const eventHandlerPattern = /on\w+\s*=/gi;
  return (
    !scriptPattern.test(html) &&
    !javascriptPattern.test(html) &&
    !eventHandlerPattern.test(html)
  );
};

export const isLocalStorageAvailable = (): boolean => {
  try {
    const test = "__storage_test__";
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};
