/* Love in Box · página inicial
  A hero é uma composição editorial em CSS; a mascote só começa nas seções
  seguintes e é carregada depois que a página abriu (docs/mascote-brief.md). */

const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ----- menu (celular) ----- */
const menuBtn = document.querySelector(".menu-btn");
const nav = document.getElementById("menu");
if (menuBtn && nav) {
  const setOpen = (open) => {
    nav.classList.toggle("is-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
  };
  menuBtn.addEventListener("click", () => setOpen(!nav.classList.contains("is-open")));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("is-open")) { setOpen(false); menuBtn.focus(); }
  });
  document.addEventListener("click", (e) => {
    if (!nav.contains(e.target) && !menuBtn.contains(e.target)) setOpen(false);
  });
}

/* ----- cabeçalho: acompanha a página; some ao rolar para baixo e volta ao rolar para cima ----- */
const header = document.querySelector(".header");
if (header) {
  let lastY = window.scrollY, queued = false;
  const restTop = () => document.querySelector(".notice")?.offsetHeight || 0; // onde ele fica antes de grudar (abaixo da faixa)
  const show = () => header.classList.remove("is-hidden");
  const update = () => {
    queued = false;
    const y = Math.max(0, window.scrollY), top = restTop();
    header.classList.toggle("is-stuck", y > top);
    if (y <= top + header.offsetHeight) show();                    // perto do topo: sempre à vista
    else if (y > lastY + 4) {                                      // descendo: some (e fecha o menu do celular)
      if (!header.querySelector(":focus-visible")) {                // quem navega pelo teclado no menu não o perde
        header.classList.add("is-hidden");
        if (nav?.classList.contains("is-open")) { nav.classList.remove("is-open"); menuBtn?.setAttribute("aria-expanded", "false"); }
      }
    } else if (y < lastY - 4) show();                              // voltando: aparece
    lastY = y;
  };
  window.addEventListener("scroll", () => { if (!queued) { queued = true; requestAnimationFrame(update); } }, { passive: true });
  header.addEventListener("focusin", show); // teclado: quem foca o menu sempre o vê
  update();
}

/* ----- WhatsApp flutuante: no celular só aparece depois dos botões do topo -----
   (no primeiro ecrã ele ficaria por cima de "Ver os presentes"; o CSS só aplica .is-wait em telas pequenas) */
const waFab = document.querySelector(".wa"), heroBtns = document.querySelector(".hero2 .btn-row");
if (waFab && heroBtns && "IntersectionObserver" in window) {
  waFab.classList.add("is-wait");
  new IntersectionObserver(([en]) => waFab.classList.toggle("is-wait", en.isIntersecting || en.boundingClientRect.top > 0)).observe(heroBtns);
}

/* ----- hero editorial: a caixa começa fechada e abre no clique -----
   O estado fechado é aplicado por um script em linha no index.html (antes da
   primeira pintura). Aqui só entra o clique. A mascote não participa desta seção. */
function startHeroUnboxing() {
  const box = document.querySelector("[data-unbox]");
  const opener = box?.querySelector(".ub-open");
  const well = box?.querySelector(".ub-well");
  if (!box || !opener || !well || !box.classList.contains("is-closed")) return;

  // corações e brilhos (ícones oficiais) saltam da caixa quando a tampa sobe
  const confetti = () => {
    const icons = ["heart", "sparkle"];
    for (let i = 0; i < 10; i++) {
      const p = document.createElement("i");
      const angle = (-160 + (140 / 9) * i) * (Math.PI / 180); // leque para cima
      const far = 26 + (i % 3) * 9;
      p.className = "ub-pop";
      p.setAttribute("aria-hidden", "true");
      p.style.backgroundImage = `url(/assets/img/icons/${icons[i % 2]}.png)`;
      p.style.setProperty("--dx", (Math.cos(angle) * far).toFixed(1) + "cqw");
      p.style.setProperty("--dy", (Math.sin(angle) * far).toFixed(1) + "cqw");
      p.style.setProperty("--rot", (i % 2 ? 40 : -40) + "deg");
      p.style.animationDelay = 0.18 + i * 0.03 + "s";
      p.addEventListener("animationend", () => p.remove());
      box.append(p);
    }
  };

  const open = () => {
    const byKeyboard = opener.matches(":focus-visible");
    box.classList.remove("is-closed");
    well.inert = false;
    if (calm) {
      box.classList.add("is-open", "is-static"); // sem animação: já aparece aberta
      opener.hidden = true;
    } else {
      box.classList.add("is-anim", "is-open");
      opener.classList.add("is-gone");
      confetti();
      setTimeout(() => { box.classList.remove("is-anim"); opener.hidden = true; }, 1800);
    }
    // quem abriu pelo teclado continua de onde parou: no primeiro presente
    if (byKeyboard) box.querySelector(".ub-card--c")?.focus({ preventScroll: true });
  };
  opener.addEventListener("click", open, { once: true });

  // rolagem: os presentes se afastam de leve enquanto a hero sai da tela
  const hero = box.closest(".hero2");
  let queued = false;
  const updateScroll = () => {
    queued = false;
    const r = hero?.getBoundingClientRect();
    const progress = Math.min(1, Math.max(0, -(r?.top || 0) / (r?.height || 1)));
    box.style.setProperty("--p", progress.toFixed(3));
  };
  window.addEventListener("scroll", () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(updateScroll);
  }, { passive: true });
  updateScroll();
}

startHeroUnboxing();

/* ----- transições de seção (ida e volta) -----
   Cada bloco entra quando chega na tela e recolhe quando sai, nos dois sentidos
   da rolagem: descendo ele sobe para o lugar; voltando, ele desce para o lugar.
   Fotos e texto vêm dos lados, listas entram em cascata. O que já está à vista
   ao abrir a página não pisca. */
function startReveal() {
  if (calm || !("IntersectionObserver" in window)) return;
  // Nunca esconder um elemento que contém um .mascot-slot: a mascote mora ali e
  // sumiria junto (ela aparece por cima da borda antes de o bloco entrar na tela).
  // Nesses casos entram os filhos, menos o slot.
  const groups = [
    [".block-head:not(.block-head--mascot), .block-head--mascot > :not(.mascot-slot), .faq-head, .block-foot, .rail", "up"],
    [".cta > :not(.mascot-slot), .footer > :not(.mascot-slot)", "up"],
    [".split:not(.split--rev) > .split-media, .split--rev > .split-copy", "left"],
    [".split:not(.split--rev) > .split-copy, .split--rev > .split-media", "right"],
    [".cats > li, .cards > li, .steps > li, .faq details", "up", true],
  ];
  const io = new IntersectionObserver((entries) => {
    let n = 0;
    for (const en of entries) {
      const el = en.target;
      if (en.isIntersecting) {
        el.style.setProperty("--d", ("revealStagger" in el.dataset ? n++ * 80 : 0) + "ms"); // cascata entre os que chegam juntos
        el.classList.add("is-in");
      } else {
        el.style.setProperty("--d", "0ms");
        // saiu por cima da tela → recolhe para cima (e volta de lá); saiu por baixo → para baixo
        if (en.boundingClientRect.top < 0) el.dataset.out = "up"; else delete el.dataset.out;
        el.classList.remove("is-in");
      }
    }
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });

  const vh = window.innerHeight;
  for (const [selector, kind, stagger] of groups) {
    for (const el of document.querySelectorAll(selector)) {
      if (el.querySelector(".mascot-slot, .mascot")) continue; // garantia: a casa da mascote nunca fica invisível
      const r = el.getBoundingClientRect();
      if (r.top < vh && r.bottom > 0) el.classList.add("is-in"); // já à vista: começa no lugar, sem animar
      else if (r.bottom <= 0) el.dataset.out = "up";
      el.dataset.reveal = kind;
      if (stagger) el.dataset.revealStagger = "";
      io.observe(el);
    }
  }
}

startReveal();

let mascot = null;

/* ----- mascote: uma personagem só, que viaja pelas seções -----
   Lugar dela em cada seção:  data-mascot-spot + <div class="mascot-slot"> (ver mascot/spots.js)
   Gatilhos de reação:        data-mascot="EVENTO" (mouse, foco, clique) e data-mascot-view="EVENTO" (seção na tela) */
async function startMascot() {
  const [{ createMascotAssistant }, { readSpots }, { startTravel }, { MOTION }] = await Promise.all([
    import("./mascot/mascot-assistant.js"), import("./mascot/spots.js"), import("./mascot/travel.js"), import("./mascot/motion-tokens.js"),
  ]);
  const spots = readSpots();
  if (!spots.length) return;
  mascot = createMascotAssistant();
  if (import.meta.env.DEV) window.__libMascot = mascot;
  const travel = startTravel(mascot, spots);
  window.addEventListener("load", () => travel.refresh(), { once: true });

  /* reações a ações reais: cada elemento com data-mascot tem a sua (reactions.js).
     Mouse: só reage se o cursor parar um instante no elemento (passar por cima correndo não conta). */
  let dwell = 0;
  const hover = (e) => {
    if (e.pointerType && e.pointerType !== "mouse") return;
    const t = e.target.closest?.("[data-mascot]");
    if (!t || t.contains(e.relatedTarget)) return;
    clearTimeout(dwell);
    const go = () => mascot.react(t.dataset.mascot, { hover: true, target: t });
    if (e.type === "focusin") { if (t.matches(":focus-visible")) go(); return; }
    dwell = setTimeout(() => { if (t.matches(":hover")) go(); }, MOTION.hover.dwell);
  };
  document.addEventListener("pointerover", hover, { passive: true });
  document.addEventListener("focusin", hover);
  document.addEventListener("click", (e) => {
    if (e.target.closest?.('a[href*="wa.me"]')) { mascot.react("WHATSAPP_CONTACT", { user: true }); return; }
    const t = e.target.closest?.("[data-mascot]");
    if (t) mascot.react(t.dataset.mascot, { user: true, target: t });
  });
  // pergunta aberta: curiosa; fechada: sorriso
  document.querySelectorAll(".faq details").forEach((d) => d.addEventListener("toggle", () => mascot.react(d.open ? "FAQ_OPEN" : "FAQ_CLOSE", { user: true })));

  // seções com data-mascot-view: reage quando a seção está na tela; se ela estiver
  // ocupada (viajando), tenta de novo enquanto a pessoa continuar ali (uma vez por seção)
  const inView = new Set();
  let retry = 0;
  const tryViews = () => {
    for (const s of inView) {
      if (mascot.react(s.dataset.mascotView)) { inView.delete(s); seen.unobserve(s); break; }
    }
    if (!inView.size) { clearInterval(retry); retry = 0; }
  };
  const seen = new IntersectionObserver((entries) => {
    for (const en of entries) en.isIntersecting ? inView.add(en.target) : inView.delete(en.target);
    if (inView.size && !retry) retry = setInterval(tryViews, 2500);
  }, { threshold: 0.55 });
  document.querySelectorAll("[data-mascot-view]").forEach((s) => seen.observe(s));
}
const whenIdle = window.requestIdleCallback || ((fn) => setTimeout(fn, 900));
if (document.readyState === "complete") whenIdle(startMascot);
else window.addEventListener("load", () => whenIdle(startMascot), { once: true });
