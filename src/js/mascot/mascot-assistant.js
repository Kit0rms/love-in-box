/* MascotAssistant · a personagem única da Love in Box
   -------------------------------------------------------------------------
   Existe UMA personagem. Ela mora dentro do <div class="mascot-slot"> da
   seção ativa e troca de slot sem pular: some de um e aparece de surpresa no outro. No topo com 3D ela é um sprite dentro da caixa
   (scene/mascot-sprite.js); este elemento fica por cima, invisível, servindo
   de botão e de âncora do balão.

   API
     mascot.goTo(spot)                 chamada por travel.js
     mascot.react("ADD_TO_CART", { user: true })
     document.dispatchEvent(new CustomEvent("lib:mascot", { detail: { event: "ADD_TO_CART", user: true } }))
   Regras: docs/mascote-brief.md. Falas: reactions.js. Números: motion-tokens.js. */
import "../../styles/mascot.css";
import { gsap } from "gsap";
import { MOTION as M, SPOTS, headFor } from "./motion-tokens.js";
import { SETS, boxFor, load, preloadAll, url, SPIN, LOOK_BACK, LOOK_FRONT } from "./poses.js";
import { REACTIONS, LINES, CLICK_CYCLE, CLICK_FACES } from "./reactions.js";
import * as motion from "./motion.js";
import { burst } from "./particles.js";

const STORE = "lib-mascot";
const STOP = Symbol("stop");
const read = () => { try { return JSON.parse(sessionStorage.getItem(STORE)) || {}; } catch { return {}; } };

export function createMascotAssistant({ heroFallback = null } = {}) {
  const session = { hidden: false, said: {}, ...read() };
  const persist = () => { try { sessionStorage.setItem(STORE, JSON.stringify(session)); } catch {} };

  /* ----- estrutura ----- */
  const el = document.createElement("div");
  el.className = "mascot";
  el.innerHTML = `
    <p class="mascot-say" role="status" aria-live="polite"></p>
    <span class="mascot-shadow" aria-hidden="true"></span>
    <button class="mascot-hit" type="button" aria-label="Mascote da Love in Box. Toque para ela reagir.">
      <span class="mascot-clip"><span class="mascot-lean"><span class="mascot-rig"><span class="mascot-breath">
        <img alt="" decoding="async" draggable="false"><img alt="" decoding="async" draggable="false">
      </span></span></span></span>
    </button>
    <span class="mascot-fx" aria-hidden="true"></span>
    <button class="mascot-hide" type="button" aria-label="Esconder a mascote nesta visita">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true" focusable="false"><path d="M7 7l10 10M17 7 7 17"/></svg>
    </button>`;
  const $ = (s) => el.querySelector(s);
  const bubble = $(".mascot-say"), hit = $(".mascot-hit"), rig = $(".mascot-rig"), lean = $(".mascot-lean"),
    breath = $(".mascot-breath"), shadow = $(".mascot-shadow"), fx = $(".mascot-fx"), hideBtn = $(".mascot-hide");
  const imgs = [...el.querySelectorAll("img")];
  gsap.set([rig, lean, breath], { transformOrigin: "50% 100%" });

  /* ----- estado ----- */
  let front = 0, pose = null, mirrored = false, head = 40, height = 0;
  let spot = null, wanted = null, hero = null, run = 0, traveling = false, acting = false, reacting = null;
  let clicks = 0, cycle = 0, lastSay = -1e9, sayT = 0, nudgeT = 0, nudges = 0, breathing = null, reactSeq = 0;
  const lastRun = {};
  const calm = motion.reduced;
  const ok = (t) => { if (t !== run) throw STOP; };
  const dbg = (...a) => { if (import.meta.env.DEV) (window.__mlog = window.__mlog || []).push(Math.round(performance.now()) + " " + a.join(" ")); };
  const inBox = () => !!(spot && spot.type === "caixa" && hero);
  const kind = () => SPOTS[spot.type];
  const restY = () => (kind().clip ? Math.round(height * 0.05) : 0); // atrás da borda, fica um tico afundada

  /* ----- imagem ----- */
  async function showPose(name, mirror = false) {
    await load(name);
    const b = boxFor(name, head), next = imgs[1 - front];
    next.src = url(name);
    Object.assign(next.style, { width: b.w + "px", height: b.h + "px", marginLeft: -b.w / 2 + "px", transform: mirror ? "scaleX(-1)" : "" });
    next.classList.add("is-on");
    imgs[front].classList.remove("is-on");
    front = 1 - front; pose = name; mirrored = mirror; height = b.h;
    Object.assign(hit.style, { width: b.w + "px", height: b.h + "px", marginLeft: -b.w / 2 + "px" });
    fx.style.bottom = Math.round(b.h - head * 0.55) + "px";
    bubble.style.bottom = b.h + 12 + "px";
    hideBtn.style.bottom = Math.round(b.h - head * 0.3) + "px";
    hideBtn.style.marginLeft = Math.round(head * 0.62) + "px";
  }
  // Troca escondida por um amasso; no topo, quem troca é o sprite 3D.
  async function popPose(name) {
    await load(name);
    if (inBox()) return hero.pop(name);
    if (calm()) return showPose(name);
    await motion.squash(rig);
    await showPose(name);
    motion.release(rig);
  }
  // Sequência rápida de vistas (giro, virar): cada quadro com um micro-amasso.
  async function frames(list, t) {
    if (calm()) { const last = list[list.length - 1]; return showPose(last[0], false); }
    for (const [name, mirror] of list) {
      await load(name); ok(t);
      await showPose(name, !!mirror);
      gsap.fromTo(breath, { scaleX: 1.05 }, { scaleX: 1, duration: M.frame });
      await motion.wait(M.frame); ok(t);
    }
  }
  function setHead(px) {
    head = Math.max(12, Math.round(px));
    Object.assign(el.style, { width: Math.round(head * 1.7) + "px", height: Math.round(head * 3.1) + "px", marginLeft: -Math.round(head * 0.85) + "px" });
    if (pose) showPose(pose, mirrored);
  }
  function mount(s) {
    s.slot.append(el);
    spot = s;
    const k = SPOTS[s.type];
    setHead(s.type === "caixa" ? hero.head() : headFor(s.type, SETS[k.set].head));
    el.dataset.spot = s.type;
    el.classList.toggle("has-shadow", !!k.shadow);
    el.classList.remove("is-clip");
  }

  /* ----- fala: um balão por vez, cada fala uma vez por visita, com respiro ----- */
  function say(text, { force = false } = {}) {
    if (!text || session.hidden || session.said[text]) return false;
    const now = performance.now();
    if (!force && now - lastSay < M.speech.gap) return false;
    lastSay = now; session.said[text] = 1; persist();
    bubble.textContent = text;
    bubble.style.setProperty("--shift", "0px");
    bubble.classList.add("is-on");
    // não deixa o balão sair da tela nem ser cortado pelo card do topo
    const r = bubble.getBoundingClientRect(), box = el.closest(".hero")?.getBoundingClientRect();
    const min = Math.max(8, (box?.left ?? 0) + 8), max = Math.min(document.documentElement.clientWidth - 8, (box?.right ?? Infinity) - 8);
    let shift = 0;
    if (r.right > max) shift = max - r.right;
    if (r.left + shift < min) shift = min - r.left;
    bubble.style.setProperty("--shift", Math.round(shift) + "px");
    clearTimeout(sayT);
    sayT = setTimeout(hush, M.speech.hold);
    return true;
  }
  function hush() { clearTimeout(sayT); bubble.classList.remove("is-on"); }

  /* ----- viagem ----- */
  const onScreen = (r) => r && r.bottom > 0 && r.top < window.innerHeight && r.width + r.height > 0;
  const resolve = (s) => (s && s.type === "caixa" && !hero ? heroFallback : s);

  async function goTo(target) {
    wanted = target;
    const dest = resolve(target);
    if (session.hidden || !dest || dest === spot) return false;
    if (target.type === "caixa" && !hero && document.documentElement.classList.contains("has-3d")) return false; // 3D ainda carregando
    const t = ++run;
    dbg("goTo", t, dest.type, "from", spot?.type);
    hush(); clearTimeout(nudgeT);
    gsap.killTweensOf([rig, el, shadow, breath]);
    gsap.set(rig, { scaleX: 1, scaleY: 1, rotation: 0 });
    gsap.set(el, { clearProps: "transform,opacity" });
    gsap.set(shadow, { scale: 1, opacity: 1 });
    traveling = true; reacting = null; acting = false;
    try {
      await (calm() ? travelCalm(dest, t) : travel(dest, t));
      traveling = false;
      dbg("arrived", t);
      await arrive(dest, t);
      dbg("done", t);
      return true;
    } catch (e) {
      dbg("catch", t, e === STOP ? "STOP" : String(e));
      if (e !== STOP) { console.warn("mascote:", e); traveling = false; }
      return false;
    }
  }

  // Com "menos movimento": some, troca de lugar e de pose, aparece. Sem pulo nem giro.
  async function travelCalm(dest, t) {
    if (spot) { await gsap.to(el, { opacity: 0, duration: M.fade }); ok(t); }
    mount(dest);
    el.classList.toggle("is-clip", !!SPOTS[dest.type].clip);
    await showPose(dest.pose || SPOTS[dest.type].rest); ok(t);
    gsap.set(rig, { y: restY(), opacity: 1 });
    await gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: M.fade }); ok(t);
  }

  // Ela não pula nem anda de uma seção para a outra: some de onde está e aparece
  // de surpresa no lugar dela na nova seção (decisão da dona, 13/11/2026).
  async function travel(dest, t) {
    const from = spot, kA = from && SPOTS[from.type], kB = SPOTS[dest.type];

    /* 1. sair: some rápido (atrás da borda, ou encolhendo) — só se alguém está vendo */
    if (from && onScreen(el.getBoundingClientRect())) {
      if (kA.clip) await gsap.to(rig, { y: height * 1.05, duration: M.sink, ease: "power2.in" });
      else {
        gsap.to(shadow, { opacity: 0, duration: M.sink });
        await gsap.to(rig, { scaleX: 0.2, scaleY: 0.2, opacity: 0, duration: M.sink, ease: "back.in(1.6)" });
      }
      ok(t);
    }

    /* 2. trocar de lugar e de pose, escondida */
    gsap.set(rig, { opacity: 0 });
    const next = dest.pose || kB.rest;
    await load(next); ok(t);
    mount(dest);
    el.classList.toggle("is-clip", !!kB.clip); // o que passa da borda some atrás do bloco
    await showPose(next); ok(t);

    /* 3. surpresa: sobe de trás da borda, ou surge com um "pop" */
    if (kB.clip) {
      gsap.set(rig, { scaleX: 1, scaleY: 1, y: height * 1.05, opacity: 1 });
      await gsap.to(rig, { y: restY(), duration: M.rise, ease: "back.out(1.6)" });
    } else {
      gsap.set(rig, { y: 0, scaleX: 0.2, scaleY: 0.2, opacity: 0 });
      gsap.fromTo(shadow, { opacity: 0 }, { opacity: 1, duration: M.pop.settle });
      await gsap.to(rig, { scaleX: 1, scaleY: 1, opacity: 1, duration: M.pop.settle, ease: "back.out(2)" });
    }
    ok(t);
  }

  // Presença: o que ela faz ao chegar, sem clique.
  async function arrive(dest, t) {
    const k = SPOTS[dest.type];
    if (!breathing && !calm()) breathing = motion.idle(breath);
    if (dest.type === "caixa" && hero) hero.wave();
    else if (!calm()) {
      if (k.clip && (dest.pose || k.rest) === "acenando") motion.wave(rig);
    }
    burst(fx, dest.fx, head);
    say(LINES[dest.line]);
    if (dest.act === "olhar" && !calm()) { // vira de costas para "olhar" as fotos e volta sorrindo
      await motion.wait(0.9); ok(t);
      await frames(LOOK_BACK, t);
      await motion.wait(1.1); ok(t);
      await frames(LOOK_FRONT, t);
    }
    if (dest.type === "caixa" && nudges < M.nudge.max) {
      nudgeT = setTimeout(() => {
        if (t !== run || clicks || session.hidden) return;
        nudges++;
        if (hero) hero.hop(); else if (!calm()) motion.jump(rig, shadow, head * 0.4);
        say(LINES.CONVITE);
      }, M.nudge.after);
    }
  }

  /* ----- movimento conforme o enquadramento ----- */
  function move(name, dir = 1) {
    if (calm()) return;
    if (inBox()) return name === "wave" ? hero.wave() : hero.hop();
    const k = kind();
    if (name === "wave") motion.wave(rig);
    else if (name === "tilt") motion.tilt(rig, 7 * dir);
    else if (k.clip) motion.dip(rig, restY(), height * 0.12);
    else motion.jump(rig, k.shadow ? shadow : null, head * (name === "jump" ? 0.7 : 0.4));
  }

  /* ----- clique: sempre mexe E troca a imagem ----- */
  async function onClick() {
    if (session.hidden || !spot || traveling || acting) return;
    clicks++; clearTimeout(nudgeT);
    reactSeq++; reacting = null; // o clique cancela a reação em andamento (ela não volta para a pose antiga por cima)
    const t = run, k = kind();
    acting = true;
    try {
      if (spot.type === "caixa" && hero && clicks % M.spinEvery === 0) { acting = false; return voltinha(); }
      if (spot.type === "caixa" || k.set === "gestos") {
        const c = CLICK_CYCLE[cycle++ % CLICK_CYCLE.length];
        move("jump");
        await popPose(c.pose); ok(t);
        burst(fx, c.fx, head);
        say(c.message, { force: true });
      } else if (k.set === "expressoes") {
        const face = CLICK_FACES[cycle++ % CLICK_FACES.length];
        move("jump");
        await popPose(face); ok(t);
        burst(fx, face === "apaixonada" ? "coracoes" : face === "animada" ? "brilhos" : null, head);
        say(CLICK_CYCLE[cycle % CLICK_CYCLE.length].message, { force: true });
      } else { // corpo inteiro (ou sentada, que se levanta): pulo + giro 360° mostrando a roupa
        if (spot.type === "sentada") { await popPose("frente"); ok(t); }
        if (!calm()) motion.jump(rig, k.shadow ? shadow : null, head * 0.8);
        await frames(SPIN, t);
        burst(fx, "brilhos", head);
        say(LINES.VOLTINHA, { force: true });
        if (spot.type === "sentada") { await motion.wait(0.9); ok(t); await popPose("trabalhando"); ok(t); }
      }
    } catch (e) { if (e !== STOP) console.warn("mascote:", e); }
    acting = false;
  }

  // A cada 4º clique no topo: pula para fora da caixa, dá a voltinha 360° e volta.
  async function voltinha() {
    const home = spot, t0 = wanted;
    if (!heroFallback || !(await goTo(heroFallback))) return;
    wanted = t0;
    const t = run;
    try {
      acting = true;
      await motion.wait(0.25); ok(t);
      motion.jump(rig, shadow, head * 0.8);
      await frames(SPIN, t);
      burst(fx, "brilhos", head);
      say(LINES.VOLTINHA, { force: true });
      await motion.wait(1.5); ok(t);
      acting = false;
      await goTo(home);
    } catch (e) { acting = false; if (e !== STOP) console.warn("mascote:", e); }
  }

  /* ----- reações a ações da página (reactions.js) ----- */
  function react(id, { user = false, hover = false, target = null } = {}) {
    const r = REACTIONS[id];
    if (!r || session.hidden || !spot || traveling || acting) return false;
    if (hover && !onScreen(el.getBoundingClientRect())) return false; // fora da tela, não gasta a reação
    const now = Date.now();
    const cooldown = hover ? Math.min(r.cooldown, M.hover.cooldown) : r.cooldown;
    if (lastRun[id] && now - lastRun[id] < cooldown) return false;
    if (reacting && (r.priority < reacting.priority || !(user || hover))) return false;
    lastRun[id] = now;
    // para que lado está o elemento que provocou a reação: ela inclina para lá
    let dir = 1;
    if (target?.getBoundingClientRect) {
      const a = target.getBoundingClientRect(), b = el.getBoundingClientRect();
      dir = a.left + a.width / 2 >= b.left + b.width / 2 ? 1 : -1;
    }
    runReaction(r, user, dir);
    return true;
  }
  async function runReaction(r, user, dir = 1) {
    const t = run, k = kind(), back = pose, my = ++reactSeq;
    const still = () => { ok(t); if (my !== reactSeq) throw STOP; }; // outra reação (ou um clique) entrou na frente
    if (reacting) { // interrompe a anterior sem deixar a marionete torta
      gsap.killTweensOf(rig);
      gsap.set(rig, { scaleX: 1, scaleY: 1, rotation: 0, y: k.clip ? restY() : 0 });
    }
    reacting = r;
    try {
      if (spot.type === "caixa" || k.clip) {
        move(r.motion, dir);
        await popPose(r.pose); still();
        burst(fx, r.fx, head);
        say(r.message, { force: user });
        await motion.wait(r.ms / 1000); still();
        await popPose(spot.pose || k.rest);
      } else { // corpo inteiro ou sentada: reage com o corpo (não dá para mostrar meio corpo aqui)
        move(r.motion === "tilt" || r.motion === "wave" ? "tilt" : "jump", dir);
        if (k.set === "vistas") { await frames([["tres-quartos-frente"]], t); still(); }
        burst(fx, r.fx, head);
        say(r.message, { force: user });
        await motion.wait(r.ms / 1000); still();
        if (k.set === "vistas") await frames([[back && back !== "tres-quartos-frente" ? back : "frente"]], t);
      }
    } catch (e) { if (e !== STOP) console.warn("mascote:", e); }
    if (my === reactSeq) reacting = null;
  }

  /* ----- esconder / mostrar ----- */
  function setHidden(v) {
    session.hidden = v; persist();
    document.documentElement.classList.toggle("mascot-off", v);
    document.querySelectorAll("[data-mascot-toggle]").forEach((b) => { b.textContent = v ? "Mostrar a mascote" : "Esconder a mascote"; b.setAttribute("aria-pressed", String(v)); });
    if (v) {
      run++; hush(); clearTimeout(nudgeT);
      gsap.killTweensOf([rig, el, shadow]);
      if (inBox()) hero.leave();
      el.remove(); spot = null; traveling = false; acting = false;
    } else if (wanted) goTo(wanted);
  }
  hideBtn.addEventListener("click", (e) => { e.stopPropagation(); setHidden(true); });
  hit.addEventListener("click", onClick);
  document.addEventListener("click", (e) => { if (e.target.closest?.("[data-mascot-toggle]")) setHidden(!session.hidden); });
  document.addEventListener("lib:mascot", (e) => { if (e.detail?.event) react(e.detail.event, e.detail); });

  /* ----- inclinar para o cursor (computador) ----- */
  const leanR = gsap.quickTo(lean, "rotation", { duration: M.lean.dur, ease: "power2.out" });
  const leanX = gsap.quickTo(lean, "x", { duration: M.lean.dur, ease: "power2.out" });
  let leanQueued = false;
  window.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse" || leanQueued || !spot || traveling || inBox() || calm()) return;
    leanQueued = true;
    requestAnimationFrame(() => {
      leanQueued = false;
      if (!el.isConnected) return;
      const r = el.getBoundingClientRect();
      const k = gsap.utils.clamp(-1, 1, (e.clientX - (r.left + r.width / 2)) / 420);
      leanR(k * M.lean.deg); leanX(k * M.lean.px);
    });
  }, { passive: true });

  /* ----- pausa a respiração fora da tela; reajusta o tamanho ao girar/redimensionar ----- */
  new IntersectionObserver(([en]) => { if (breathing) en.isIntersecting ? breathing.resume() : breathing.pause(); }).observe(el);
  let resizeT = 0;
  window.addEventListener("resize", () => {
    clearTimeout(resizeT);
    resizeT = setTimeout(() => { if (!spot) return; hero?.layout(); setHead(spot.type === "caixa" && hero ? hero.head() : headFor(spot.type, SETS[kind().set].head)); }, 200);
  });

  if (session.hidden) setHidden(true);
  preloadAll();

  return {
    goTo, react, setHidden,
    // O topo 3D avisa quando a caixa está pronta (ou quando o 3D caiu e ficou a imagem).
    attachHero(adapter) { hero = adapter; if (wanted && wanted.type === "caixa") goTo(wanted); },
    detachHero() { const was = inBox(); hero = null; if (was) { spot = null; el.remove(); } if (wanted) goTo(wanted); },
    get state() { return { spot: spot?.type || null, section: spot?.el?.id || spot?.el?.className || null, pose, mirrored, head, traveling, hidden: session.hidden, said: Object.keys(session.said), inBox: inBox() }; },
  };
}
