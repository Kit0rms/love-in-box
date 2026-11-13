import { defineConfig } from "vite";
import { CATALOGO } from "./src/data/catalogo.js";
import { CONFIG } from "./src/data/config.js";

/* As outras páginas (loja, produto, personalizados, como funciona, ajuda, pedido…) ainda são
   as do v1. Elas ficam em public/ (com assets/css e assets/js do v1) e são servidas no mesmo
   endereço da home nova; por isso os links internos são locais. Ao recriar uma página no v2,
   apague a versão dela em public/. */
const V1 = "/";

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
const brl = (n) => "R$ " + n.toFixed(2).replace(".", ",");
const preco = (p) => (p.precoTipo === "a-partir-de" ? "A partir de " : "") + brl(p.preco);
const visivel = (p) => CATALOGO.status[p.status]?.visivel && p.preco != null;
const arrow = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`;

// "assets/img/produtos/x.webp" (v1) → "/assets/img/produtos/x-540.webp" (v2)
const foto = (src, w) => "/" + src.replace(/\.webp$/, `-${w}.webp`);

function destaques() {
  return CATALOGO.produtos
    .filter((p) => p.destaque && visivel(p))
    .sort((a, b) => a.ordem - b.ordem)
    .map((p) => {
      const img = p.imagens[0];
      return `<li><a class="card" href="${V1}produto.html#${p.id}" data-mascot="PRODUCT_VIEW">
        <span class="card-photo"><img src="${foto(img.src, 540)}" srcset="${foto(img.src, 540)} 540w, ${foto(img.src, 1080)} 1080w" sizes="(min-width: 1000px) 270px, (min-width: 640px) 30vw, 46vw" alt="${esc(img.alt)}" width="540" height="675" loading="lazy" decoding="async"></span>
        <span class="seal"><i class="dot dot--${p.status}"></i>${esc(CATALOGO.status[p.status].rotulo)}</span>
        <span class="card-name">${esc(p.nome)}</span>
        <span class="card-price">${preco(p)}</span>
      </a></li>`;
    })
    .join("\n");
}

function categorias() {
  return CATALOGO.categorias
    .map(
      (c) => `<li><a class="cat" href="${V1}loja.html#categoria=${c.id}" data-mascot="CATEGORY_VIEW:${c.id}">
        <img src="/assets/img/icons/${c.icone}.png" alt="" width="56" height="56" loading="lazy" decoding="async">
        <span class="cat-text"><span class="cat-name">${esc(c.nome)}</span><span class="cat-sum">${esc(c.resumo)}</span></span>
        <span class="cat-go">${arrow}</span>
      </a></li>`
    )
    .join("\n");
}

function precoKits() {
  const kits = CATALOGO.produtos.filter((p) => p.categoria === "boxes-e-kits" && visivel(p) && p.status === "em-venda");
  return kits.length ? "A partir de " + brl(Math.min(...kits.map((p) => p.preco))) : "";
}

function heroPresentes() {
  const destaques = [
    ["kit-irmas-do-coracao", "l"],
    ["caneca-branca", "r"],
    ["kit-momento-cafe", "c"],
  ];
  return destaques.map(([id, pos]) => {
    const p = CATALOGO.produtos.find((item) => item.id === id);
    if (!p || !visivel(p) || !p.imagens?.length) return "";
    const img = p.imagens[0];
    const label = `${p.nome}, ${preco(p)}`;
    return `<a class="ub-card ub-card--${pos}" href="${V1}produto.html#${p.id}" aria-label="${esc(label)}">
      <img src="${foto(img.src, 540)}" srcset="${foto(img.src, 540)} 540w, ${foto(img.src, 1080)} 1080w" sizes="(min-width: 900px) 190px, 32vw" alt="" width="540" height="675"${pos === "c" ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async">
      <span class="ub-cap"><b>${esc(p.nome)}</b><span>${esc(preco(p))}</span></span>
    </a>`;
  }).join("\n");
}

const wa = (texto) => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(texto)}`;

function libHtml() {
  return {
    name: "lib-html",
    transformIndexHtml(html) {
      return html
        .replace("<!--lib:destaques-->", destaques())
        .replace("<!--lib:categorias-->", categorias())
        .replace("<!--lib:hero-presentes-->", heroPresentes())
        .replace("<!--lib:preco-kits-->", precoKits())
        .replaceAll("%V1%", V1)
        .replaceAll("%WA_AJUDA%", wa("Oi! Vim pelo site da Love in Box e quero ajuda para escolher um presente."))
        .replaceAll("%WA%", wa("Oi! Vim pelo site da Love in Box."));
    },
  };
}

export default defineConfig({
  plugins: [libHtml()],
  // O arquivo do 3D (three.js) passa de 500 kB sem compressão, mas só é baixado sob demanda.
  build: { target: "es2020", assetsInlineLimit: 0, chunkSizeWarningLimit: 700 },
  server: { port: 5173, strictPort: false },
});
