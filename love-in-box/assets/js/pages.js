/* =========================================================================
   LOVE IN BOX · PÁGINAS
   Cada função monta o conteúdo dinâmico de uma página (body[data-page]).
   Depende de app.js (window.LIB), que chama a função certa ao carregar.
   ========================================================================= */
(function () {
  "use strict";

  function norm(s) { return String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase(); }
  function orderable(p) { return window.LIB.canOrder(p); }

  var BUDGETS = [15, 30, 50, 80];

  /* ---------------------------------------------------------------- início */
  function home() {
    var L = window.LIB, $ = L.$, esc = L.esc, all = L.products();

    var cats = $("[data-cats]");
    if (cats) cats.innerHTML = L.CAT.categorias.map(function (c) {
      var items = all.filter(function (p) { return p.categoria === c.id; });
      if (!items.length) return "";
      var capa = c.capa && L.product(c.capa);
      var withImg = (capa && capa.imagens && capa.imagens.length) ? capa : items.filter(function (p) { return p.imagens && p.imagens.length; })[0];
      var art = withImg
        ? '<img class="photo" src="' + esc(withImg.imagens[0].src) + '" alt="" loading="lazy" width="1080" height="1350">'
        : '<img class="icon" src="assets/img/icons/' + esc(c.icone) + '.png" alt="" loading="lazy" width="256" height="256">';
      return '<a class="cat-tile" href="loja.html#categoria=' + esc(c.id) + '" data-rv>' +
        "<h3>" + esc(c.nome) + '</h3><div class="art">' + art + "</div>" +
        '<div class="meta"><p>' + esc(c.resumo) + '</p><span class="label">' + items.length + (items.length === 1 ? " item" : " itens") + "</span></div></a>";
    }).join("");

    var dest = $("[data-destaques]");
    if (dest) dest.innerHTML = all.filter(function (p) { return p.destaque; }).slice(0, 4).map(L.card).join("");

    var cols = $("[data-colecoes]");
    if (cols) cols.innerHTML = L.CAT.colecoes.map(function (c) {
      var n = c.produtos.map(L.product).filter(function (p) { return p && all.indexOf(p) > -1; }).length;
      if (!n) return "";
      return '<a class="col-card" href="loja.html#colecao=' + esc(c.id) + '" data-rv>' +
        '<span class="col-ico"><img src="assets/img/icons/' + esc(c.icone) + '.png" alt="" width="256" height="256" loading="lazy"></span>' +
        '<span class="label">' + (c.tipo === "ocasiao" ? "Ocasião" : "Tema") + " · " + n + (n === 1 ? " item" : " itens") + "</span>" +
        "<h3>" + esc(c.nome) + "</h3><p>" + esc(c.resumo) + "</p>" +
        '<span class="col-go">Ver presentes<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span></a>';
    }).join("");

    var bud = $("[data-budget]");
    if (bud) bud.innerHTML = BUDGETS.filter(function (v) {
      return all.some(function (p) { return p.preco != null && p.status !== "em-estudo" && p.preco <= v; });
    }).map(function (v) { return '<a class="chip" href="loja.html#ate=' + v + '">Até ' + L.money(v).replace(",00", "") + "</a>"; }).join("");

    L.$$("[data-price]").forEach(function (el) {
      var p = L.product(el.getAttribute("data-price"));
      if (p) el.innerHTML = L.priceHTML(p) + ' <span class="small muted">· ' + esc(L.statusOf(p).rotulo.toLowerCase()) + "</span>";
    });
    L.$$("[data-price-from]").forEach(function (el) {
      var cid = el.getAttribute("data-price-from");
      var ps = L.products().filter(function (p) { return p.categoria === cid && p.preco != null && p.status !== "em-estudo"; });
      if (!ps.length) return;
      var min = Math.min.apply(null, ps.map(function (p) { return p.preco; }));
      el.innerHTML = '<span class="price"><small>a partir de </small>' + L.money(min) + '</span> <span class="small muted">· ' + ps.length + " opções</span>";
    });
    L.$$("[data-tag]").forEach(function (el) {
      var p = L.product(el.getAttribute("data-tag"));
      if (p) el.innerHTML = "<span>" + esc(p.nome) + " · " + esc(L.priceText(p)) + "</span>";
    });
  }

  /* ---------------------------------------------------------------- loja */
  function loja() {
    var L = window.LIB, $ = L.$, $$ = L.$$, esc = L.esc, all = L.products();
    var state = {};
    var KEYS = ["categoria", "sub", "colecao", "ate", "disp", "ordem", "q"];

    function readState() {
      var p = L.params(); state = {};
      KEYS.forEach(function (k) { var v = p.get(k); if (v) state[k] = v; });
      if (state.sub && !state.categoria) delete state.sub;
      return p;
    }
    function writeState() {
      var qs = new URLSearchParams();
      KEYS.forEach(function (k) { if (state[k]) qs.set(k, state[k]); });
      var h = qs.toString();
      try { history.replaceState(null, "", h ? "#" + h : location.pathname + location.search); } catch (e) { /* sem histórico */ }
    }

    var statusOpts = Object.keys(L.CAT.status).filter(function (s) { return all.some(function (p) { return p.status === s; }); });
    var OPTS = {
      colecao: [["", "Todas as ocasiões"]].concat(L.CAT.colecoes.map(function (c) { return [c.id, c.nome]; })),
      ate: [["", "Qualquer preço"]].concat(BUDGETS.map(function (v) { return [String(v), "Até " + L.money(v).replace(",00", "")]; })),
      disp: [["", "Toda disponibilidade"]].concat(statusOpts.map(function (s) { return [s, L.CAT.status[s].rotulo]; })),
      ordem: [["", "Destaques"], ["preco-asc", "Menor preço"], ["preco-desc", "Maior preço"], ["nome", "Nome (A–Z)"]]
    };
    function fillSelects() {
      $$("select[data-f]").forEach(function (sel) {
        var f = sel.getAttribute("data-f"), list;
        if (f === "sub") {
          var c = L.category(state.categoria), subs = (c && c.subcategorias) || [];
          $("#f-sub-wrap").hidden = !subs.length;
          list = [["", "Todas"]].concat(subs.map(function (s) { return [s.id, s.nome]; }));
        } else list = OPTS[f];
        sel.innerHTML = list.map(function (o) { return '<option value="' + esc(o[0]) + '">' + esc(o[1]) + "</option>"; }).join("");
        sel.value = state[f] || "";
      });
    }

    function filtered() {
      var col = state.colecao ? L.collection(state.colecao) : null;
      var q = norm(state.q), ate = Number(state.ate) || 0;
      var list = all.filter(function (p) {
        if (state.categoria && p.categoria !== state.categoria) return false;
        if (state.sub && p.subcategoria !== state.sub) return false;
        if (col && col.produtos.indexOf(p.id) === -1) return false;
        if (state.disp && p.status !== state.disp) return false;
        if (ate && (p.preco == null || p.status === "em-estudo" || p.preco > ate)) return false;
        if (q) {
          var c = L.category(p.categoria);
          var hay = norm(p.nome + " " + (p.resumo || "") + " " + (c ? c.nome : ""));
          if (q.split(/\s+/).some(function (w) { return hay.indexOf(w) === -1; })) return false;
        }
        return true;
      });
      function pv(p) { return (p.preco == null || p.status === "em-estudo") ? Infinity : p.preco; }
      if (state.ordem === "preco-asc") list.sort(function (a, b) { return pv(a) - pv(b); });
      if (state.ordem === "preco-desc") list.sort(function (a, b) { return (pv(b) === Infinity ? -1 : pv(b)) - (pv(a) === Infinity ? -1 : pv(a)); });
      if (state.ordem === "nome") list.sort(function (a, b) { return a.nome.localeCompare(b.nome, "pt-BR"); });
      return list;
    }

    function chipsHTML() {
      var html = '<button class="chip" type="button" data-cat="" aria-pressed="' + (!state.categoria) + '">Todos</button>';
      L.CAT.categorias.forEach(function (c) {
        var n = all.filter(function (p) { return p.categoria === c.id; }).length; if (!n) return;
        html += '<button class="chip" type="button" data-cat="' + esc(c.id) + '" aria-pressed="' + (state.categoria === c.id) + '">' + esc(c.nome) + "</button>";
      });
      return html;
    }

    function activeHTML() {
      var X = L.icon("close"), out = [];
      function pill(k, label) { out.push('<button type="button" data-clear="' + k + '" aria-label="Remover filtro ' + esc(label) + '">' + esc(label) + X + "</button>"); }
      if (state.sub) { var s = L.subcategory(state.categoria, state.sub); if (s) pill("sub", s.nome); }
      if (state.colecao) { var c = L.collection(state.colecao); if (c) pill("colecao", c.nome); }
      if (state.ate) pill("ate", "Até " + L.money(Number(state.ate)).replace(",00", ""));
      if (state.disp && L.CAT.status[state.disp]) pill("disp", L.CAT.status[state.disp].rotulo);
      if (state.q) pill("q", "“" + state.q + "”");
      return out.join("");
    }

    function render() {
      var list = filtered();
      var cat = L.category(state.categoria), col = L.collection(state.colecao), sub = L.subcategory(state.categoria, state.sub);
      var title = sub ? sub.nome : cat ? cat.nome : col ? col.nome : "Todos os presentes";
      $("#shop-title").textContent = title;
      $("#crumb-cur").textContent = cat ? cat.nome : col ? col.nome : "Loja";
      $("#shop-sub").textContent = cat ? cat.resumo : col ? col.resumo : "Canecas, fotos, boxes e complementos. Escolha e envie a solicitação.";
      document.title = (sub ? sub.nome : cat ? cat.nome : col ? col.nome : "Loja") + " · Love in Box";
      $("#cat-chips").innerHTML = chipsHTML();
      $("#active-filters").innerHTML = activeHTML();
      $("#result-count").textContent = list.length + (list.length === 1 ? " presente" : " presentes");
      $("#shop-grid").innerHTML = list.map(L.card).join("");
      $("#shop-grid").hidden = !list.length;
      $("#shop-empty").hidden = !!list.length;
      var q = $("#q"); if (document.activeElement !== q) q.value = state.q || "";
      fillSelects();
      if (window.LIB && L.reveal) L.reveal($("#shop-grid"));
      document.dispatchEvent(new CustomEvent("lib:selecao"));
    }

    function set(k, v) {
      if (v) state[k] = v; else delete state[k];
      if (k === "categoria") delete state.sub;
      writeState(); render();
    }

    $("#cat-chips").addEventListener("click", function (e) {
      var b = e.target.closest("[data-cat]"); if (!b) return;
      set("categoria", b.getAttribute("data-cat"));
    });
    $("#active-filters").addEventListener("click", function (e) {
      var b = e.target.closest("[data-clear]"); if (!b) return; set(b.getAttribute("data-clear"), "");
    });
    $$("select[data-f]").forEach(function (sel) {
      sel.addEventListener("change", function () { set(sel.getAttribute("data-f"), sel.value); });
    });
    var t;
    $("#q").addEventListener("input", function () {
      var v = this.value.trim(); clearTimeout(t);
      t = setTimeout(function () { set("q", v); }, 180);
    });
    $("#q").addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); this.blur(); } });
    function clearAll() { state = {}; writeState(); render(); }
    $("#clear-all").addEventListener("click", clearAll);
    $("#filters-clear").addEventListener("click", function () { var c = state.categoria, q = state.q; state = {}; if (c) state.categoria = c; if (q) state.q = q; writeState(); render(); });
    $("#filters-open").addEventListener("click", function () { L.openDialog($("#filters-sheet")); });
    window.addEventListener("hashchange", function () { readState(); render(); });

    var p0 = readState();
    render();
    if (p0.get("_") === "busca") { setTimeout(function () { $("#q").focus(); }, 60); }
  }

  /* ---------------------------------------------------------------- produto */
  function produto() {
    var L = window.LIB, $ = L.$, esc = L.esc, I = L.icon;
    var root = $("#pdp-root");

    function notFound() {
      root.innerHTML = '<section class="tile"><div class="empty"><img src="assets/img/icons/sparkle.png" alt="" width="256" height="256">' +
        '<h1 class="display h3">Produto não encontrado</h1><p class="muted small">O link pode estar incompleto ou o item saiu do catálogo.</p>' +
        '<a class="btn btn--dark" href="loja.html">Ver todos os presentes</a></div></section>';
      $("#related-wrap").hidden = true; $("#buybar").innerHTML = "";
    }

    function ctaHTML(p, cls, idAttr) {
      var mode = L.statusOf(p).pedido;
      if (mode === "selecao") return '<button class="btn btn--dark ' + cls + '" type="button" data-add="' + esc(p.id) + '" data-open-sel' + idAttr + ">Adicionar à seleção</button>";
      if (mode === "aviso") return '<button class="btn btn--pink ' + cls + '" type="button" data-msg="aviso"' + idAttr + ">" + I("chat") + "Avise-me quando voltar</button>";
      if (mode === "interesse") return '<button class="btn btn--line ' + cls + '" type="button" data-msg="interesse"' + idAttr + ">" + I("chat") + "Tenho interesse</button>";
      return "";
    }

    function render() {
      var p = L.params(), id = p.get("p") || p.get("_");
      var prod = id ? L.product(id) : null;
      if (!prod || L.products().indexOf(prod) === -1) { notFound(); return; }
      var cat = L.category(prod.categoria), sub = L.subcategory(prod.categoria, prod.subcategoria);
      var imgs = prod.imagens || [];
      document.title = prod.nome + " · Love in Box";
      var md = document.querySelector('meta[name="description"]'); if (md && prod.resumo) md.setAttribute("content", prod.resumo);

      var figs = imgs.length
        ? imgs.map(function (im, i) { return '<figure><img src="' + esc(im.src) + '" alt="' + esc(im.alt) + '" width="1080" height="1350"' + (i ? ' loading="lazy"' : "") + "></figure>"; }).join("")
        : "<figure>" + L.placeholder(prod) + "</figure>";
      var dots = imgs.length > 1 ? '<div class="dots" aria-hidden="true">' + imgs.map(function (_, i) { return "<span" + (i ? "" : ' class="on"') + "></span>"; }).join("") + "</div>" : "";

      var notice = {
        "sob-encomenda": "<strong>Feito sob encomenda.</strong> Itens, personalização e prazo são combinados no atendimento.",
        "sem-estoque": "<strong>Sem estoque no momento.</strong> Peça um aviso e a gente responde quando houver previsão.",
        "em-estudo": "<strong>Em estudo.</strong> Este modelo ainda não pode ser pedido. Se tiver interesse, conta pra gente."
      }[prod.status];

      var perso = (prod.personalizacao && prod.personalizacao.length)
        ? '<div><p class="label muted">Dá para personalizar com</p><div class="opts">' + prod.personalizacao.map(function (o) { return "<span>" + esc(o) + "</span>"; }).join("") + "</div></div>"
        : "";

      root.innerHTML =
        '<nav class="crumbs" aria-label="Você está em" style="padding:6px 4px 12px"><a href="index.html">Início</a><span aria-hidden="true">/</span><a href="loja.html">Loja</a>' +
          (cat ? '<span aria-hidden="true">/</span><a href="loja.html#categoria=' + esc(cat.id) + '">' + esc(cat.nome) + "</a>" : "") +
          (sub ? '<span aria-hidden="true">/</span><a href="loja.html#categoria=' + esc(cat.id) + "&sub=" + esc(sub.id) + '">' + esc(sub.nome) + "</a>" : "") +
        "</nav>" +
        '<div class="pdp">' +
          '<div class="gallery"><div class="gallery-track' + (imgs.length < 2 ? " is-single" : "") + '" id="gal" tabindex="0" aria-label="Fotos do produto">' + figs + "</div>" + dots + "</div>" +
          '<div class="pdp-info-wrap"><div class="tile pdp-info">' +
            '<div><span class="badge" data-status="' + esc(prod.status) + '">' + esc(L.statusOf(prod).rotulo) + "</span></div>" +
            '<h1 class="display h2">' + esc(prod.nome) + "</h1>" +
            '<div class="pdp-price">' + L.priceHTML(prod) + (prod.preco != null && prod.status !== "em-estudo" ? '<span class="note">valor de referência</span>' : "") + "</div>" +
            '<p class="lead">' + esc(prod.resumo || "") + "</p>" +
            perso +
            (notice ? '<p class="notice">' + notice + "</p>" : "") +
            ctaHTML(prod, "btn--block", ' id="main-cta"') +
            '<ul class="facts">' +
              "<li>" + I("clock") + "<div><strong>Prazo</strong>Confirmado no atendimento, antes da produção.</div></li>" +
              "<li>" + I("pin") + "<div><strong>Retirada em Itabuna</strong>Entrega local sob consulta.</div></li>" +
              "<li>" + I("chat") + "<div><strong>Sem pagamento pelo site</strong>Você envia a solicitação e a gente confirma tudo pelo WhatsApp.</div></li>" +
            "</ul>" +
            (imgs.length ? "" : '<p class="small muted">Foto real deste produto em breve.</p>') +
          "</div></div>" +
        "</div>";

      /* pontos da galeria */
      var gal = $("#gal"), ds = L.$$(".dots span");
      if (gal && ds.length) gal.addEventListener("scroll", function () {
        var i = Math.round(gal.scrollLeft / gal.clientWidth);
        ds.forEach(function (d, k) { d.classList.toggle("on", k === i); });
      }, { passive: true });

      /* mensagens de aviso / interesse */
      root.addEventListener("click", msgHandler);
      var bb = $("#buybar");
      bb.innerHTML = '<div class="bb-name"><strong>' + esc(prod.nome) + "</strong>" + L.priceHTML(prod) + "</div>" + ctaHTML(prod, "btn--sm", "");
      bb.addEventListener("click", msgHandler);
      function msgHandler(e) {
        var b = e.target.closest("[data-msg]"); if (!b) return;
        var kind = b.getAttribute("data-msg");
        var msg = kind === "aviso"
          ? "Olá, Love in Box! Quero ser avisada(o) quando o item *" + prod.nome + "* voltar ao estoque."
          : "Olá, Love in Box! Tenho interesse no item *" + prod.nome + "*, que está em estudo. Podem me avisar quando houver novidade?";
        L.showMessage(msg, { titulo: kind === "aviso" ? "Pedir aviso" : "Registrar interesse", intro: "Envie esta mensagem pelo WhatsApp. A gente responde quando houver novidade." });
      }
      var main = $("#main-cta");
      if (main && "IntersectionObserver" in window) {
        new IntersectionObserver(function (en) {
          var show = !en[0].isIntersecting;
          bb.classList.toggle("is-on", show); bb.setAttribute("aria-hidden", show ? "false" : "true");
          document.body.classList.toggle("has-buybar", show && window.innerWidth < 980);
        }).observe(main);
      }

      /* relacionados */
      var all = L.products();
      var cols = L.CAT.colecoes.filter(function (c) { return c.produtos.indexOf(prod.id) > -1; });
      var rel = all.filter(function (o) {
        return o.id !== prod.id && orderable(o) && (o.categoria === prod.categoria || cols.some(function (c) { return c.produtos.indexOf(o.id) > -1; }));
      });
      if (rel.length < 4) all.forEach(function (o) { if (rel.length < 4 && o.id !== prod.id && rel.indexOf(o) === -1 && orderable(o)) rel.push(o); });
      rel = rel.slice(0, 4);
      $("#related").innerHTML = rel.map(L.card).join("");
      $("#related-wrap").hidden = rel.length < 2;
      document.dispatchEvent(new CustomEvent("lib:selecao"));
    }

    render();
    window.addEventListener("hashchange", function () { location.reload(); });
  }

  /* ---------------------------------------------------------------- solicitação */
  function pedido() {
    var L = window.LIB, $ = L.$, $$ = L.$$;
    var box = $("#order-items");

    function renderItems() {
      var items = L.Sel.items();
      box.innerHTML = items.length
        ? '<ul class="items">' + items.map(function (i) { return L.itemRow(i); }).join("") + "</ul>" + L.totalHTML()
        : '<div class="empty" style="padding:24px 0"><img src="assets/img/icons/bow.png" alt="" width="256" height="256"><p class="display h3">Nenhum item ainda</p><p class="small muted">Escolha na loja, monte do seu jeito ou peça ajuda.</p><div class="btn-row" style="justify-content:center"><a class="btn btn--dark btn--sm" href="loja.html">Ver presentes</a><a class="btn btn--line btn--sm" href="ajuda.html">Preciso de ajuda</a></div></div>';
      if (items.length) $("#o-items-err").hidden = true;
    }
    L.bindItems(box);
    document.addEventListener("lib:selecao", renderItems);
    renderItems();

    var today = new Date(); today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    $("#o-data").min = today.toISOString().slice(0, 10);

    $$('input[name="entrega"]').forEach(function (r) {
      r.addEventListener("change", function () { $("#o-bairro-f").hidden = !$('input[name="entrega"][value^="Entrega"]').checked; });
    });

    function fail(fid, eid, show) { var f = $(fid); if (f) f.classList.toggle("is-error", show); $(eid).hidden = !show; }

    $("#order-form").addEventListener("submit", function (e) {
      e.preventDefault();
      var items = L.Sel.items();
      var nome = $("#o-nome").value.trim(), ok = $("#o-ok").checked;
      fail("#o-nome-f", "#o-nome-err", !nome);
      fail("#o-ok-f", "#o-ok-err", !ok);
      $("#o-items-err").hidden = !!items.length;
      if (!items.length) { box.scrollIntoView({ behavior: "smooth", block: "center" }); return; }
      if (!nome) { $("#o-nome").focus(); return; }
      if (!ok) { $("#o-ok").focus(); return; }

      var lines = ["Olá, Love in Box! Quero fazer uma solicitação pelo site.", "", "*Itens*"];
      items.forEach(function (it) {
        var p = L.product(it.id);
        lines.push("• " + it.qty + "x " + p.nome + " (" + L.priceText(p) + (it.qty > 1 && p.preco != null ? " cada" : "") + ")");
      });
      var t = L.Sel.total();
      lines.push("Referência: " + (t.aPartir ? "a partir de " : "") + L.money(t.valor));
      lines.push("");
      var perso = $("#o-perso").value.trim();
      if (perso) lines.push("*Personalização:* " + perso);
      if ($("#o-foto").checked) lines.push("Vou enviar foto(s) por aqui.");
      var para = $("#o-para").value.trim(); if (para) lines.push("*Para:* " + para);
      var oc = $("#o-ocasiao").value; if (oc) lines.push("*Ocasião:* " + oc);
      var d = $("#o-data").value; if (d) { var pr = d.split("-"); lines.push("*Data desejada:* " + pr[2] + "/" + pr[1] + "/" + pr[0]); }
      var ent = $('input[name="entrega"]:checked').value; lines.push("*Retirada/entrega:* " + ent);
      var bairro = $("#o-bairro").value.trim(); if (bairro && ent.indexOf("Entrega") === 0) lines.push("*Bairro:* " + bairro);
      var obs = $("#o-obs").value.trim(); if (obs) lines.push("*Observações:* " + obs);
      lines.push("", "*Meu nome:* " + nome, "", "Sei que é uma solicitação e que valor, prazo e disponibilidade serão confirmados no atendimento.");
      L.showMessage(lines.join("\n"));
    });
  }

  /* ---------------------------------------------------------------- ajuda */
  function ajuda() {
    var L = window.LIB, $ = L.$, $$ = L.$$, esc = L.esc, all = L.products();
    var CH = {
      para: { type: "radio", opts: ["Mãe", "Pai", "Amor", "Amiga ou amigo", "Irmã ou irmão", "Colega de trabalho", "Criança", "Outra pessoa"] },
      ocasiao: { type: "radio", opts: ["Aniversário", "Namoro", "Agradecimento", "Amigo secreto", "Só porque sim", "Outra"] },
      orcamento: { type: "radio", opts: ["Até R$ 30", "Até R$ 50", "Até R$ 80", "Acima de R$ 80", "Ainda não sei"] },
      gosta: { type: "checkbox", opts: ["Café", "Chá", "Fotos e lembranças", "Pets", "Ainda não sei"] }
    };
    var BUD = { "Até R$ 30": 30, "Até R$ 50": 50, "Até R$ 80": 80 };
    var LIKE = { "Café": "para-quem-ama-cafe", "Chá": "cha-e-aconchego", "Fotos e lembranças": "lembrancas-com-foto" };

    Object.keys(CH).forEach(function (k) {
      var c = CH[k];
      $('[data-chips="' + k + '"]').innerHTML = c.opts.map(function (o, i) {
        var id = "h-" + k + "-" + i;
        return '<span><input class="chip-input" type="' + c.type + '" name="' + k + '" id="' + id + '" value="' + esc(o) + '"><label class="chip" for="' + id + '">' + esc(o) + "</label></span>";
      }).join("");
    });

    function val(k) { var el = $('input[name="' + k + '"]:checked'); return el ? el.value : ""; }
    function vals(k) { return $$('input[name="' + k + '"]:checked').map(function (e) { return e.value; }); }

    function ideas() {
      var b = BUD[val("orcamento")] || 0, likes = vals("gosta");
      var list = all.filter(orderable);
      if (b) list = list.filter(function (p) { return p.preco != null && p.preco <= b; });
      var ids = [];
      likes.forEach(function (l) {
        if (LIKE[l]) ids = ids.concat(L.collection(LIKE[l]).produtos);
        if (l === "Pets") list.forEach(function (p) { if (p.personalizacao && p.personalizacao.join(" ").indexOf("Foto") > -1) ids.push(p.id); });
      });
      if (ids.length) list = list.filter(function (p) { return ids.indexOf(p.id) > -1; });
      $("#ideas").innerHTML = list.slice(0, 5).map(function (p) { return L.itemRow({ id: p.id, qty: 1 }, "plain"); }).join("");
      var touched = b || likes.length;
      $("#ideas-note").textContent = !touched ? "Marque o orçamento e os gostos para filtrar." : list.length ? list.length + (list.length === 1 ? " item encontrado." : " itens encontrados.") + " A gente pode sugerir combinações no WhatsApp." : "Nenhum item com essa combinação. A gente sugere outras opções no WhatsApp.";
      $("#ideas-link").href = b ? "loja.html#ate=" + b : "loja.html";
    }
    $("#help-form").addEventListener("change", ideas);
    ideas();

    $("#help-form").addEventListener("submit", function (e) {
      e.preventDefault();
      var nome = $("#h-nome").value.trim();
      $("#h-nome-f").classList.toggle("is-error", !nome); $("#h-nome-err").hidden = !!nome;
      if (!nome) { $("#h-nome").focus(); return; }
      var lines = ["Olá, Love in Box! Preciso de ajuda para escolher um presente.", ""];
      if (val("para")) lines.push("*Para:* " + val("para"));
      if (val("ocasiao")) lines.push("*Ocasião:* " + val("ocasiao"));
      if (val("orcamento")) lines.push("*Orçamento:* " + val("orcamento"));
      if (vals("gosta").length) lines.push("*A pessoa gosta de:* " + vals("gosta").join(", "));
      var obs = $("#h-obs").value.trim(); if (obs) lines.push("*Detalhes:* " + obs);
      lines.push("", "*Meu nome:* " + nome);
      L.showMessage(lines.join("\n"), { titulo: "Pedido de sugestão", intro: "Confira e envie. A gente responde com sugestões de presente." });
    });
  }

  /* ---------------------------------------------------------------- montar */
  function montar() {
    var L = window.LIB, $ = L.$, all = L.products().filter(orderable);
    var base = all.filter(function (p) { return p.categoria !== "complementos"; });
    var comp = all.filter(function (p) { return p.categoria === "complementos"; });
    $("#m-base").innerHTML = base.map(L.card).join("");
    $("#m-comp").innerHTML = comp.map(L.card).join("");
    document.body.setAttribute("data-toggle-add", "");

    function summary() {
      var items = L.Sel.items();
      $("#m-summary").innerHTML = items.length
        ? '<ul class="items">' + items.map(function (i) { return L.itemRow(i); }).join("") + "</ul>" + L.totalHTML() +
          '<div class="btn-row" style="margin-top:16px"><a class="btn btn--dark" href="pedido.html">Continuar para a solicitação</a></div>'
        : '<p class="muted">Nenhum item escolhido ainda. Toque no <strong>+</strong> dos produtos acima.</p>';
    }
    L.bindItems($("#m-summary"));
    document.addEventListener("lib:selecao", summary);
    summary();
  }

  /* ---------------------------------------------------------------- personalizados */
  function personalizados() {
    var L = window.LIB;
    var list = L.products().filter(function (p) { return orderable(p) && p.personalizacao && p.personalizacao.length; });
    L.$("#pz-grid").innerHTML = list.map(L.card).join("");
  }

  function ds() {
    var L = window.LIB;
    L.$("#ds-cards").innerHTML = ["caneca-branca", "box-personalizada", "caneca-magica", "caneca-3d-tematica"].map(L.product).filter(Boolean).map(L.card).join("");
  }

  window.LIB_PAGES = { ds: ds, home: home, loja: loja, produto: produto, pedido: pedido, ajuda: ajuda, montar: montar, personalizados: personalizados };
})();
