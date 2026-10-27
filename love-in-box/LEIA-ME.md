# Love in Box: site (versão 1, MVP)

Site estático em HTML, CSS e JavaScript puro. Não precisa de servidor, banco de dados, build nem plano pago.
O plano completo (escopo, mapa do site, fluxos, stack, roadmap e pendências) está em `docs/PLANO.md`.

---

## 1. O que editar no dia a dia

| O que mudar | Arquivo |
|---|---|
| Produtos, preços, status, fotos, categorias e coleções | `assets/js/catalogo.js` |
| WhatsApp, Instagram, avisos do topo, selo de prévia | `assets/js/config.js` |

Salve o arquivo e publique de novo. Nenhum preço fica escrito nas páginas.

### Antes de divulgar (obrigatório)
1. Em `config.js`, preencha `whatsapp` com 55 + DDD + número, só dígitos (ex.: `"5573988887777"`).
   Enquanto estiver vazio, os botões mostram a mensagem pronta para copiar, em vez de abrir o WhatsApp.
2. Valide preços e status em `catalogo.js` (hoje marcados como provisórios, a partir do controle de 26/10/2026).
3. Quando tudo estiver validado, troque `modoPrevia: false` por `false`. Isso remove o selo "Prévia".

### Mudar preço ou status
```js
preco: 39.90,              // ou null quando não definido
precoTipo: "fixo",         // ou "a-partir-de"
status: "em-venda",        // em-venda | sob-encomenda | sem-estoque | em-estudo | em-desenvolvimento
```
- **em-venda / sob-encomenda:** o cliente pode adicionar à seleção e solicitar.
- **sem-estoque:** aparece com botão "Avise-me quando voltar".
- **em-estudo:** aparece sem preço, com botão "Tenho interesse" (desligue em `config.js` com `mostrarEmEstudo: false`).
- **em-desenvolvimento:** nunca aparece para o cliente.

### Colocar a foto real de um produto
1. Salve a foto em `assets/img/produtos/` (formato 4:5 vertical, idealmente 1080 × 1350 px, JPG até ~200 KB).
2. No produto, preencha `imagens`:
```js
imagens: [
  { src: "assets/img/produtos/caneca-colorida-1.jpg", alt: "Descrição curta do que aparece na foto" }
]
```
A segunda foto da lista aparece ao passar o mouse no card. Sem foto, o site mostra o espaço identificado como "foto em breve".

### Novo produto, categoria ou coleção
Copie um bloco existente em `catalogo.js` e troque os campos. O `id` precisa ser único, sem espaços nem acentos
(ex.: `caneca-dia-das-maes`). A página do produto passa a existir automaticamente em `produto.html#id-do-produto`.

---

## 2. Publicar de graça

### Vercel (recomendado)
1. Crie um repositório no GitHub e envie todos os arquivos desta pasta (o `index.html` fica na raiz).
2. Em vercel.com, **Add New → Project**, importe o repositório e clique em **Deploy** (sem configurar nada).
3. Cada alteração enviada ao GitHub publica sozinha. O domínio próprio entra em **Settings → Domains**.

### Netlify Drop (sem GitHub)
Abra app.netlify.com/drop e arraste a pasta inteira. Para atualizar, arraste de novo em **Deploys**.

### GitHub Pages
No repositório: **Settings → Pages**, branch `main`, pasta `/root`.

---

## 3. Estrutura

```
index.html            início
loja.html             todos os presentes, com busca e filtros (#categoria=, #colecao=, #ate=, #q=)
produto.html          página de produto (produto.html#id)
montar.html           montar do meu jeito (seleção de itens, sem prévia de caixa)
ajuda.html            ajuda para escolher (vira mensagem de WhatsApp)
personalizados.html   como personalizar
como-funciona.html    passo a passo, retirada/entrega e perguntas frequentes
pedido.html           solicitação (itens + detalhes → mensagem de WhatsApp)
privacidade.html      privacidade (texto para revisão jurídica)
design-system.html    mini design system (uso interno, não indexado)
assets/css/styles.css tokens e componentes
assets/js/config.js   configuração
assets/js/catalogo.js catálogo
assets/js/app.js      cabeçalho, rodapé, seleção, WhatsApp, efeitos
assets/js/pages.js    conteúdo dinâmico de cada página
assets/img/           marca (logo original), ícones oficiais, fotos
assets/video/         vídeo do topo (mp4 720p, mp4 1080p para desktop, webm)
docs/PLANO.md         plano do MVP e roadmap
```

---

## 4. O que é funcional e o que é previsto

**Funciona hoje:** navegação, busca e filtros, páginas de produto, seleção de itens (salva no aparelho),
formulários de solicitação e de ajuda, mensagem estruturada para o WhatsApp (abre direto quando o número
estiver configurado), estados de disponibilidade, vídeo com pausa, acessibilidade (teclado, leitores de tela,
movimento reduzido).

**Não existe nesta versão (por decisão de escopo):** checkout, pagamento, cálculo de frete, envio nacional,
montador com prévia da caixa e gerador de arte com IA.
