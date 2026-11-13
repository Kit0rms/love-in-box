/* Mascote · viagem entre seções. Um ScrollTrigger por seção diz qual está
   no meio da tela; a personagem (uma só) é chamada para o lugar dela ali.
   Rolagem rápida não acumula saltos: só a última seção ativa vale. */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MOTION as M } from "./motion-tokens.js";

gsap.registerPlugin(ScrollTrigger);

export function startTravel(mascot, spots) {
  let timer = 0, triggers = [];
  const pick = () => {
    // a mais abaixo na página entre as ativas (o rodapé ganha da seção anterior)
    let active = null;
    triggers.forEach((t, i) => { if (t.isActive) active = spots[i]; });
    // entre duas seções nenhuma está ativa: ela fica onde está (só o topo da página puxa de volta)
    if (!active) { if (window.scrollY > 200) return; active = spots[0]; }
    clearTimeout(timer);
    timer = setTimeout(() => mascot.goTo(active), M.travel.debounce);
  };
  const ctx = gsap.context(() => {
    triggers = spots.map((s, i) => ScrollTrigger.create({
      trigger: s.el,
      // o rodapé é curto e fica no fim: entra quando aparece na parte de baixo da tela
      start: i === spots.length - 1 ? "top 88%" : "top 58%",
      end: i === spots.length - 1 ? "bottom top" : "bottom 58%",
      onToggle: pick,
    }));
  });
  pick();
  return { pick, refresh: () => ScrollTrigger.refresh(), kill: () => { clearTimeout(timer); ctx.revert(); } };
}
