/* =========================================================================
   LOVE IN BOX · CONFIGURAÇÃO GERAL
   -------------------------------------------------------------------------
   Contato, textos de atendimento e chaves do site.
   Produtos, preços e disponibilidade NÃO ficam aqui: ficam em catalogo.js.
   Itens marcados com PENDENTE precisam de confirmação antes de publicar.
   ========================================================================= */

window.LIB_CONFIG = {

  /* WhatsApp oficial: só números, com 55 + DDD. (73) 9 9920-3842 */
  whatsapp: "5573999203842",

  /* Instagram oficial (link completo). PENDENTE — vazio esconde o link. */
  instagram: "",

  /* Domínio final, usado em links de compartilhamento. PENDENTE. */
  dominio: "",

  cidade: "Itabuna, Bahia",

  /* Mensagens da faixa do topo (giram a cada poucos segundos). */
  avisos: [
    "Retirada em Itabuna · entrega sob consulta",
    "Pedidos confirmados pelo WhatsApp",
    "Personalize com foto, nome, frase ou arte"
  ],

  /* Atendimento — PENDENTE: preencher horário real quando definido. */
  horarioAtendimento: "",

  /* Mostra produtos "em estudo" na loja (com selo e sem preço). */
  mostrarEmEstudo: true,

  /* Produtos "em desenvolvimento" nunca aparecem para o cliente. */
  mostrarEmDesenvolvimento: false,

  /* Selo discreto "Prévia" com a lista de pendências.
     Troque para false quando tudo estiver validado. */
  modoPrevia: false,

  pendencias: [
    "Validação de preços e disponibilidade na planilha",
    "Fotos reais dos produtos (hoje só a caneca branca tem fotos)",
    "Aprovação da tipografia",
    "Campos de personalização por produto",
    "Prazos e políticas de produção, retirada e entrega",
    "Instagram oficial e domínio",
    "Aprovação das coleções por ocasião (proposta)"
  ]
};
