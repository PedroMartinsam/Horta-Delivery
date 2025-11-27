// ./assets/js/pages/vendas.js
import { listarVendas } from "../api/vendaApi.js"; // sua função que chama /venda
const API_BASE = "http://localhost:8080";

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Erro ${res.status} ao buscar ${url}`);
  return res.json();
}

function parseNumber(value) {
  if (value == null) return null;
  // aceita number, string com '.' ou ','
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    // remover espaços
    const s = value.trim();
    // trocar vírgula por ponto
    const normalized = s.replace(/\./g, "").replace(",", ".");
    const n = Number(normalized);
    return Number.isNaN(n) ? null : n;
  }
  return null;
}

async function getProdutoPreco(produtoId) {
  try {
    const produto = await fetchJson(`${API_BASE}/produto/${produtoId}`);
    // produto.preco deve ser number (ex: 15.00) — parse se precisar
    const preco = parseNumber(produto.preco);
    if (preco == null) throw new Error("Preço do produto inválido");
    return preco;
  } catch (err) {
    console.warn("Não foi possível obter preço do produto", produtoId, err);
    return null;
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const tbody = document.querySelector("#tabelaVendas tbody");
  const totalGeralEl = document.getElementById("totalGeral");

  if (!tbody) {
    console.error("Tabela de vendas não encontrada (#tabelaVendas tbody).");
    return;
  }

  try {
    const vendas = await listarVendas();
    console.log("Vendas recebidas:", vendas);

    let totalGeral = 0;

    // percorre vendas e calcula subtotal confiável por venda (usa subTotal se ok; caso contrário busca preço)
    for (const venda of vendas) {
      // tenta parse do subTotal vindo do backend
      let sub = parseNumber(venda.subTotal);

      // se sub é nulo ou zero (dependendo do seu caso), tenta calcular: preco * quantidade
      if (sub == null || sub === 0) {
        // tenta usar preco direto se estiver na venda (venda.preco ou venda.produto?.preco)
        let preco = null;
        if (venda.preco) preco = parseNumber(venda.preco);
        if (!preco && venda.produto && venda.produto.preco) preco = parseNumber(venda.produto.preco);

        // se ainda não tem preço, busca do endpoint de produto
        if (!preco && venda.produtoId) {
          preco = await getProdutoPreco(venda.produtoId);
        }

        if (preco != null && venda.quantidade != null) {
          sub = Number((preco * Number(venda.quantidade)).toFixed(2));
          console.log(`Subtotal calculado para venda ${venda.id}: ${preco} * ${venda.quantidade} = ${sub}`);
        } else {
          // fallback zero
          sub = 0;
          console.warn(`Não foi possível calcular subtotal para venda id=${venda.id}. preco=${preco} quantidade=${venda.quantidade}`);
        }
      }

      totalGeral += sub;

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${venda.id ?? "-"}</td>
        <td>${venda.nomeProduto ?? (venda.produto?.nome ?? "-")}</td>
        <td>${venda.quantidade ?? "-"}</td>
        <td>${venda.nomeCliente ?? (venda.clienteId ?? "-")}</td>
        <td>${venda.pedidoId ?? "-"}</td>
        <td>R$ ${sub.toFixed(2).replace('.', ',')}</td>
      `;
      tbody.appendChild(row);
    }

    totalGeralEl.textContent = totalGeral.toFixed(2).replace('.', ',');
  } catch (err) {
    console.error("Erro ao carregar vendas:", err);
  }
});
