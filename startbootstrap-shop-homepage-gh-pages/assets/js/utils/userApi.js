const API_BASE = "http://localhost:8080";

export async function createCliente(cliente) {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cliente),
  });

  if (!response.ok) {
    const txt = await response.text();
    throw new Error("Erro ao criar cliente: " + txt);
  }

  return true;
}
