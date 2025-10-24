// api/fetchAuth.js
import { getToken } from "../utils/auth.js";

export async function fetchAuth(url, options = {}) {
  const token = getToken();
  const headers = options.headers || {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const opts = { ...options, headers };
  return fetch(url, opts);
}
