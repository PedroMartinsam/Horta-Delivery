import { getToken } from "../utils/auth.js";

const API_BASE = "http://localhost:8080";

async function fetchAuth(url, options = {}) {
  const token = getToken();
  const headers = options.headers || {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const opts = { ...options, headers };
  return fetch(url, opts);
}

export async function listarProdutos() {
  try {
    const response = await fetchAuth(`${API_BASE}/produto`);
    console.log("/produto status:", response.status, response.statusText);

    if (response.status === 401 || response.status === 403) {
      const txt = await response.text();
      console.error("Autorização falhou ao buscar /produto:", txt);
      throw new Error("Não autorizado. Verifique token ou sessão.");
    }

    if (!response.ok) {
      const txt = await response.text();
      console.error("Erro ao buscar /produto:", response.status, txt);
      throw new Error("Erro ao buscar produtos: " + response.status);
    }

    const data = await response.json();
    console.log("/produto resposta JSON:", data);
    return data;

  } catch (error) {
    console.error("Erro em listarProdutos():", error);
    throw error;
  }
}

export async function cadastrarProduto(produto) {
  try {
    const response = await fetchAuth(`${API_BASE}/produto`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(produto),
    });

    if (!response.ok) {
      const txt = await response.text();
      throw new Error("Erro ao cadastrar produto: " + txt);
    }

    return response.json();
  } catch (error) {
    console.error("Erro em cadastrarProduto():", error);
    throw error;
  }

  
}

export async function atualizarProduto(id, produto) {
  try {
    const response = await fetchAuth(`${API_BASE}/produto/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(produto),
    });

    if (!response.ok) {
      const txt = await response.text();
      throw new Error("Erro ao atualizar produto: " + txt);
    }

    return response.json();
  } catch (error) {
    console.error("Erro em atualizarProduto():", error);
    throw error;
  }
}

export async function deletarProduto(id) {
  try {
    const response = await fetchAuth(`${API_BASE}/produto/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const txt = await response.text();
      throw new Error("Erro ao deletar produto: " + txt);
    }

    return true;
  } catch (error) {
    console.error("Erro em deletarProduto():", error);
    throw error;
  }
}

