/**
 * Thin fetch wrapper for admin panel API calls.
 * Always sends credentials (httpOnly cookie) so the session is authenticated.
 */
export async function adminFetch(
  url: string,
  init?: RequestInit
): Promise<Response> {
  return fetch(url, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
}
