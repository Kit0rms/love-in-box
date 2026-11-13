/* Mascote · movimentos reutilizáveis ("marionete"). Só transform e opacity,
   sempre com o pivô nos pés. Os números vêm de motion-tokens.js. */
import { gsap } from "gsap";
import { MOTION as M } from "./motion-tokens.js";

const ELASTIC = "elastic.out(1,0.5)";

export const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
export const wait = (seconds) => new Promise((resolve) => gsap.delayedCall(seconds, resolve));

// Amassa (para esconder a troca de imagem) e solta.
export const squash = (rig) => gsap.to(rig, { scaleX: M.pop.squash[0], scaleY: M.pop.squash[1], duration: M.pop.in, ease: "power2.in" });
export const release = (rig) => gsap.timeline()
  .to(rig, { scaleX: M.pop.stretch[0], scaleY: M.pop.stretch[1], duration: M.pop.out, ease: "power2.out" })
  .to(rig, { scaleX: 1, scaleY: 1, duration: M.pop.settle, ease: ELASTIC });

// Pulo de corpo inteiro: agacha → sobe → cai → amassa → volta. A sombra encolhe no ar.
export function jump(rig, shadow, height) {
  const j = M.jump, tl = gsap.timeline();
  tl.to(rig, { scaleX: j.crouch[0], scaleY: j.crouch[1], duration: j.crouchDur, ease: "power2.in" })
    .to(rig, { y: -height, scaleX: 0.96, scaleY: 1.08, duration: j.up, ease: "power2.out" })
    .to(rig, { y: 0, scaleX: 1, scaleY: 1, duration: j.down, ease: "power2.in" })
    .to(rig, { scaleX: j.land[0], scaleY: j.land[1], duration: j.landDur, ease: "power2.out" })
    .to(rig, { scaleX: 1, scaleY: 1, duration: M.pop.settle, ease: ELASTIC });
  if (shadow) {
    tl.to(shadow, { scale: 0.68, opacity: 0.45, duration: j.up, ease: "power2.out" }, j.crouchDur)
      .to(shadow, { scale: 1, opacity: 1, duration: j.down, ease: "power2.in" }, j.crouchDur + j.up);
  }
  return tl;
}

// Pulinho de quem está atrás de uma borda: afunda e volta, sem nunca mostrar a cintura.
export const dip = (rig, rest, depth) => gsap.timeline()
  .to(rig, { y: rest + depth, scaleX: 1.05, scaleY: 0.94, duration: 0.12, ease: "power2.in" })
  .to(rig, { y: rest, scaleX: 1, scaleY: 1, duration: 0.5, ease: "back.out(1.2)" });

export const wave = (rig) => gsap.timeline()
  .to(rig, { rotation: -5, duration: 0.16, ease: "sine.inOut" })
  .to(rig, { rotation: 4, duration: 0.2, yoyo: true, repeat: 3, ease: "sine.inOut" })
  .to(rig, { rotation: 0, duration: 0.2, ease: "sine.inOut" });

export const tilt = (rig, deg = 7, hold = 1.3) => gsap.timeline()
  .to(rig, { rotation: deg, duration: 0.3, ease: "power2.out" })
  .to(rig, { rotation: 0, duration: 0.45, ease: "power2.inOut" }, "+=" + hold);

export const land = (rig) => gsap.fromTo(rig, { scaleX: M.jump.land[0], scaleY: M.jump.land[1] }, { scaleX: 1, scaleY: 1, duration: M.pop.settle, ease: ELASTIC });

// Respiração e balanço, sempre ligados e discretos. Devolve controles para pausar fora da tela.
export function idle(el) {
  const a = gsap.to(el, { scaleY: M.breath.scaleY, duration: M.breath.dur, yoyo: true, repeat: -1, ease: "sine.inOut" });
  const b = gsap.fromTo(el, { rotation: -M.sway.deg }, { rotation: M.sway.deg, duration: M.sway.dur, yoyo: true, repeat: -1, ease: "sine.inOut", delay: 0.7 });
  return { pause() { a.pause(); b.pause(); }, resume() { a.resume(); b.resume(); }, kill() { a.kill(); b.kill(); gsap.set(el, { scaleY: 1, rotation: 0 }); } };
}
