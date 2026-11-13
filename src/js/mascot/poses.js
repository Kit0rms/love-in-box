/* Mascote · imagens. poses.json é gerado por scripts/build-mascot.mjs.
   Toda troca de imagem passa por aqui: carregar, decodificar e só então trocar. */
import data from "./poses.json";

export const SETS = data.sets;
export const POSES = data.poses;
export const url = (name) => `/assets/img/mascote/${POSES[name].file}`;
export const setOf = (name) => POSES[name].set;

// Tamanho na tela de uma pose, a partir da largura da cabeça.
export function boxFor(name, head) {
  const s = SETS[setOf(name)], k = head / s.head;
  return { w: Math.round(s.w * k), h: Math.round(s.h * k) };
}

const cache = new Map();
export function load(name) {
  if (!cache.has(name)) {
    const img = new Image();
    img.src = url(name);
    cache.set(name, img.decode().catch(() => {}));
  }
  return cache.get(name);
}
export function preloadAll() {
  (window.requestIdleCallback || ((fn) => setTimeout(fn, 800)))(() => Object.keys(POSES).forEach(load));
}

/* Giro 360° horário. `true` = vista espelhada: só como quadro de passagem
   (o espelho troca a tatuagem e o piercing de lado), nunca parada. */
export const SPIN = [
  ["tres-quartos-frente"], ["lado-direito"], ["tres-quartos-tras"], ["tras"],
  ["tres-quartos-tras", true], ["lado-esquerdo"], ["tres-quartos-frente", true], ["frente"],
];
// Virar para um lado (dir > 0 = direita) e voltar de frente.
export const turnTo = (dir) => (dir > 0 ? [["tres-quartos-frente"], ["lado-direito"]] : [["tres-quartos-frente", true], ["lado-esquerdo"]]);
export const turnBack = (dir) => (dir > 0 ? [["tres-quartos-frente"], ["frente"]] : [["tres-quartos-frente", true], ["frente"]]);
export const profile = (dir) => (dir > 0 ? "lado-direito" : "lado-esquerdo");
export const LOOK_BACK = [["tres-quartos-tras"], ["tras"]];
export const LOOK_FRONT = [["tres-quartos-tras"], ["tres-quartos-frente"], ["frente"]];
