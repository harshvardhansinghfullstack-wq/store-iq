// Utility to send JWT in Authorization header for protected API calls

// Usage: authFetch("/api/protected", { method: "GET" })
export async function authFetch(input: RequestInfo, init?: RequestInit) {
  // Only use cookie-based session, no Authorization header
  return fetch(input, { ...init, credentials: "include" });
}