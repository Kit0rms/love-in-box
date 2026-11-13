/* Mascote · só o rosto, em avatar (loja).
   Uma versão leve da personagem para páginas em que ela acompanha a navegação:
   troca de expressão com um "pop", solta corações/brilhos/"?" e conversa num
   balão ao lado do rosto. Sem GSAP: só CSS (src/styles/loja.css).
   Falas e expressões: LOJA em reactions.js.

   Decisão da dona (13/11/2026), só para a loja: ela fica sempre ali (sem botão
   de esconder) e o balão tem lugar próprio, sempre visível, com a última fala.
   Por isso aqui não vale "cada fala uma vez por visita": a fala acompanha a ação. */
import { load, url } from "./poses.js";
import { LOJA, CLICK_FACES } from "./reactions.js";

const ICON = { coracoes: "/assets/img/icons/heart.png", brilhos: "/assets/img/icons/sparkle.png" };

export function createMascotFace(slot) {
  const calm = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

  const el = document.createElement("div");
  el.className = "face";
  el.innerHTML = `
    <button class="face-hit" type="button" aria-label="Mascote da Love in Box. Toque para ela reagir.">
      <span class="face-pic"><img alt="" decoding="async" draggable="false"><img alt="" decoding="async" draggable="false"></span>
    </button>
    <span class="face-fx" aria-hidden="true"></span>
    <p class="face-say" role="status" aria-live="polite"></p>`;
  const $ = (s) => el.querySelector(s);
  const hit = $(".face-hit"), pic = $(".face-pic"), bubble = $(".face-say"), fx = $(".face-fx");
  const imgs = [...el.querySelectorAll("img")];
  let front = 0, pose = null, seq = 0, backT = 0, clicks = 0;
  const lastRun = {};

  async function show(name) {
    if (name === pose) return;
    const my = ++seq;
    await load(name);
    if (my !== seq) return; // outra expressão entrou na frente
    const swap = () => {
      const next = imgs[1 - front];
      next.src = url(name);
      next.classList.add("is-on");
      imgs[front].classList.remove("is-on");
      front = 1 - front; pose = name;
    };
    if (calm() || !pose) return swap();
    pic.classList.remove("is-pop"); void pic.offsetWidth; pic.classList.add("is-pop"); // amassa…
    setTimeout(() => { if (my === seq) swap(); }, 90);                                 // …e troca no ponto mais amassado
  }

  function burst(kind) {
    if (!kind || calm()) return;
    const n = kind === "duvida" ? 1 : 3;
    for (let i = 0; i < n; i++) {
      let p;
      if (kind === "duvida") { p = document.createElement("span"); p.textContent = "?"; p.className = "face-q"; }
      else { p = document.createElement("img"); p.src = ICON[kind]; p.alt = ""; }
      p.classList.add("face-particle");
      p.style.setProperty("--x", (i - (n - 1) / 2) * 22 + "px");
      p.style.animationDelay = i * 0.09 + "s";
      p.addEventListener("animationend", () => p.remove());
      fx.append(p);
    }
  }

  // O balão fica sempre no lugar dele, com a última fala; trocar a fala dá um "pop".
  function say(text) {
    if (!text || text === bubble.textContent) return;
    bubble.textContent = text;
    if (!calm()) { bubble.classList.remove("is-new"); void bubble.offsetWidth; bubble.classList.add("is-new"); }
  }

  // id: chave de LOJA.
  function react(id) {
    const r = LOJA[id];
    if (!r || !el.isConnected) return false;
    const now = Date.now();
    if (r.cooldown && lastRun[id] && now - lastRun[id] < r.cooldown) return false;
    lastRun[id] = now;
    show(r.pose);
    burst(r.fx);
    say(r.message);
    clearTimeout(backT);
    backT = setTimeout(() => show(LOJA.REST), r.ms);
    return true;
  }

  hit.addEventListener("click", () => { // clique nela: sempre troca a expressão e solta algo
    const name = CLICK_FACES[clicks++ % CLICK_FACES.length];
    show(name);
    burst(name === "apaixonada" ? "coracoes" : name === "animada" ? "brilhos" : null);
    clearTimeout(backT);
    backT = setTimeout(() => show(LOJA.REST), 2200);
  });

  slot.append(el);
  show(LOJA.REST);
  say(LOJA.ENTRADA.message);
  (window.requestIdleCallback || ((fn) => setTimeout(fn, 800)))(() => ["curiosa", "apaixonada", "animada", "surpresa", "pensativa", "divertida", "confiante"].forEach(load));

  return { react, get state() { return { pose, fala: bubble.textContent }; } };
}
