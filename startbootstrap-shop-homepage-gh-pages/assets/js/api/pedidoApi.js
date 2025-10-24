import { getToken } from "../utils/auth.js";

const API_BASE = "http://localhost:8080";

async function fetchAuth(url, options = {}) {
  const token = getToken();
  const headers = options.headers || {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const opts = { ...options, headers };
  return fetch(url, opts);
}

export async function criarPedido(pedidoDTO) {
  const response = await fetchAuth(`${API_BASE}/pedido`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(pedidoDTO),
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

export async function atualizarPedido(id, acao) {
  const response = await fetchAuth(`${API_BASE}/pedido/${id}/${acao}`, { method: "PUT" });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}
