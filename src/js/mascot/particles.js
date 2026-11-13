/* Mascote · elementos soltos em volta dela (camada D do brief).
   Coração e brilho são os ícones oficiais da marca. */
import { gsap } from "gsap";

const ICON = { coracoes: "/assets/img/icons/heart.png", brilhos: "/assets/img/icons/sparkle.png" };

// layer: elemento posicionado sobre a cabeça dela; head: largura da cabeça em px.
export function burst(layer, kind, head) {
  if (!kind || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const n = kind === "duvida" ? 1 : 4;
  for (let i = 0; i < n; i++) {
    let p;
    if (kind === "duvida") {
      p = document.createElement("span");
      p.textContent = "?";
      p.className = "mascot-q";
      p.style.fontSize = Math.round(head * 0.7) + "px";
    } else {
      p = document.createElement("img");
      p.src = ICON[kind];
      p.alt = "";
      p.width = p.height = Math.round(head * (0.34 + (i % 2) * 0.12));
    }
    p.className += " mascot-particle";
    layer.append(p);
    const side = i % 2 ? 1 : -1, spread = kind === "duvida" ? 0.55 : 0.35 + i * 0.22;
    gsap.fromTo(p,
      { x: side * head * spread * 0.6, y: -head * 0.1, scale: 0.3, opacity: 0, rotation: side * -12 },
      { x: side * head * spread, y: -head * (kind === "brilhos" ? 0.5 + (i % 3) * 0.25 : 1.1 + i * 0.12), scale: 1, opacity: 1, rotation: side * 10,
        duration: kind === "duvida" ? 0.45 : 0.7, delay: i * 0.09, ease: kind === "duvida" ? "back.out(2.4)" : "power2.out",
        onComplete: () => gsap.to(p, { opacity: 0, y: "-=" + head * 0.3, duration: 0.5, delay: kind === "duvida" ? 1.1 : 0.15, ease: "power1.in", onComplete: () => p.remove() }) });
  }
}
