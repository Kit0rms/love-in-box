/* Mascote · lugares dela na página.
   Cada seção (e o rodapé) declara no HTML:
     data-mascot-spot="tipo"      caixa | palco | mini | espiar-baixo | espiar-lado | sentada | none
     data-mascot-pose="acenando"  imagem com que ela chega (opcional)
     data-mascot-line="CHAVE"     fala de presença, chave de LINES em reactions.js (opcional)
     data-mascot-fx="brilhos"     elementos soltos ao chegar (opcional)
     data-mascot-act="olhar"      gesto de presença: "olhar" = vira de costas para ver as fotos
   e tem um <div class="mascot-slot"> no ponto do layout onde os pés (ou a
   cintura) dela ficam. A posição do slot é definida no CSS da seção.
   Não confundir com data-mascot / data-mascot-view, que são gatilhos de eventos. */

export function readSpots(root = document) {
  return [...root.querySelectorAll("[data-mascot-spot]")]
    .filter((el) => el.dataset.mascotSpot !== "none")
    .map((el) => ({
      el,
      type: el.dataset.mascotSpot,
      slot: el.querySelector(".mascot-slot"),
      pose: el.dataset.mascotPose || null,
      line: el.dataset.mascotLine || null,
      fx: el.dataset.mascotFx || null,
      act: el.dataset.mascotAct || null,
    }))
    .filter((s) => s.slot);
}
