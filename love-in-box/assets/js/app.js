/* =========================================================================
   LOVE IN BOX · NÚCLEO DO SITE
   Cabeçalho, rodapé, seleção de itens, mensagem de WhatsApp, cards de
   produto e efeitos. Os dados vêm de config.js e catalogo.js.
   ========================================================================= */
(function () {
  "use strict";

  var CFG = window.LIB_CONFIG || {};
  var CAT = window.LIB_CATALOGO || { produtos: [], categorias: [], colecoes: [], status: {} };
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- utilidades ---------------- */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  var brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
  function money(v) { return brl.format(v).replace(/ /g, " "); }

  function params() {
    var p = new URLSearchParams(location.search);
    var h = location.hash.replace(/^#/, "");
    if (h) {
      if (h.indexOf("=") > -1) new URLSearchParams(h).forEach(function (v, k) { p.set(k, v); });
      else p.set("_", decodeURIComponent(h));
    }
    return p;
  }

  /* ---------------- ícones de interface ---------------- */
  var I = {
    menu: '<path d="M4 7h16M4 12h16M4 17h10"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/>',
    box: '<path d="M4 9h16v10a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19z"/><path d="M3 6h18v3H3zM12 6v14.5"/><path d="M12 6c-1.5-2.5-5-3-5-1s3.5 1 5 1c1.5 0 5 1 5-1s-3.5-1.5-5 1z"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    arrowL: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    down: '<path d="m6 9 6 6 6-6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    play: '<path d="M8 5.5v13l11-6.5z" fill="currentColor" stroke="none"/>',
    pause: '<path d="M8 5h3v14H8zM13 5h3v14h-3z" fill="currentColor" stroke="none"/>',
    chat: '<path d="M4 18.5 5.3 15A7.5 7.5 0 1 1 9 18.2z"/>',
    pin: '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
    clock: '<circle cx="12" cy="12" r="8"/><path d="M12 7.5V12l3 2"/>',
    brush: '<path d="M14.5 4.5 19.5 9.5 11 18l-5-5z"/><path d="M6 13c-2 0-3 1.5-3 3.5 0 1.3-.6 2.3-1 2.5 3 .5 6-.5 6.5-3"/>',
    copy: '<rect x="8" y="8" width="11" height="12" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h8"/>',
    filter: '<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>'
  };
  function icon(n, cls) {
    return '<svg class="' + (cls || "") + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + (I[n] || "") + "</svg>";
  }

  /* ---------------- catálogo ---------------- */
  function statusOf(p) { return CAT.status[p.status] || { rotulo: p.status, pedido: null, visivel: false }; }
  function isVisible(p) {
    if (p.status === "em-desenvolvimento") return !!CFG.mostrarEmDesenvolvimento;
    if (p.status === "em-estudo") return CFG.mostrarEmEstudo !== false;
    return statusOf(p).visivel;
  }
  function products() {
    return CAT.produtos.filter(isVisible).slice().sort(function (a, b) { return (a.ordem || 99) - (b.ordem || 99); });
  }
  function product(id) {
    for (var i = 0; i < CAT.produtos.length; i++) if (CAT.produtos[i].id === id) return CAT.produtos[i];
    return null;
  }
  function category(id) { return CAT.categorias.filter(function (c) { return c.id === id; })[0] || null; }
  function subcategory(cid, sid) {
    var c = category(cid); if (!c || !c.subcategorias) return null;
    return c.subcategorias.filter(function (s) { return s.id === sid; })[0] || null;
  }
  function collection(id) { return CAT.colecoes.filter(function (c) { return c.id === id; })[0] || null; }
  function canOrder(p) { return statusOf(p).pedido === "selecao"; }
  function iconFor(p) { var c = category(p.categoria); return (c && c.icone) || "sparkle"; }

  function priceText(p) {
    if (p.status === "em-estudo") return "Ainda sem preço";
    if (p.preco == null) return "Sob consulta";
    return (p.precoTipo === "a-partir-de" ? "a partir de " : "") + money(p.preco);
  }
  function priceHTML(p) {
    if (p.status === "em-estudo") return '<span class="price muted">Ainda sem preço</span>';
    if (p.preco == null) return '<span class="price">Sob consulta</span>';
    return '<span class="price">' + (p.precoTipo === "a-partir-de" ? "<small>a partir de </small>" : "") + money(p.preco) + "</span>";
  }

  function placeholder(p, withNote) {
    return '<div class="ph"><img src="assets/img/icons/' + iconFor(p) + '.png" alt="" width="256" height="256" loading="lazy">' +
      (withNote === false ? "" : '<span class="ph-note">foto em breve</span>') + "</div>";
  }

  function card(p) {
    var imgs = p.imagens || [];
    var media;
    if (imgs.length) {
      media = '<img class="ph-img" src="' + esc(imgs[0].src) + '" alt="' + esc(imgs[0].alt) + '" loading="lazy" width="1080" height="1350">' +
        (imgs[1] ? '<img class="ph-img2" src="' + esc(imgs[1].src) + '" alt="" loading="lazy" width="1080" height="1350">' : "");
    } else {
      media = placeholder(p);
    }
    var add = canOrder(p)
      ? '<button class="add" type="button" data-add="' + esc(p.id) + '" aria-label="Adicionar ' + esc(p.nome) + ' à seleção">' + icon("plus") + "</button>"
      : "";
    return '<article class="pcard" data-rv>' +
      '<div class="pcard-media' + (imgs[1] ? " has-2" : "") + '">' + media + "</div>" +
      '<span class="badge" data-status="' + esc(p.status) + '">' + esc(statusOf(p).rotulo) + "</span>" +
      '<div class="pcard-body">' +
        '<a class="pcard-name" href="produto.html#' + esc(p.id) + '">' + esc(p.nome) + "</a>" +
        '<p class="pcard-sum">' + esc(p.resumo || "") + "</p>" +
        '<div class="pcard-foot">' + priceHTML(p) + add + "</div>" +
      "</div></article>";
  }

  /* ---------------- armazenamento (tolerante a falhas) ---------------- */
  var mem = {};
  function load(k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return mem[k] || d; } }
  function save(k, v) { mem[k] = v; try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sem armazenamento: segue em memória */ } }

  /* ---------------- seleção ---------------- */
  var KEY = "lib-selecao-v1";
  var Sel = {
    items: function () {
      return (load(KEY, []) || []).filter(function (it) { var p = product(it.id); return p && canOrder(p) && it.qty > 0; });
    },
    set: function (items) { save(KEY, items); Sel.emit(); },
    add: function (id, qty) {
      var items = Sel.items(), found = false;
      items.forEach(function (it) { if (it.id === id) { it.qty = Math.min(20, it.qty + (qty || 1)); found = true; } });
      if (!found) items.push({ id: id, qty: qty || 1 });
      Sel.set(items);
    },
    qty: function (id, q) {
      var items = Sel.items().map(function (it) { if (it.id === id) it.qty = Math.max(0, Math.min(20, q)); return it; })
        .filter(function (it) { return it.qty > 0; });
      Sel.set(items);
    },
    remove: function (id) { Sel.set(Sel.items().filter(function (it) { return it.id !== id; })); },
    has: function (id) { return Sel.items().some(function (it) { return it.id === id; }); },
    count: function () { return Sel.items().reduce(function (s, it) { return s + it.qty; }, 0); },
    total: function () {
      var t = 0, plus = false;
      Sel.items().forEach(function (it) {
        var p = product(it.id);
        if (p.preco == null) { plus = true; return; }
        if (p.precoTipo === "a-partir-de") plus = true;
        t += p.preco * it.qty;
      });
      return { valor: t, aPartir: plus };
    },
    emit: function () { document.dispatchEvent(new CustomEvent("lib:selecao")); }
  };

  /* ---------------- WhatsApp ---------------- */
  function waNumber() { return String(CFG.whatsapp || "").replace(/\D/g, ""); }
  function waLink(msg) {
    var n = waNumber();
    return n.length >= 12 ? "https://wa.me/" + n + "?text=" + encodeURIComponent(msg) : null;
  }

  /* ---------------- diálogos ---------------- */
  function openDialog(d) {
    if (!d) return;
    if (typeof d.showModal === "function") { if (!d.open) d.showModal(); }
    else d.setAttribute("open", "");
    document.documentElement.classList.add("modal-open");
  }
  function closeDialog(d) {
    if (!d) return;
    if (typeof d.close === "function") d.close(); else d.removeAttribute("open");
  }
  function wireDialog(d) {
    d.addEventListener("click", function (e) { if (e.target === d) closeDialog(d); });
    d.addEventListener("close", function () {
      if (!$("dialog[open]")) document.documentElement.classList.remove("modal-open");
    });
    $$("[data-close]", d).forEach(function (b) { b.addEventListener("click", function () { closeDialog(d); }); });
  }

  function showMessage(msg, opts) {
    opts = opts || {};
    var d = $("#msg-modal");
    $("#msg-title").textContent = opts.titulo || "sua mensagem está pronta";
    $("#msg-intro").textContent = opts.intro || "Confira o resumo. Ao enviar, a gente confirma valor, prazo e disponibilidade com você antes de produzir.";
    $("#msg-text").textContent = msg;
    var link = waLink(msg), a = $("#msg-wa"), pend = $("#msg-pend");
    if (link) { a.href = link; a.hidden = false; pend.hidden = true; }
    else { a.hidden = true; pend.hidden = false; }
    $("#msg-copy").dataset.text = msg;
    $("#msg-copy").innerHTML = icon("copy") + "Copiar mensagem";
    openDialog(d);
  }

  function copyText(text, btn) {
    function done() { if (btn) btn.innerHTML = icon("check") + "Copiada"; toast("Mensagem copiada"); }
    function fallback() {
      var pre = $("#msg-text");
      if (pre && window.getSelection) {
        var r = document.createRange(); r.selectNodeContents(pre);
        var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
        toast("Texto selecionado: copie com o menu do aparelho");
      }
    }
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fallback);
      else fallback();
    } catch (e) { fallback(); }
  }

  var toastT;
  function toast(t) {
    var el = $("#lib-toast"); if (!el) return;
    el.textContent = t; el.classList.add("is-on");
    clearTimeout(toastT); toastT = setTimeout(function () { el.classList.remove("is-on"); }, 2400);
  }

  /* ---------------- cabeçalho ---------------- */
  function headerHTML(page) {
    var cats = CAT.categorias.map(function (c) {
      var subs = (c.subcategorias || []).map(function (s) {
        return '<li class="sub"><a href="loja.html#categoria=' + c.id + "&sub=" + s.id + '">' + esc(s.nome) + "</a></li>";
      }).join("");
      return '<li><a href="loja.html#categoria=' + c.id + '">' + esc(c.nome) + "<span>" + esc(c.resumo) + "</span></a></li>" + subs;
    }).join("");
    var cols = CAT.colecoes.map(function (c) {
      return '<li><a href="loja.html#colecao=' + c.id + '">' + esc(c.nome) + "</a></li>";
    }).join("");
    var budget = [15, 30, 50].map(function (v) {
      return '<li><a href="loja.html#ate=' + v + '">Até ' + money(v).replace(",00", "") + "</a></li>";
    }).join("");
    function cur(p) { return page === p ? ' aria-current="page"' : ""; }

    return '<a class="skip" href="#conteudo">Pular para o conteúdo</a>' +
      '<div class="announce" role="region" aria-label="Avisos"><p id="lib-announce">' + esc((CFG.avisos || [])[0] || "") + "</p></div>" +
      '<header class="site-header" id="lib-hdr"><div class="hdr">' +
        '<div class="hdr-left">' +
          '<button class="icon-btn menu-btn" type="button" id="menu-open" aria-label="Abrir menu" aria-controls="menu-drawer">' + icon("menu") + "</button>" +
          '<nav class="nav-desk" aria-label="Principal">' +
            '<a class="nav-link" href="loja.html"' + cur("loja") + ">Loja</a>" +
            '<button class="nav-link" type="button" id="mega-btn" aria-expanded="false" aria-controls="mega">Categorias' + icon("down") + "</button>" +
            '<a class="nav-link" href="loja.html#categoria=boxes-e-kits">Boxes e kits</a>' +
            '<a class="nav-link" href="personalizados.html"' + cur("personalizados") + ">Personalizados</a>" +
          "</nav>" +
        "</div>" +
        '<a class="brand" href="index.html" aria-label="Love in Box, página inicial"><img src="assets/img/marca/logo-love-in-box-320.png" alt="Love in Box" width="320" height="320"></a>' +
        '<div class="hdr-right">' +
          '<a class="nav-link hdr-help" href="ajuda.html"' + cur("ajuda") + ">Ajuda para escolher</a>" +
          '<a class="icon-btn" href="loja.html#busca" aria-label="Buscar presentes">' + icon("search") + "</a>" +
          '<button class="icon-btn" type="button" id="sel-open" aria-controls="sel-drawer" aria-label="Minha seleção">' + icon("box") + '<span class="count" id="sel-count" hidden>0</span></button>' +
        "</div>" +
      "</div>" +
      '<div class="mega" id="mega" hidden><div class="mega-in">' +
        '<div><h3 class="label">Categorias</h3><ul>' + cats + "</ul></div>" +
        '<div><h3 class="label">Ocasiões e temas</h3><ul>' + cols + "</ul></div>" +
        '<div><h3 class="label">Por orçamento</h3><ul>' + budget + '<li><a href="loja.html">Todos os presentes</a></li></ul></div>' +
        '<a class="mega-feature" href="personalizados.html"><img src="assets/img/marca/cafe-servido.jpg" alt="" loading="lazy"><span>personalize com a sua foto</span></a>' +
      "</div></div>" +
      "</header>";
  }

  function menuHTML() {
    var cats = CAT.categorias.map(function (c) {
      var subs = (c.subcategorias || []).map(function (s) {
        return '<a class="indent" href="loja.html#categoria=' + c.id + "&sub=" + s.id + '">' + esc(s.nome) + "</a>";
      }).join("");
      return '<a href="loja.html#categoria=' + c.id + '">' + esc(c.nome) + "</a>" + subs;
    }).join("");
    var cols = CAT.colecoes.map(function (c) { return '<a href="loja.html#colecao=' + c.id + '">' + esc(c.nome) + "</a>"; }).join("");
    return '<dialog class="drawer drawer--left" id="menu-drawer" aria-label="Menu">' +
      '<div class="d-head"><span class="label">Menu</span><button class="icon-btn" type="button" data-close aria-label="Fechar menu">' + icon("close") + "</button></div>" +
      '<div class="d-body"><nav class="mnav" aria-label="Menu principal">' +
        '<a href="index.html">início' + icon("arrow") + "</a>" +
        '<a href="loja.html">todos os presentes' + icon("arrow") + "</a>" +
        "<details><summary>categorias" + icon("down") + '</summary><div class="sub">' + cats + "</div></details>" +
        "<details><summary>ocasiões e temas" + icon("down") + '</summary><div class="sub">' + cols + "</div></details>" +
        '<a href="loja.html#categoria=boxes-e-kits">boxes e kits' + icon("arrow") + "</a>" +
        '<a href="personalizados.html">personalizados' + icon("arrow") + "</a>" +
        '<a href="ajuda.html">ajuda para escolher' + icon("arrow") + "</a>" +
        '<a href="como-funciona.html">como funciona' + icon("arrow") + "</a>" +
      "</nav>" +
      '<div class="mnav-cta"><a class="btn btn--dark btn--block" href="montar.html">Montar do meu jeito</a>' +
      '<a class="btn btn--line btn--block" href="pedido.html">Ver minha solicitação</a></div>' +
      "</div></dialog>";
  }

  function drawersHTML() {
    return menuHTML() +
      '<dialog class="drawer" id="sel-drawer" aria-labelledby="sel-title">' +
        '<div class="d-head"><h2 id="sel-title">minha seleção</h2><button class="icon-btn" type="button" data-close aria-label="Fechar seleção">' + icon("close") + "</button></div>" +
        '<div class="d-body" id="sel-body"></div>' +
        '<div class="d-foot" id="sel-foot"></div>' +
      "</dialog>" +
      '<dialog class="modal" id="msg-modal" aria-labelledby="msg-title">' +
        '<div class="d-head"><h2 id="msg-title">sua mensagem está pronta</h2><button class="icon-btn" type="button" data-close aria-label="Fechar">' + icon("close") + "</button></div>" +
        '<div class="d-body" style="display:grid;gap:14px">' +
          '<p class="small muted" id="msg-intro"></p>' +
          '<pre class="msg-preview" id="msg-text" tabindex="0"></pre>' +
          '<p class="notice" id="msg-pend" hidden><strong>WhatsApp em configuração.</strong> O número oficial ainda não foi cadastrado neste site. Copie a mensagem para enviar quando o contato estiver disponível.</p>' +
        "</div>" +
        '<div class="d-foot">' +
          '<a class="btn btn--pink btn--block" id="msg-wa" href="#" target="_blank" rel="noopener" hidden>' + icon("chat") + "Enviar pelo WhatsApp</a>" +
          '<button class="btn btn--line btn--block" type="button" id="msg-copy">' + icon("copy") + "Copiar mensagem</button>" +
        "</div>" +
      "</dialog>" +
      (CFG.modoPrevia ? '<dialog class="modal" id="prev-modal" aria-labelledby="prev-title">' +
        '<div class="d-head"><h2 id="prev-title">prévia do site</h2><button class="icon-btn" type="button" data-close aria-label="Fechar">' + icon("close") + "</button></div>" +
        '<div class="d-body prose"><p>Esta é a primeira versão navegável. Preços seguem o controle de produtos de 26/10/2026 e ainda serão validados. Antes de publicar, falta definir:</p><ul>' +
        (CFG.pendencias || []).map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") +
        "</ul></div></dialog>" : "") +
      '<div class="toast" id="lib-toast" role="status" aria-live="polite"></div>' +
      (CFG.modoPrevia ? '<button class="preview-chip" type="button" id="prev-open" aria-label="Prévia do site: ver dados provisórios">Prévia</button>' : "");
  }

  function footerHTML() {
    var cats = CAT.categorias.map(function (c) { return '<li><a href="loja.html#categoria=' + c.id + '">' + esc(c.nome) + "</a></li>"; }).join("");
    var contato = '<li><span class="small muted">' + esc(CFG.cidade || "") + "</span></li>";
    var wl = waLink("Olá, Love in Box!");
    if (wl) contato += '<li><a href="' + wl + '" target="_blank" rel="noopener">WhatsApp</a></li>';
    if (CFG.instagram) contato += '<li><a href="' + esc(CFG.instagram) + '" target="_blank" rel="noopener">Instagram</a></li>';
    contato += '<li><a href="ajuda.html">Fale com a gente</a></li>';
    return '<footer class="site-footer tile"><div class="ft">' +
      '<div class="ft-brand"><img src="assets/img/marca/logo-love-in-box-320.png" alt="Love in Box" width="320" height="320" loading="lazy"><p>você escolhe para quem. a gente cuida do presente.</p></div>' +
      '<div class="ft-cols">' +
        '<div><h2 class="label">Loja</h2><ul><li><a href="loja.html">Todos os presentes</a></li>' + cats + "</ul></div>" +
        '<div><h2 class="label">Ajuda</h2><ul><li><a href="ajuda.html">Ajuda para escolher</a></li><li><a href="montar.html">Montar do meu jeito</a></li><li><a href="como-funciona.html">Como funciona</a></li><li><a href="como-funciona.html#perguntas">Perguntas frequentes</a></li></ul></div>' +
        '<div><h2 class="label">Contato</h2><ul>' + contato + "</ul></div>" +
      "</div>" +
      '<div class="ft-legal"><span>© ' + new Date().getFullYear() + " Love in Box · Itabuna, Bahia</span><a href=\"privacidade.html\">Privacidade</a></div>" +
      "</div></footer>";
  }

  /* ---------------- render da seleção ---------------- */
  function itemRow(it, editable) {
    var p = product(it.id); if (!p) return "";
    var img = (p.imagens && p.imagens[0]) ? '<img src="' + esc(p.imagens[0].src) + '" alt="" loading="lazy">' : placeholder(p, false);
    var unit = p.preco == null ? "Sob consulta" : priceText(p);
    return '<li class="item" data-id="' + esc(p.id) + '">' +
      '<div class="item-thumb">' + img + "</div>" +
      '<div class="item-name"><a href="produto.html#' + esc(p.id) + '">' + esc(p.nome) + "</a><small>" + esc(unit) + (it.qty > 1 && p.preco != null ? " cada" : "") + "</small></div>" +
      '<div class="item-side">' +
        (editable === "plain" ? "" : editable === false ? '<span class="small"><strong>' + it.qty + "x</strong></span>" :
        '<div class="qty"><button type="button" data-q="-1" aria-label="Diminuir quantidade de ' + esc(p.nome) + '">' + icon("minus") + "</button>" +
        '<output aria-live="polite" aria-label="Quantidade">' + it.qty + "</output>" +
        '<button type="button" data-q="1" aria-label="Aumentar quantidade de ' + esc(p.nome) + '">' + icon("plus") + "</button></div>" +
        '<button type="button" class="rm" data-rm>Remover</button>') +
      "</div></li>";
  }
  function totalHTML() {
    var t = Sel.total();
    return '<div class="sum-line"><span>Referência</span><span>' + (t.aPartir ? "a partir de " : "") + money(t.valor) + "</span></div>" +
      '<p class="small muted" style="margin-top:6px">Valores de referência. Valor final, prazo e disponibilidade são confirmados no atendimento.</p>';
  }
  function bindItems(root) {
    root.addEventListener("click", function (e) {
      var li = e.target.closest(".item"); if (!li) return;
      var id = li.getAttribute("data-id");
      var q = e.target.closest("[data-q]");
      if (q) { var cur = (Sel.items().filter(function (i) { return i.id === id; })[0] || { qty: 0 }).qty; Sel.qty(id, cur + Number(q.getAttribute("data-q"))); }
      if (e.target.closest("[data-rm]")) Sel.remove(id);
    });
  }
  function renderSelection() {
    var n = Sel.count(), c = $("#sel-count");
    if (c) { c.textContent = n; c.hidden = n === 0; }
    var ob = $("#sel-open"); if (ob) ob.setAttribute("aria-label", "Minha seleção, " + n + (n === 1 ? " item" : " itens"));
    var body = $("#sel-body"), foot = $("#sel-foot"); if (!body) return;
    var items = Sel.items();
    if (!items.length) {
      body.innerHTML = '<div class="empty"><img src="assets/img/icons/bow.png" alt="" width="256" height="256"><p class="h3 display">sua seleção está vazia</p><p class="muted small">Escolha os itens do presente e envie tudo junto em uma única solicitação.</p></div>';
      foot.innerHTML = '<a class="btn btn--dark btn--block" href="loja.html">Ver presentes</a><a class="btn btn--line btn--block" href="ajuda.html">Preciso de ajuda</a>';
    } else {
      body.innerHTML = '<ul class="items">' + items.map(function (i) { return itemRow(i); }).join("") + "</ul>" + totalHTML();
      foot.innerHTML = '<a class="btn btn--dark btn--block" href="pedido.html">Continuar para a solicitação</a><button class="btn btn--line btn--block" type="button" data-close-sel>Continuar escolhendo</button>';
    }
    $$(".add[data-add]").forEach(function (b) {
      var on = Sel.has(b.getAttribute("data-add"));
      b.classList.toggle("is-in", on);
      b.innerHTML = icon(on ? "check" : "plus");
    });
  }

  /* ---------------- efeitos ---------------- */
  var io = null;
  function reveal(root) {
    if (reduced || !("IntersectionObserver" in window)) return;
    if (!io) io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    $$("[data-rv]", root).forEach(function (el, i) {
      if (el.classList.contains("rv")) return;
      if (el.getBoundingClientRect().top > window.innerHeight * 0.95) {
        el.classList.add("rv"); el.style.transitionDelay = ((i % 4) * 70) + "ms"; io.observe(el);
      }
    });
  }

  function rails() {
    $$(".rail").forEach(function (r) {
      var down = false, sx = 0, sl = 0, moved = false;
      r.addEventListener("pointerdown", function (e) {
        if (e.pointerType !== "mouse" || r.scrollWidth <= r.clientWidth) return;
        down = true; moved = false; sx = e.clientX; sl = r.scrollLeft;
      });
      window.addEventListener("pointermove", function (e) {
        if (!down) return; var dx = e.clientX - sx;
        if (Math.abs(dx) > 4) { moved = true; r.classList.add("is-drag"); }
        r.scrollLeft = sl - dx;
      });
      window.addEventListener("pointerup", function () { if (!down) return; down = false; setTimeout(function () { r.classList.remove("is-drag"); }, 0); });
      r.addEventListener("click", function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
    });
    $$("[data-rail]").forEach(function (b) {
      b.addEventListener("click", function () {
        var r = document.getElementById(b.getAttribute("data-rail")); if (!r) return;
        r.scrollBy({ left: Number(b.getAttribute("data-dir")) * r.clientWidth * 0.8, behavior: reduced ? "auto" : "smooth" });
      });
    });
  }

  function heroVideo() {
    var v = $(".hero video"), btn = $("#video-toggle"); if (!v) return;
    var saveData = navigator.connection && navigator.connection.saveData;
    var userPaused = false;
    function setBtn() {
      if (!btn) return;
      var playing = !v.paused;
      btn.innerHTML = icon(playing ? "pause" : "play");
      btn.setAttribute("aria-label", playing ? "Pausar vídeo" : "Reproduzir vídeo");
    }
    function tryPlay() { var p = v.play(); if (p && p.catch) p.catch(function () { setBtn(); }); }
    if (reduced || saveData) { v.removeAttribute("autoplay"); v.pause(); userPaused = true; }
    v.addEventListener("play", setBtn); v.addEventListener("pause", setBtn);
    if (btn) btn.addEventListener("click", function () { if (v.paused) { userPaused = false; tryPlay(); } else { userPaused = true; v.pause(); } });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (e) {
        if (e[0].isIntersecting) { if (!userPaused) tryPlay(); } else v.pause();
      }, { threshold: 0.2 }).observe(v);
    }
    setBtn();
  }

  function announce() {
    var el = $("#lib-announce"), list = CFG.avisos || [];
    if (!el || list.length < 2 || reduced) return;
    var i = 0;
    setInterval(function () {
      if (document.hidden) return;
      el.classList.add("is-out");
      setTimeout(function () { i = (i + 1) % list.length; el.textContent = list[i]; el.classList.remove("is-out"); }, 400);
    }, 4200);
  }

  /* ---------------- montagem ---------------- */
  function mount() {
    var page = document.body.getAttribute("data-page") || "";
    var h = $("#lib-header"); if (h) h.outerHTML = headerHTML(page);
    var f = $("#lib-footer"); if (f) f.outerHTML = footerHTML();
    document.body.insertAdjacentHTML("beforeend", drawersHTML());
    $$("dialog").forEach(wireDialog);

    $("#menu-open").addEventListener("click", function () { openDialog($("#menu-drawer")); });
    $("#sel-open").addEventListener("click", function () { openDialog($("#sel-drawer")); });
    $("#sel-drawer").addEventListener("click", function (e) { if (e.target.closest("[data-close-sel]")) closeDialog($("#sel-drawer")); });
    bindItems($("#sel-body"));
    $("#msg-copy").addEventListener("click", function () { copyText(this.dataset.text || "", this); });
    var po = $("#prev-open"); if (po) po.addEventListener("click", function () { openDialog($("#prev-modal")); });

    /* menu de categorias */
    var mb = $("#mega-btn"), mega = $("#mega");
    function setMega(open) { mega.hidden = !open; mb.setAttribute("aria-expanded", open ? "true" : "false"); }
    mb.addEventListener("click", function (e) { e.stopPropagation(); setMega(mega.hidden); });
    document.addEventListener("click", function (e) { if (!mega.hidden && !e.target.closest("#mega")) setMega(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !mega.hidden) { setMega(false); mb.focus(); } });

    /* cabeçalho ao rolar */
    var hdr = $("#lib-hdr");
    function onScroll() { hdr.classList.toggle("is-scrolled", window.scrollY > 8); }
    window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

    /* adicionar à seleção (qualquer botão data-add) */
    document.addEventListener("click", function (e) {
      var b = e.target.closest("[data-add]"); if (!b) return;
      var id = b.getAttribute("data-add"), p = product(id); if (!p || !canOrder(p)) return;
      if (Sel.has(id) && b.classList.contains("add")) {
        if (document.body.hasAttribute("data-toggle-add")) { Sel.remove(id); toast(p.nome + " saiu da seleção"); }
        else openDialog($("#sel-drawer"));
        return;
      }
      Sel.add(id, 1);
      toast(p.nome + " entrou na seleção");
      if (b.hasAttribute("data-open-sel")) openDialog($("#sel-drawer"));
    });

    document.addEventListener("lib:selecao", renderSelection);
    window.addEventListener("storage", function (e) { if (e.key === KEY) renderSelection(); });
    renderSelection();
    announce(); rails(); heroVideo();
    if (window.LIB_PAGES && window.LIB_PAGES[page]) window.LIB_PAGES[page]();
    reveal(document);
  }

  window.LIB = {
    CFG: CFG, CAT: CAT, $: $, $$: $$, esc: esc, money: money, params: params, icon: icon,
    products: products, product: product, category: category, subcategory: subcategory, collection: collection,
    statusOf: statusOf, canOrder: canOrder, priceText: priceText, priceHTML: priceHTML, placeholder: placeholder, card: card, iconFor: iconFor,
    Sel: Sel, itemRow: itemRow, totalHTML: totalHTML, bindItems: bindItems,
    waLink: waLink, showMessage: showMessage, openDialog: openDialog, closeDialog: closeDialog, toast: toast, reveal: reveal
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();
