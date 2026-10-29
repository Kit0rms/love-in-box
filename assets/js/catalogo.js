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

  atualizadoEm: "2026-10-29",

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
    { id: "boxes-e-kits", nome: "Boxes e kits", icone: "bow", capa: "kit-momento-cafe",
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
      produtos: ["kit-momento-cafe", "caneca-branca", "caneca-colorida", "cafeteira-francesa", "colher-inox", "mixer"] },
    { id: "cha-e-aconchego", nome: "Chá e aconchego", tipo: "tema", icone: "sparkle",
      resumo: "Para quem prefere uma xícara quente no fim do dia.",
      produtos: ["infusor-cha", "infusor-chaleira", "caneca-colorida", "caneca-branca"] },
    { id: "lembrancas-com-foto", nome: "Lembranças com foto", tipo: "tema", icone: "heart",
      resumo: "Fotos de vocês transformadas em presente.",
      produtos: ["kit-memorias", "kit-fotos-imantadas", "caneca-branca", "box-personalizada"] },
    { id: "aniversario", nome: "Aniversário", tipo: "ocasiao", icone: "bow",
      resumo: "Presentes personalizados com cara de festa.",
      produtos: ["kit-irmas-do-coracao", "kit-novo-ciclo", "kit-momento-cafe", "kit-memorias"] }
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
        { src: "assets/img/produtos/caneca-branca-1.webp", alt: "Caneca branca com ilustrações de um gato preto e branco e as frases meu gato e cadê meu gato, sobre fundo bege" },
        { src: "assets/img/produtos/caneca-branca-2.webp", alt: "Caneca branca vista de frente com o gato sentado, o gato deitado e a frase meu gato" },
        { src: "assets/img/produtos/caneca-branca-3.webp", alt: "Caneca branca com o gato de língua de fora e as frases meu gatinho cinho e fofinho" }
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
      imagens: [
        { src: "assets/img/produtos/caneca-colorida-1.webp", alt: "Caneca branca com interior e alça vermelhos e frase pequena impressa" },
        { src: "assets/img/produtos/caneca-colorida-2.webp", alt: "Caneca branca com interior rosa, colher rosa e frase impressa" }
      ],
      destaque: false, ordem: 2
    },
    {
      id: "caneca-magica",
      nome: "Caneca mágica",
      categoria: "canecas", subcategoria: null,
      status: "sem-estoque",
      preco: 59.90, precoTipo: "fixo", precoProvisorio: true,
      resumo: "A personalização aparece quando a bebida quente entra na caneca.",
      personalizacao: ["Foto", "Nome", "Frase"], personalizacaoProvisoria: true,
      imagens: [
        { src: "assets/img/produtos/caneca-magica-e1.webp", alt: "Duas canecas mágicas lado a lado: uma preta fechada e outra com a arte de rosas e a frase seja amor por onde você for revelada" }
      ],
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
      imagens: [
        { src: "assets/img/produtos/caneca-3d-tematica-e1.webp", alt: "Caneca 3D em formato de capivara, cor caramelo, sobre fundo bege" },
        { src: "assets/img/produtos/caneca-3d-tematica-e2.webp", alt: "Caneca 3D preta em formato de caldeirão com brasão dourado" }
      ],
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
      imagens: [
        { src: "assets/img/produtos/kit-fotos-imantadas-1.webp", alt: "Fotos em formato de foto instantânea espalhadas ao lado de uma sacola Love in Box" },
        { src: "assets/img/produtos/kit-fotos-imantadas-2.webp", alt: "Fotos instantâneas de casais, família, bebê e cachorro sobre mesa bege" },
        { src: "assets/img/produtos/kit-fotos-imantadas-3.webp", alt: "Várias fotos instantâneas com moldura branca e pequenos detalhes coloridos" }
      ],
      destaque: false, ordem: 5
    },
    {
      id: "box-personalizada",
      nome: "Box presenteável personalizada",
      categoria: "boxes-e-kits", subcategoria: null,
      status: "sob-encomenda",
      preco: 69.90, precoTipo: "a-partir-de", precoProvisorio: true,
      resumo: "Presente montado sob encomenda na caixa Love in Box. Os itens e a personalização são combinados no atendimento.",
      personalizacao: ["Itens da box", "Foto", "Nome", "Mensagem"], personalizacaoProvisoria: true,
      imagens: [
        { src: "assets/img/produtos/box-personalizada-1.webp", alt: "Box de papel kraft aberta com caneca Com amor para você, café, bombons e itens de presente" }
      ],
      destaque: false, ordem: 6
    },
    {
      id: "kit-momento-cafe",
      nome: "Kit Momento Café",
      categoria: "boxes-e-kits", subcategoria: null,
      status: "em-venda",
      preco: 119.90, precoTipo: "fixo", precoProvisorio: true,
      resumo: "Caneca personalizada + prensa francesa 325 ml + colher inox + café gourmet 3 Corações + box pronta para presentear.",
      personalizacao: ["Letra, nome ou arte da caneca", "Mensagem do cartão"], personalizacaoProvisoria: true,
      imagens: [
        { src: "assets/img/produtos/kit-momento-cafe-1.webp", alt: "Kit Momento Café na box Love in Box com caneca com inicial A, prensa francesa, colher dourada, café gourmet e cartão de aniversário" }
      ],
      destaque: true, ordem: 6.5
    },
    {
      id: "kit-memorias",
      nome: "Kit Memórias",
      categoria: "boxes-e-kits", subcategoria: null,
      status: "em-venda",
      preco: 79.90, precoTipo: "fixo", precoProvisorio: true,
      resumo: "Caneca personalizada + 1 drip coffee ou 1 cappuccino 3 Corações + 2 tabletes pequenos de chocolate + 9 fotos estilo Instax + colher de aço inox + box pronta para presentear.",
      personalizacao: ["Arte ou frase da caneca", "9 fotos", "Escolha: drip coffee ou cappuccino"], personalizacaoProvisoria: true,
      imagens: [
        { src: "assets/img/produtos/kit-memorias-1.webp", alt: "Kit Memórias na box Love in Box com café drip, bombons, fotos instantâneas, colher dourada e caneca com versículo" }
      ],
      destaque: false, ordem: 6.6
    },
    {
      id: "kit-irmas-do-coracao",
      nome: "Kit Irmãs do Coração",
      categoria: "boxes-e-kits", subcategoria: null,
      status: "em-venda",
      preco: 69.90, precoTipo: "fixo", precoProvisorio: true,
      resumo: "Caneca personalizada de 325 ml com interior e alça amarelos + Ferrero Rocher com 3 unidades ou chocolate conforme disponibilidade + balão metalizado de coração + tag de parabéns + sacola decorada com papel de seda e laço de cetim dourado, pronta para presentear.",
      personalizacao: ["Arte ou frase da caneca", "Mensagem da tag"], personalizacaoProvisoria: true,
      imagens: [
        { src: "assets/img/produtos/kit-irmas-do-coracao-1.webp", alt: "Kit Irmãs do Coração: sacola Love in Box com papel de seda, laço dourado e tag de parabéns, caneca com interior e alça amarelos, Ferrero Rocher e balão de coração dourado" }
      ],
      destaque: true, ordem: 6.7
    },
    {
      id: "kit-novo-ciclo",
      nome: "Kit Novo Ciclo",
      categoria: "boxes-e-kits", subcategoria: null,
      status: "em-venda",
      preco: 49.90, precoTipo: "fixo", precoProvisorio: true,
      resumo: "Caneca branca personalizada de 325 ml com frase de felicitação + balão metalizado de coração dourado + laço de cetim dourado feito à mão + sacola decorada com papel de seda, pronta para presentear.",
      personalizacao: ["Frase da caneca"], personalizacaoProvisoria: true,
      imagens: [
        { src: "assets/img/produtos/kit-novo-ciclo-1.webp", alt: "Kit Novo Ciclo: sacola Love in Box com papel de seda, caneca branca com frase de felicitação, laço dourado e balão de coração dourado" }
      ],
      destaque: true, ordem: 6.8
    },
    {
      id: "cafeteira-francesa",
      nome: "Cafeteira francesa",
      categoria: "complementos", subcategoria: "cafe-e-cha",
      status: "em-venda",
      preco: 20.90, precoTipo: "fixo", precoProvisorio: true,
      resumo: "Para passar o café na hora e completar o presente.",
      personalizacao: [],
      imagens: [
        { src: "assets/img/produtos/cafeteira-francesa-e1.webp", alt: "Cafeteira francesa de vidro com estrutura preta sobre fundo bege" }
      ],
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
      imagens: [
        { src: "assets/img/produtos/infusor-chaleira-e1.webp", alt: "Chaleira de vidro com infusor de inox e chá dentro, sobre fundo bege" }
      ],
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
      imagens: [
        { src: "assets/img/produtos/infusor-cha-e1.webp", alt: "Quatro infusores de chá de inox em formato de coração, com cabo de coração vazado, sobre fundo bege" }
      ],
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
      imagens: [
        { src: "assets/img/produtos/mixer-1.webp", alt: "Mixer elétrico rosa com haste de inox" },
        { src: "assets/img/produtos/mixer-2.webp", alt: "Kit com dois mixers elétricos, preto e verde, na embalagem" },
        { src: "assets/img/produtos/mixer-3.webp", alt: "Mixer elétrico rosa visto de cima" }
      ],
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
      imagens: [
        { src: "assets/img/produtos/colher-inox-e1.webp", alt: "Quatro colheres douradas, duas com ponta em coração e duas em formato de flor, sobre fundo bege" }
      ],
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
      imagens: [
        { src: "assets/img/produtos/caneta-1.webp", alt: "Quatro canetas em tons de marrom e bege seguradas na mão" },
        { src: "assets/img/produtos/caneta-2.webp", alt: "Canetas marrons e bege com detalhe de xícara" },
        { src: "assets/img/produtos/caneta-3.webp", alt: "Canetas em tons de marrom abertas na palma da mão" }
      ],
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
