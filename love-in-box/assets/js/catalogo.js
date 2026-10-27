/* =========================================================================
   LOVE IN BOX · CATÁLOGO
   -------------------------------------------------------------------------
   Fonte única de produtos, preços, disponibilidade, categorias e coleções.
   O layout lê tudo daqui: mudou aqui, muda no site inteiro.

   PREÇOS: lidos do controle de produtos de 26/10/2026. São PROVISÓRIOS
   (precoProvisorio: true) até a validação na planilha editável.

   COMO EDITAR UM PRODUTO
   - preco: número com ponto (39.90) ou null quando não definido.
   - precoTipo: "fixo" ou "a-partir-de".
   - status: um dos códigos de STATUS abaixo.
   - imagens: lista de fotos em assets/img/produtos/. Lista vazia = o site
     mostra um espaço identificado como "foto em breve".
   - destaque: true coloca o produto na vitrine da página inicial.
   ========================================================================= */

window.LIB_CATALOGO = {

  atualizadoEm: "2026-10-26",

  /* ---------------- STATUS ----------------
     pedido: o que o botão principal faz
       "selecao"  → entra na seleção e segue para a solicitação
       "aviso"    → abre conversa para avisar quando estiver disponível
       "interesse"→ registra interesse pelo WhatsApp
       null       → não aparece para o cliente                           */
  status: {
    "em-venda":           { rotulo: "Em venda",           pedido: "selecao",   visivel: true },
    "sob-encomenda":      { rotulo: "Sob encomenda",      pedido: "selecao",   visivel: true },
    "sem-estoque":        { rotulo: "Sem estoque",        pedido: "aviso",     visivel: true },
    "em-estudo":          { rotulo: "Em estudo",          pedido: "interesse", visivel: true },
    "em-desenvolvimento": { rotulo: "Em desenvolvimento", pedido: null,        visivel: false }
  },

  /* ---------------- CATEGORIAS (tipo de produto) ---------------- */
  categorias: [
    { id: "canecas", nome: "Canecas", icone: "mug",
      resumo: "Personalizadas com foto, nome, frase ou arte." , subcategorias: [] },
    { id: "fotos-e-lembrancas", nome: "Fotos e lembranças", icone: "heart",
      resumo: "Momentos impressos para guardar e presentear.", subcategorias: [] },
    { id: "boxes-e-kits", nome: "Boxes e kits", icone: "bow",
      resumo: "Presentes montados e embalados para entregar.", subcategorias: [] },
    { id: "complementos", nome: "Complementos", icone: "bean",
      resumo: "Para completar o presente.",
      subcategorias: [
        { id: "cafe-e-cha", nome: "Café e chá" },
        { id: "papelaria",  nome: "Papelaria" }
      ] }
  ],

  /* ---------------- COLEÇÕES (tema, ocasião ou campanha) ----------------
     PROPOSTA para aprovação: agrupam produtos já cadastrados.            */
  colecoes: [
    { id: "para-quem-ama-cafe", nome: "Para quem ama café", tipo: "tema", icone: "bean",
      resumo: "Caneca, cafeteira e os detalhes do café de todo dia.",
      produtos: ["caneca-branca", "caneca-colorida", "cafeteira-francesa", "colher-inox", "mixer", "caneca-magica"] },
    { id: "cha-e-aconchego", nome: "Chá e aconchego", tipo: "tema", icone: "sparkle",
      resumo: "Para quem prefere uma xícara quente no fim do dia.",
      produtos: ["infusor-cha", "infusor-chaleira", "caneca-colorida", "caneca-branca"] },
    { id: "lembrancas-com-foto", nome: "Lembranças com foto", tipo: "tema", icone: "heart",
      resumo: "Fotos de vocês transformadas em presente.",
      produtos: ["kit-fotos-imantadas", "caneca-branca", "caneca-colorida", "box-personalizada"] },
    { id: "aniversario", nome: "Aniversário", tipo: "ocasiao", icone: "bow",
      resumo: "Presentes personalizados com cara de festa.",
      produtos: ["box-personalizada", "caneca-branca", "kit-fotos-imantadas", "caneca-colorida"] }
  ],

  /* ---------------- PRODUTOS ---------------- */
  produtos: [
    {
      id: "caneca-branca",
      nome: "Caneca branca personalizada",
      categoria: "canecas", subcategoria: null,
      status: "em-venda",
      preco: 39.90, precoTipo: "fixo", precoProvisorio: true,
      resumo: "A clássica da Love in Box: caneca branca com a foto, o nome, a frase ou a arte que você escolher.",
      personalizacao: ["Foto", "Nome", "Frase", "Arte pronta"], personalizacaoProvisoria: true,
      imagens: [
        { src: "assets/img/produtos/caneca-branca-1.jpg", alt: "Mão segurando caneca branca com ilustrações de um gato preto e branco e as frases meu gatinho e fofinho" },
        { src: "assets/img/produtos/caneca-branca-2.jpg", alt: "Lateral da caneca branca com ilustração do gato sentado e a frase meu gato" },
        { src: "assets/img/produtos/caneca-branca-3.jpg", alt: "Lateral da caneca branca com o gato de língua de fora e a frase fofinho" }
      ],
      destaque: true, ordem: 1
    },
    {
      id: "caneca-colorida",
      nome: "Caneca com interior e alça coloridos",
      categoria: "canecas", subcategoria: null,
      status: "em-venda",
      preco: 49.90, precoTipo: "fixo", precoProvisorio: true,
      resumo: "Caneca personalizada com o interior e a alça em cor. As cores disponíveis são confirmadas no atendimento.",
      personalizacao: ["Foto", "Nome", "Frase", "Arte pronta"], personalizacaoProvisoria: true,
      variantes: [], /* PENDENTE: cores disponíveis */
      imagens: [],
      destaque: true, ordem: 2
    },
    {
      id: "caneca-magica",
      nome: "Caneca mágica",
      categoria: "canecas", subcategoria: null,
      status: "sem-estoque",
      preco: 59.90, precoTipo: "fixo", precoProvisorio: true,
      resumo: "A personalização aparece quando a bebida quente entra na caneca.",
      personalizacao: ["Foto", "Nome", "Frase"], personalizacaoProvisoria: true,
      imagens: [],
      destaque: false, ordem: 3
    },
    {
      id: "caneca-3d-tematica",
      nome: "Caneca 3D temática",
      categoria: "canecas", subcategoria: null,
      status: "em-estudo",
      preco: 39.90, precoTipo: "fixo", precoProvisorio: true,
      resumo: "Modelo em estudo. Ainda não está disponível para pedido.",
      personalizacao: [],
      imagens: [],
      destaque: false, ordem: 4
    },
    {
      id: "kit-fotos-imantadas",
      nome: "Kit 9 fotos imantadas estilo Instax",
      categoria: "fotos-e-lembrancas", subcategoria: null,
      status: "em-venda",
      preco: 29.90, precoTipo: "fixo", precoProvisorio: true,
      resumo: "Nove fotos suas no formato pequeno de foto instantânea, com ímã.",
      personalizacao: ["9 fotos"], personalizacaoProvisoria: true,
      imagens: [],
      destaque: true, ordem: 5
    },
    {
      id: "box-personalizada",
      nome: "Box presenteável personalizada",
      categoria: "boxes-e-kits", subcategoria: null,
      status: "sob-encomenda",
      preco: 69.90, precoTipo: "a-partir-de", precoProvisorio: true,
      resumo: "Presente montado sob encomenda na caixa Love in Box. Os itens e a personalização são combinados no atendimento.",
      personalizacao: ["Itens da box", "Foto", "Nome", "Mensagem"], personalizacaoProvisoria: true,
      imagens: [],
      destaque: true, ordem: 6
    },
    {
      id: "cafeteira-francesa",
      nome: "Cafeteira francesa",
      categoria: "complementos", subcategoria: "cafe-e-cha",
      status: "em-venda",
      preco: 20.90, precoTipo: "fixo", precoProvisorio: true,
      resumo: "Para passar o café na hora e completar o presente.",
      personalizacao: [],
      imagens: [],
      destaque: false, ordem: 7
    },
    {
      id: "infusor-chaleira",
      nome: "Infusor chaleira",
      categoria: "complementos", subcategoria: "cafe-e-cha",
      status: "em-venda",
      preco: 20.90, precoTipo: "fixo", precoProvisorio: true,
      resumo: "Infusor em formato de chaleira para preparar chá direto na caneca.",
      personalizacao: [],
      imagens: [],
      destaque: false, ordem: 8
    },
    {
      id: "infusor-cha",
      nome: "Infusor de chá",
      categoria: "complementos", subcategoria: "cafe-e-cha",
      status: "em-venda",
      preco: 12.90, precoTipo: "fixo", precoProvisorio: true,
      resumo: "Para preparar chá em folhas direto na caneca.",
      personalizacao: [],
      imagens: [],
      destaque: false, ordem: 9
    },
    {
      id: "mixer",
      nome: "Mixer",
      categoria: "complementos", subcategoria: "cafe-e-cha",
      status: "em-venda",
      preco: 14.90, precoTipo: "fixo", precoProvisorio: true,
      resumo: "Para misturar a bebida direto na caneca.",
      personalizacao: [],
      imagens: [],
      destaque: false, ordem: 10
    },
    {
      id: "colher-inox",
      nome: "Colher de aço inox",
      categoria: "complementos", subcategoria: "cafe-e-cha",
      status: "em-venda",
      preco: 12.90, precoTipo: "fixo", precoProvisorio: true,
      resumo: "Colher para acompanhar a caneca.",
      personalizacao: [],
      imagens: [],
      destaque: false, ordem: 11
    },
    {
      id: "caneta",
      nome: "Caneta",
      categoria: "complementos", subcategoria: "papelaria",
      status: "em-venda",
      preco: 12.90, precoTipo: "fixo", precoProvisorio: true,
      resumo: "Um detalhe a mais para completar o presente.",
      personalizacao: [],
      imagens: [],
      destaque: false, ordem: 12
    },

    /* ---- EM DESENVOLVIMENTO: não aparecem no site. Sem preço, foto ou
            descrição até a definição oficial. ---- */
    { id: "love-scoop-mini",      nome: "Love Scoop Mini",           categoria: "boxes-e-kits",      status: "em-desenvolvimento", preco: null, imagens: [] },
    { id: "love-scoop-cafe",      nome: "Love Scoop Café",           categoria: "boxes-e-kits",      status: "em-desenvolvimento", preco: null, imagens: [] },
    { id: "love-scoop-premium",   nome: "Love Scoop Premium",        categoria: "boxes-e-kits",      status: "em-desenvolvimento", preco: null, imagens: [] },
    { id: "box-criar",            nome: "Box Criar",                 categoria: "boxes-e-kits",      status: "em-desenvolvimento", preco: null, imagens: [] },
    { id: "box-lanchinho",        nome: "Box Lanchinho & Diversão",  categoria: "boxes-e-kits",      status: "em-desenvolvimento", preco: null, imagens: [] },
    { id: "box-meu-dia-especial", nome: "Box Meu Dia Especial",      categoria: "boxes-e-kits",      status: "em-desenvolvimento", preco: null, imagens: [] },
    { id: "livrinho-12-detalhes", nome: "Livrinho 12 Detalhes",      categoria: "fotos-e-lembrancas", status: "em-desenvolvimento", preco: null, imagens: [] }
  ]
};
