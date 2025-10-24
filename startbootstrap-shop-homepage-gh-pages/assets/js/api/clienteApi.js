const API_BASE = "http://localhost:8080";

export async function getClientes() {
  const response = await fetch(`${API_BASE}/cliente`);
  return await response.json();
}

export async function createCliente(cliente) {
  const response = await fetch(`${API_BASE}/cliente`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cliente),
  });
  return await response.json();
}
