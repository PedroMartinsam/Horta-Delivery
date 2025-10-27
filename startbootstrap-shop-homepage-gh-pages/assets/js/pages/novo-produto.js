import { getToken } from "../utils/auth.js";

const API_BASE = "http://localhost:8080";
const token = getToken();

const mensagem = document.getElementById("mensagem");
const selectGrupo = document.getElementById("grupoProduto");


async function fetchAuth(url, options = {}) {
  const headers = options.headers || {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const opts = { ...options, headers };
  return fetch(url, opts);
}

async function carregarGrupos() {
  try {
    const response = await fetchAuth(`${API_BASE}/grupoproduto`);
    if (!response.ok) throw new Error("Erro ao carregar grupos");
    const grupos = await response.json();

    grupos.forEach(grupo => {
      const option = document.createElement("option");
      option.value = grupo.id;
      option.textContent = grupo.descricao;
      selectGrupo.appendChild(option);
    });
  } catch (error) {
    console.error(error);
    mensagem.textContent = "Erro ao carregar grupos de produtos.";
    mensagem.style.color = "red";
  }
}

document.getElementById("formProduto").addEventListener("submit", async (e) => {
  e.preventDefault();

  const produto = {
    nome: document.getElementById("nome").value,
    preco: parseFloat(document.getElementById("preco").value),
    qtdEstoque: parseInt(document.getElementById("qtdEstoque").value),
    grupoProduto: parseInt(selectGrupo.value)
  };

  try {
    const response = await fetchAuth(`${API_BASE}/produto`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(produto)
    });

    if (response.ok) {
      const produtoCriado = await response.json();
      mensagem.textContent = `✅ Produto "${produtoCriado.nome}" cadastrado com sucesso!`;
      mensagem.style.color = "green";
      console.log("Produto criado:", produtoCriado); 
      e.target.reset();
    } else {
      const err = await response.text();
      console.error(err);
      mensagem.textContent = "❌ Erro ao cadastrar produto!";
      mensagem.style.color = "red";
    }
  } catch (error) {
    console.error(error);
    mensagem.textContent = "❌ Erro de conexão com o servidor.";
    mensagem.style.color = "red";
  }
});

carregarGrupos();
