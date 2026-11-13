/* Mascote Love in Box · falas e reações
   -------------------------------------------------------------------------
   A Ster edita só este arquivo. Regras (docs/mascote-brief.md):
   - cada fala aparece uma vez por visita, e no máximo uma a cada ~12 s;
   - o clique da pessoa tem preferência sobre todo o resto;
   - nada aqui pode afirmar que um pedido foi concluído.

   Poses disponíveis
   gestos (cintura para cima): acenando, vitoria, com-caneca, joinha, coracao,
     selfie, com-livros, ouvindo-musica
   expressões (busto): sorriso, seria, pensativa, surpresa, animada, confiante,
     curiosa, apaixonada, divertida
   Onde ela está de corpo inteiro (ao lado de um título), a reação vira
   movimento do corpo (pulinho, virada), porque gesto de cintura para cima só
   pode aparecer com algo escondendo a cintura.

   fx: "coracoes" | "brilhos" | "duvida" | null  (elementos soltos em volta dela) */

/* ---------- falas de presença: o que ela diz ao chegar em cada seção ---------- */
export const LINES = {
  WELCOME: "Opa! Chegou por aqui? 💛",
  CATEGORIAS: "Escolhe por aqui!",
  PERSONALIZADOS: "Bora criar algo com a sua cara?",
  PASSOS: "É simples, olha só.",
  RODAPE: "Volta sempre!",
  VOLTINHA: "Gostou do look?",
  CONVITE: "Ei, sabia que pode clicar em mim?",
};

/* ---------- clique nela: ciclo de gestos (com fala na primeira vez) ---------- */
export const CLICK_CYCLE = [
  { pose: "coracao", fx: "coracoes", message: "Você é um cliente especial" },
  { pose: "vitoria", fx: "brilhos", message: "Feliz em ter você aqui" },
  { pose: "com-caneca", fx: null, message: "Um cafezinho fica ainda melhor assim!" },
  { pose: "joinha", fx: "brilhos", message: "Eita! Me chamou?" },
];
// Onde ela aparece só de busto (espiando de lado), o clique alterna expressões.
export const CLICK_FACES = ["surpresa", "divertida", "apaixonada", "animada"];

/* ---------- loja: só o rosto dela, em avatar, acima das categorias ----------
   Aqui valem apenas as expressões (busto). pose: expressão; fx: elementos soltos;
   message: fala que fica no balão até a próxima (sem fala = o balão não muda);
   ms: quanto tempo fica na expressão antes de voltar ao sorriso;
   cooldown: tempo mínimo (ms) para repetir. Na loja a fala acompanha a ação:
   aparece toda vez, não só uma vez por visita. */
export const LOJA = {
  REST: "sorriso",
  ENTRADA: { pose: "sorriso", ms: 2600, fx: null, message: "Escolha uma categoria ou busque pelo nome." },
  "CAT:": { pose: "sorriso", ms: 1600, fx: "brilhos", message: "Escolha uma categoria ou busque pelo nome." },
  "CAT:canecas": { pose: "pensativa", ms: 2600, fx: "duvida", message: "Hmmm, qual será a caneca selecionada, hein?" },
  "CAT:fotos-e-lembrancas": { pose: "animada", ms: 2600, fx: "brilhos", message: "Aaah, que legal! Escolha suas fotos favoritas" },
  "CAT:boxes-e-kits": { pose: "apaixonada", ms: 2600, fx: "coracoes", message: "Você vai se apaixonar pelos nossos Box & Kits" },
  "CAT:complementos": { pose: "confiante", ms: 2400, fx: null, message: "Conheça nossos complementos" },
  BUSCA: { pose: "curiosa", ms: 2400, fx: "duvida", message: "O que você procura?" },
  FILTRO: { pose: "pensativa", ms: 2000, fx: null, message: null },
  LIMPAR: { pose: "sorriso", ms: 1400, fx: null, message: "Escolha uma categoria ou busque pelo nome." },
  VAZIO: { pose: "surpresa", ms: 3200, fx: null, message: "Ops! Não achei nada assim." },
  PRODUTO: { pose: "curiosa", ms: 1500, fx: null, message: null, cooldown: 2500 },
  ADICIONOU: { pose: "apaixonada", ms: 2600, fx: "coracoes", message: "Amei sua escolha!" },
};

/* ---------- reações a ações na página ----------
   pose:     imagem mostrada enquanto reage (gesto ou expressão)
   ms:       quanto tempo fica nela antes de voltar
   motion:   "jump" (pulinho) | "tilt" (inclina) | "wave" (acena) | "pop" (susto leve)
   priority: maior interrompe menor
   cooldown: tempo mínimo (ms) para repetir */
export const REACTIONS = {
  /* ligadas a ações reais da página inicial */
  PRODUCT_VIEW: { pose: "curiosa", ms: 2600, motion: "tilt", fx: "duvida", message: "Esse tem potencial de presentão!", priority: 2, cooldown: 30000 },
  "CATEGORY_VIEW:personalizados": { pose: "pensativa", ms: 2800, motion: "tilt", fx: null, message: "Bora criar algo com a sua cara?", priority: 2, cooldown: 45000 },
  "CATEGORY_VIEW:canecas": { pose: "com-caneca", ms: 2800, motion: "pop", fx: null, message: "Um cafezinho fica ainda melhor assim!", priority: 2, cooldown: 45000 },
  "CATEGORY_VIEW:boxes-e-kits": { pose: "animada", ms: 2400, motion: "pop", fx: "brilhos", message: null, priority: 2, cooldown: 45000 },
  WHATSAPP_CONTACT: { pose: "joinha", ms: 2400, motion: "jump", fx: null, message: null, priority: 3, cooldown: 6000 },
  FAQ_OPEN: { pose: "curiosa", ms: 2200, motion: "tilt", fx: "duvida", message: null, priority: 2, cooldown: 1500 },
  FAQ_CLOSE: { pose: "sorriso", ms: 1400, motion: "pop", fx: null, message: null, priority: 2, cooldown: 1500 },
  "CATEGORY_VIEW:fotos-e-lembrancas": { pose: "apaixonada", ms: 2400, motion: "tilt", fx: "coracoes", message: null, priority: 2, cooldown: 45000 },
  "CATEGORY_VIEW:complementos": { pose: "confiante", ms: 2200, motion: "pop", fx: null, message: null, priority: 2, cooldown: 45000 },

  /* passar o mouse (ou focar) num elemento: uma reação para cada tipo de elemento.
     Sem fala: no mouse ela só se mexe, troca de pose e solta os elementos.
     Ela inclina para o lado em que o elemento está. Só reage se estiver na tela. */
  HOVER_PRESENTES: { pose: "animada", ms: 1800, motion: "pop", fx: "brilhos", message: null, priority: 1, cooldown: 4000 },
  HOVER_FOTO: { pose: "apaixonada", ms: 1900, motion: "tilt", fx: "coracoes", message: null, priority: 1, cooldown: 4000 },
  HOVER_MONTAR: { pose: "confiante", ms: 1800, motion: "pop", fx: "brilhos", message: null, priority: 1, cooldown: 4000 },
  HOVER_PASSO: { pose: "confiante", ms: 1200, motion: "jump", fx: null, message: null, priority: 1, cooldown: 1500 },
  HOVER_PASSOS: { pose: "confiante", ms: 1800, motion: "tilt", fx: null, message: null, priority: 1, cooldown: 4000 },
  HOVER_FAQ: { pose: "curiosa", ms: 1600, motion: "tilt", fx: "duvida", message: null, priority: 1, cooldown: 2500 },
  HOVER_AJUDA: { pose: "pensativa", ms: 1800, motion: "tilt", fx: "duvida", message: null, priority: 1, cooldown: 4000 },
  HOVER_WHATSAPP: { pose: "joinha", ms: 1900, motion: "jump", fx: "coracoes", message: null, priority: 1, cooldown: 4000 },
  HOVER_RODAPE: { pose: "acenando", ms: 1800, motion: "wave", fx: null, message: null, priority: 1, cooldown: 5000 },
  HOVER_ESCONDER: { pose: "surpresa", ms: 1800, motion: "pop", fx: null, message: null, priority: 1, cooldown: 5000 },

  /* preparadas: carrinho, formulário e envio do pedido ainda não existem no
     site novo. Quando existirem, basta disparar o evento (ver mascot-assistant.js). */
  ADD_TO_CART: { pose: "vitoria", ms: 2600, motion: "jump", fx: "brilhos", message: "Amei sua escolha!", priority: 3, cooldown: 1500 },
  CART_EMPTY: { pose: "pensativa", ms: 2800, motion: "tilt", fx: null, message: "Ainda procurando o presente perfeito?", priority: 2, cooldown: 60000 },
  WHATSAPP_CHECKOUT: { pose: "acenando", ms: 2600, motion: "wave", fx: "coracoes", message: "Partiu preparar esse presente!", priority: 4, cooldown: 3000 },
  FORM_ERROR: { pose: "surpresa", ms: 2400, motion: "pop", fx: null, message: "Ops! Vamos tentar de novo?", priority: 4, cooldown: 4000 },
};
