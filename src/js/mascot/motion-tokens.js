/* Mascote · números do movimento. Todo tempo, easing e tamanho mora aqui
   (docs/mascote-brief.md). Mudou aqui, muda no site inteiro. */

export const BREAKPOINT = 900; // px: acima disso valem os tamanhos de computador

export const MOTION = {
  breath: { scaleY: 1.015, dur: 1.6 },
  sway: { deg: 1, dur: 3.2 },
  lean: { deg: 4, px: 8, dur: 0.5 },              // inclinar para o cursor
  pop: { squash: [1.06, 0.9], in: 0.09, stretch: [0.97, 1.06], out: 0.1, settle: 0.5 },
  jump: { crouch: [1.08, 0.88], crouchDur: 0.12, up: 0.26, down: 0.2, land: [1.1, 0.9], landDur: 0.08 },
  frame: 0.08,                                    // giro 360° e viradas: tempo por vista (70–90 ms)
  walk: { bob: 4, deg: 2, cycle: 0.22, from: 84, dur: 0.66 },
  travel: { dur: 0.62, arc: 0.9, debounce: 150 }, // arc = altura do salto em "alturas de cabeça"
  rise: 0.55, sink: 0.2, fade: 0.3,
  speech: { gap: 12000, hold: 4400 },
  hover: { dwell: 110, cooldown: 2500 },         // mouse parado no elemento (ms) e intervalo mínimo para repetir a mesma reação
  nudge: { after: 8000, max: 2 },                 // parada no topo: convite a clicar
  spinEvery: 4,                                   // a cada N cliques no topo: voltinha 360°
};

/* Um tipo de lugar = um enquadramento. `head` é a largura da cabeça na tela
   [celular, computador]; todo o resto do tamanho sai dela, então a personagem
   mantém a proporção ao trocar de conjunto de imagens.
   clip: algo esconde a cintura (ela fica atrás da borda do bloco). */
export const SPOTS = {
  caixa: { set: "gestos", clip: false, shadow: false, rest: "acenando" },
  palco: { set: "vistas", head: [44, 60], clip: false, shadow: true, rest: "frente" },
  mini: { set: "vistas", head: [27, 38], clip: false, shadow: true, rest: "frente" },
  "espiar-baixo": { set: "gestos", head: [42, 56], clip: true, shadow: false, rest: "acenando" },
  "espiar-lado": { set: "expressoes", head: [46, 60], clip: true, shadow: false, rest: "sorriso", tilt: 9 },
  sentada: { set: "sentada", head: [36, 48], clip: false, shadow: false, rest: "trabalhando" },
};

/* Nitidez (brief, seção 4): sem ampliação aprovada, a cabeça não passa do
   tamanho original dividido pela densidade da tela (até 2×). */
export function headFor(type, setHead) {
  const t = SPOTS[type];
  if (!t.head) return 0;
  const want = t.head[window.innerWidth >= BREAKPOINT ? 1 : 0];
  return Math.min(want, Math.floor(setHead / Math.min(window.devicePixelRatio || 1, 2)));
}
