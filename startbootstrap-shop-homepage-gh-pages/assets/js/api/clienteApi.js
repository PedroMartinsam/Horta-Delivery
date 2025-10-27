import { getToken } from "../utils/auth.js";

const API_BASE = "http://localhost:8080";

async function fetchAuth(url, options = {}) {
  const token = getToken();
  const headers = options.headers || {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const opts = { ...options, headers };
  return fetch(url, opts);
}

export async function getClientes() {
  const response = await fetchAuth(`${API_BASE}/cliente`);
  if (!response.ok) {
    throw new Error("Erro ao buscar clientes: " + response.status);
  }
  return await response.json();
}


export async function createCliente(cliente) {
  const response = await fetchAuth(`${API_BASE}/cliente`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cliente),
  });

  if (!response.ok) {
    const txt = await response.text();
    throw new Error("Erro ao criar cliente: " + txt);
  }

  return;
}


export async function atualizarCliente(id, cliente) {
  const response = await fetchAuth(`${API_BASE}/cliente/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cliente),
  });

  if (!response.ok) {
    const txt = await response.text();
    throw new Error("Erro ao atualizar cliente: " + txt);
  }

  return await response.json();
}

// Deletar cliente
export async function deletarCliente(id) {
  const response = await fetchAuth(`${API_BASE}/cliente/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const txt = await response.text();
    throw new Error("Erro ao deletar cliente: " + txt);
  }

  return true;
}
