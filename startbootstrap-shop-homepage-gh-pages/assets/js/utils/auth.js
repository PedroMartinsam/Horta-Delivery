const API_BASE = "http://localhost:8080";

export async function loginUser(username, password) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    throw new Error("Resposta do servidor inválida ao autenticar.");
  }

  const token = data.token || data.accessToken || data.jwt || data.authToken;
  if (!token) throw new Error("Token não encontrado no login.");

  const cleanToken = token.startsWith("Bearer ") ? token.split(" ")[1] : token;
  sessionStorage.setItem("jwtToken", cleanToken);
  sessionStorage.setItem("username", username);

  const userResp = await fetch(`${API_BASE}/cliente/email/${username}`, {
    headers: { Authorization: `Bearer ${cleanToken}` },
  });

  if (!userResp.ok) throw new Error("Erro ao buscar cliente pelo e-mail.");
  const clienteData = await userResp.json();
  sessionStorage.setItem("clienteId", clienteData.id);

  return cleanToken;
}

export function getToken() {
  return sessionStorage.getItem("jwtToken");
}
export function getClienteId() {
  return sessionStorage.getItem("clienteId");
}
export function getUsername() {
  return sessionStorage.getItem("username");
}
export function logoutUser() {
  sessionStorage.clear();
  window.location.href = "login.html";
}
export function isLoggedIn() {
  return !!getToken();
}
