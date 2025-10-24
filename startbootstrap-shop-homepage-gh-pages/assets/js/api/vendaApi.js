import { getToken } from "../utils/auth.js";

const API_BASE = "http://localhost:8080";

async function fetchAuth(url, options = {}) {
  const token = getToken();
  const headers = options.headers || {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const opts = { ...options, headers };
  return fetch(url, opts);
}

export async function criarVenda(vendaDTO) {
  const response = await fetchAuth(`${API_BASE}/venda`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(vendaDTO),
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}
