/** wa.me link from a display number such as "+1 (770) 679-2620"; null when there are no usable digits. */
export function whatsappLink(number?: string | null): string | null {
  const digits = (number ?? "").replace(/\D/g, "");
  return digits.length >= 7 ? `https://wa.me/${digits}` : null;
}
