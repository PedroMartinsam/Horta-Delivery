import { listarProdutos } from "../api/produtoApi.js";
import { isLoggedIn } from "../utils/auth.js";
import { addToCart as addToCartFunc } from "./cart.js";

window.addToCart = addToCartFunc;

async function carregarProdutos() {
  try {
    const produtos = await listarProdutos();
    const container = document.getElementById("produtos-container");
    if (!container) return;

    if (!Array.isArray(produtos)) {
      container.innerHTML = "<p>Resposta inesperada do servidor. Veja console.</p>";
      console.warn("Resposta /produto não é array:", produtos);
      return;
    }

    container.innerHTML = produtos.map(p => {
      const imagemProduto = p.imagem || "assets/pages/pastas-fotos/default.jpg";

      return `
      <div class="col mb-5">
        <div class="card h-100">
          <img class="card-img-top" src="${imagemProduto}" alt="${p.nome}">
          <div class="card-body p-4">
            <div class="text-center">
              <h5 class="fw-bolder">${p.nome}</h5>
              <p class="text-muted mb-1">${p.descricao || ''}</p>
              <span class="text-success fw-bold d-block mb-1">R$ ${Number(p.preco).toFixed(2).replace('.', ',')}</span>
              <span class="text-secondary small">🧺 Estoque: ${p.qtdEstoque} unidade${p.qtdEstoque !== 1 ? 's' : ''}</span>
            </div>
          </div>
          <div class="card-footer p-4 pt-0 border-top-0 bg-transparent">
            <div class="text-center">
              <button class="btn btn-outline-dark mt-auto"
                onclick="addToCart('${p.id}', '${p.nome}', ${p.preco}, '${imagemProduto}')">
                Comprar
              </button>
            </div>
          </div>
        </div>
      </div>
      `;
    }).join("");

  } catch (err) {
    console.error("Erro ao carregar produtos:", err);
    const container = document.getElementById("produtos-container");
    if (container) container.innerHTML = "<p>Erro ao carregar produtos. Veja console.</p>";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (!isLoggedIn()) {
    window.location.href = "login.html";
    return;
  }

  carregarProdutos();
});
