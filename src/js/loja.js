/* Love in Box · loja
   O motor da loja (filtros, cartões, sacola) continua sendo o do v1
   (public/assets/js/pages.js e app.js). Este módulo cuida do que é novo:
   barra de categorias que acompanha a página, entrada animada dos cartões e
   a mascote em avatar reagindo ao que a pessoa faz. */
import { createMascotFace } from "./mascot/face.js";

const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (s) => document.querySelector(s);
const sticky = $(".shop-sticky"), sentinel = $(".shop-sentinel"), grid = $("#shop-grid"), count = $("#result-count");
const replay = (el, cls) => { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); };

/* ----- cabeçalho com a mesma composição da home -----
   O app.js do v1 já montou o cabeçalho e ligou menu lateral, sacola e o sumir ao rolar.
   Aqui só se reorganiza: marca à esquerda; à direita os mesmos links da home, a sacola
   (a loja precisa dela para a pessoa ver a seleção) e, no celular, o botão Menu. */
function alignHeader() {
  const hdr = document.getElementById("lib-hdr");
  const nav = hdr?.querySelector(".nav-desk"), right = hdr?.querySelector(".hdr-right"), menu = document.getElementById("menu-open");
  if (!hdr || !nav || !right || !menu) return;
  const cat = new URLSearchParams(location.hash.slice(1)).get("categoria");
  const link = (href, text, on) => `<a class="nav-link" href="${href}"${on ? ' aria-current="page"' : ""}>${text}</a>`;
  nav.innerHTML =
    link("loja.html", "Presentes", cat !== "boxes-e-kits") +
    link("loja.html#categoria=boxes-e-kits", "Kits", cat === "boxes-e-kits") +
    link("personalizados.html", "Personalizados") +
    link("como-funciona.html", "Como funciona") +
    link("ajuda.html", "Ajuda");
  right.querySelector(".hdr-help")?.remove();
  right.querySelector('a[href="loja.html#busca"]')?.remove(); // a busca já está na própria página
  right.prepend(nav);
  right.append(menu);
  menu.insertAdjacentHTML("beforeend", "<span>Menu</span>");
  document.body.classList.add("hdr-home");
}
alignHeader();

/* ----- barra de categorias: gruda logo abaixo do cabeçalho e some junto com ele ao descer ----- */
function trackHeader() {
  const set = () => {
    const hdr = document.getElementById("lib-hdr");
    const away = document.body.classList.contains("hdr-away") || !hdr;
    document.documentElement.style.setProperty("--shop-top", (away ? 0 : Math.round(hdr.getBoundingClientRect().height)) + "px");
  };
  new MutationObserver(set).observe(document.body, { attributes: true, attributeFilter: ["class"] });
  window.addEventListener("resize", set);
  set();
}
if (sticky && sentinel && "IntersectionObserver" in window) {
  new IntersectionObserver(([en]) => sticky.classList.toggle("is-stuck", !en.isIntersecting && en.boundingClientRect.top < 0)).observe(sentinel);
}

/* ----- mascote ----- */
const slot = sticky?.querySelector(".mascot-slot");
const face = slot ? createMascotFace(slot) : null;
if (import.meta.env.DEV) window.__libFace = face;

/* ----- a lista mudou (pages.js avisa com lib:loja) ----- */
let first = true;
function onList({ key, value, count: n }) {
  // cartões entram em cascata a cada mudança
  if (grid && !calm) replay(grid, "is-fresh");
  if (count && !first && !calm) replay(count, "is-bump");

  const phone = matchMedia("(max-width: 699px)").matches;
  if (!first && phone && key === "categoria") {
    // celular: as categorias ficam empilhadas acima da lista; ao escolher uma, leva a pessoa até o resultado
    const line = $(".result-line");
    if (line) {
      let top = line.getBoundingClientRect().top + window.scrollY - 12;
      if (top < window.scrollY) top -= (document.getElementById("lib-hdr")?.getBoundingClientRect().height || 0) + (sticky?.querySelector(".mascot-slot")?.getBoundingClientRect().height || 0) + 12; // subindo, cabeçalho e mascote reaparecem
      window.scrollTo({ top, behavior: calm ? "auto" : "smooth" });
    }
  } else if (!first && key !== "q" && sticky?.classList.contains("is-stuck")) {
    // filtrou com a barra grudada lá embaixo: volta ao começo da lista para ver o resultado
    // subir faz o cabeçalho reaparecer: desconta a altura dele para a contagem não ficar escondida
    const hdr = document.getElementById("lib-hdr")?.getBoundingClientRect().height || 0;
    const top = (sentinel?.getBoundingClientRect().top || 0) + window.scrollY - hdr - 8;
    window.scrollTo({ top, behavior: calm ? "auto" : "smooth" });
  }

  const kits = new URLSearchParams(location.hash.slice(1)).get("categoria") === "boxes-e-kits";
  document.querySelectorAll("#lib-hdr .nav-desk .nav-link").forEach((a, i) => {
    if (i === 0) a.toggleAttribute("aria-current", !kits); else if (i === 1) a.toggleAttribute("aria-current", kits);
    if (a.hasAttribute("aria-current")) a.setAttribute("aria-current", "page");
  });

  if (face) {
    if (first) { // chegou por um link já com categoria (ex.: vindo da home): ela comenta a categoria
      const cat = new URLSearchParams(location.hash.slice(1)).get("categoria");
      if (cat && n) face.react("CAT:" + cat);
    }
    else if (!n) face.react("VAZIO");
    else if (key === "categoria") face.react("CAT:" + value);
    else if (key === "q") { if (value) face.react("BUSCA"); }
    else if (key === "limpar") face.react("LIMPAR");
    else if (key !== "nav" && key !== "init") face.react("FILTRO");
  }
  first = false;
}
document.addEventListener("lib:loja", (e) => onList(e.detail));
// o motor do v1 (script defer) já montou a lista antes deste módulo rodar: trata a primeira montagem aqui
if (grid && (grid.children.length || !$("#shop-empty")?.hidden)) onList({ key: "init", value: "", count: grid.children.length });

/* ----- ações diretas ----- */
let peekT = 0;
document.addEventListener("focusin", (e) => { if (e.target.id === "q") face?.react("BUSCA"); });
document.addEventListener("click", (e) => {
  const add = e.target.closest?.("[data-add]");
  if (!add) return;
  face?.react("ADICIONOU");
  // se a barra estiver recolhida (rolando para baixo), ela aparece um instante para a mascote comemorar
  if (sticky) { sticky.classList.add("is-peek"); clearTimeout(peekT); peekT = setTimeout(() => sticky.classList.remove("is-peek"), 3200); }
  if (!calm) replay(add, "is-pop");
});
// mouse parado num produto: ela fica curiosa
let dwell = 0;
document.addEventListener("pointerover", (e) => {
  if (e.pointerType !== "mouse") return;
  const card = e.target.closest?.(".pcard");
  if (!card || card.contains(e.relatedTarget)) return;
  clearTimeout(dwell);
  dwell = setTimeout(() => { if (card.matches(":hover")) face?.react("PRODUTO"); }, 160);
}, { passive: true });

trackHeader();
