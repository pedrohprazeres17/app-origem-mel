/* Dados e estado do app.
   Os méis podem ser editados na área do revendedor (versão de demonstração:
   as alterações ficam só neste aparelho, em localStorage).
   DADOS ILUSTRATIVOS: Produtor A, B e C são placeholders. Só o Mel de Laranjeira
   tem colheita/lote do briefing; o resto aparece como “Não informado”. */
(function () {
  'use strict';
  var NI = 'Não informado';

  var BASE = [
    { id: 'lar', nome: 'Mel de Laranjeira', l1: 'MEL DE', l2: 'LARANJEIRA', florada: 'Laranjeira', prodId: 'a', prod: 'Produtor A', mun: 'São José dos Pinhais',
      cor: 'Clara', perfil: 'Suave', crist: 'Variável', colheita: 'Novembro / 2026', colheitaLonga: 'Novembro de 2026', token: 'MEL-2026-LAR-00421',
      accent: '#F6DC6B', tint: '#FFF7D1', atualizado: '14/11/2026',
      porque: 'Méis de laranjeira costumam ser claros e suaves — e é o que o produtor informa para este lote.' },
    { id: 'mulb', nome: 'Mel Multifloral', l1: 'MEL', l2: 'MULTIFLORAL', florada: 'Multifloral', prodId: 'b', prod: 'Produtor B', mun: 'Colombo',
      cor: 'Âmbar', perfil: 'Marcante', crist: NI, colheita: NI, colheitaLonga: NI, token: 'MEL-2026-MUL-00388',
      accent: '#E9A23B', tint: '#FCEBD0', atualizado: '12/11/2026',
      porque: 'Multifloral vem de várias flores ao mesmo tempo — por isso cor e sabor mudam de uma colheita para outra.' },
    { id: 'euc', nome: 'Mel de Eucalipto', l1: 'MEL DE', l2: 'EUCALIPTO', florada: 'Eucalipto', prodId: 'c', prod: 'Produtor C', mun: 'Mandirituba',
      cor: 'Âmbar', perfil: 'Intenso', crist: 'Variável', colheita: NI, colheitaLonga: NI, token: 'MEL-2026-EUC-00157',
      accent: '#C2C76E', tint: '#F3F3D8', atualizado: '08/11/2026',
      porque: 'Méis mais escuros tendem a ter sabor mais intenso — é o que o produtor informa para este lote.' },
    { id: 'mula', nome: 'Mel Multifloral', l1: 'MEL', l2: 'MULTIFLORAL', florada: 'Multifloral', prodId: 'a', prod: 'Produtor A', mun: 'São José dos Pinhais',
      cor: 'Variável', perfil: 'Variável', crist: NI, colheita: NI, colheitaLonga: NI, token: 'MEL-2026-MUL-00402',
      accent: '#E9A23B', tint: '#FCEBD0', atualizado: '14/11/2026',
      porque: 'Multifloral vem de várias flores ao mesmo tempo — por isso cor e sabor mudam de uma colheita para outra.' }
  ];
  var PRODS = [
    { id: 'a', letra: 'A', nome: 'Produtor A', mun: 'São José dos Pinhais', tint: '#FFF7D1', producao: 'Pequena escala',
      desc: 'Mantém as caixas perto de pomares e mata nativa e colhe em pequena escala, identificando cada lote.' },
    { id: 'b', letra: 'B', nome: 'Produtor B', mun: 'Colombo', tint: '#FCEBD0', producao: NI,
      desc: 'Perfil em construção: este produtor ainda não enviou uma apresentação.' },
    { id: 'c', letra: 'C', nome: 'Produtor C', mun: 'Mandirituba', tint: '#F3F3D8', producao: NI,
      desc: 'Perfil em construção: este produtor ainda não enviou uma apresentação.' }
  ];

  var MEIS = [];
  var CORES = { Laranjeira: ['#F6DC6B', '#FFF7D1'], Multifloral: ['#E9A23B', '#FCEBD0'], Eucalipto: ['#C2C76E', '#F3F3D8'] };
  var PORQUE = {
    Laranjeira: BASE[0].porque, Multifloral: BASE[1].porque, Eucalipto: BASE[2].porque,
    '*': 'Cor, aroma e sabor vêm das flores visitadas pelas abelhas — é o que o produtor informa para este lote.'
  };
  var MESES_LONGOS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  var short = function (mun) { return mun.replace('São José dos Pinhais', 'S. J. dos Pinhais'); };
  var byId = {}, prodById = {};
  PRODS.forEach(function (p) { prodById[p.id] = p; });

  function derive(m) {
    var multi = m.florada.toLowerCase() === 'multifloral';
    m.nome = multi ? 'Mel Multifloral' : 'Mel de ' + m.florada;
    m.l1 = multi ? 'MEL' : 'MEL DE';
    m.l2 = (multi ? 'Multifloral' : m.florada).toUpperCase();
    var cs = CORES[m.florada] || ['#FFDE59', '#FFF0B6'];
    m.accent = cs[0]; m.tint = cs[1];
    var p = prodById[m.prodId] || PRODS[0];
    m.prodId = p.id; m.prod = p.nome;
    if (!m.mun) m.mun = p.mun;
    if (!m.colheita) m.colheita = NI;
    m.colheitaLonga = m.colheita === NI ? NI : m.colheita.replace(/\s*\/\s*/, ' de ');
    if (!m.porque) m.porque = PORQUE[m.florada] || PORQUE['*'];
    if (!m.cadastradoPor) m.cadastradoPor = 'Revendedor responsável';
    m.nomeUp = m.nome.toUpperCase();
    m.munS = short(m.mun);
    m.munSUp = m.munS.toUpperCase();
    m.lote = m.token.slice(-5);
    m.letra = m.prod.slice(-1);
    m.florUp = m.florada.toUpperCase();
    m.prodUp = m.prod.toUpperCase();
    return m;
  }

  function rebuild() {
    MEIS.length = 0;
    BASE.forEach(function (b) { MEIS.push(derive(Object.assign({}, b, (st.edits || {})[b.id] || {}))); });
    (st.novos || []).forEach(function (n) { MEIS.push(derive(Object.assign({}, n))); });
    Object.keys(byId).forEach(function (k) { delete byId[k]; });
    MEIS.forEach(function (m) { byId[m.id] = m; });
    PRODS.forEach(function (p) {
      p.nomeUp = p.nome.toUpperCase();
      p.meis = MEIS.filter(function (m) { return m.prodId === p.id; });
      var fl = [];
      p.meis.forEach(function (m) { if (fl.indexOf(m.florada) < 0) fl.push(m.florada); });
      p.floradas = fl.map(function (f) { return { f: f, c: (CORES[f] || ['#FFDE59'])[0] }; });
      p.floradasTxt = fl.join(' · ') || NI;
      p.qtd = p.meis.length + (p.meis.length === 1 ? ' mel cadastrado' : ' méis cadastrados');
      p.disp = p.meis.length + ' no ponto de venda';
    });
  }

  function norm(t) {
    var s = String(t || '').trim();
    var m = s.match(/#t=([^&\s]+)/) || s.match(/[?&]t=([^&#\s]+)/);
    if (m) s = decodeURIComponent(m[1]);
    s = s.toUpperCase().replace(/\s+/g, '');
    var k = s.match(/(?:MEL-)?(\d{4}-[A-Z]{3}-\d{5})/);
    return k ? 'MEL-' + k[1] : (s.indexOf('MEL-') === 0 ? s : 'MEL-' + s);
  }
  function byToken(t) { var n = norm(t); return MEIS.filter(function (m) { return m.token === n; })[0] || null; }

  /* ---------- estado persistente ---------- */
  var KEY = 'origem:v2';
  var st = { saved: [], history: [], onb: false };
  try { var raw = localStorage.getItem(KEY); if (raw) st = Object.assign(st, JSON.parse(raw)); } catch (e) {}
  try { if (localStorage.getItem('origem:onb') === '1') st.onb = true; } catch (e) {}
  st.edits = st.edits || {}; st.novos = st.novos || []; st.rev = st.rev || null;
  rebuild();
  var subs = [];
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {}
    subs.forEach(function (f) { f(); });
  }

  var MESES = ['jan.', 'fev.', 'mar.', 'abr.', 'mai.', 'jun.', 'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.'];
  function dayKey(t) { var d = new Date(t); return d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate(); }
  function dayLabel(t) {
    var now = Date.now();
    if (dayKey(t) === dayKey(now)) return 'hoje';
    if (dayKey(t) === dayKey(now - 864e5)) return 'ontem';
    var d = new Date(t);
    return ('0' + d.getDate()).slice(-2) + ' ' + MESES[d.getMonth()];
  }
  function hora(t) { var d = new Date(t); return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2); }

  var App = {
    NI: NI,
    meis: MEIS,
    produtores: PRODS,
    mel: function (id) { return byId[id] || null; },
    prod: function (id) { return prodById[id] || null; },
    norm: norm,
    byToken: byToken,
    base: function () { return location.origin + location.pathname.replace(/index\.html$/, ''); },
    linkFor: function (m) { return App.base() + '#t=' + m.token; },
    subscribe: function (f) { subs.push(f); return function () { subs = subs.filter(function (x) { return x !== f; }); }; },

    onboarded: function () { return st.onb; },
    setOnboarded: function () { if (!st.onb) { st.onb = true; save(); } },

    isSaved: function (id) { return st.saved.some(function (s) { return s.id === id; }); },
    toggleSaved: function (id) {
      if (App.isSaved(id)) st.saved = st.saved.filter(function (s) { return s.id !== id; });
      else st.saved.unshift({ id: id, t: Date.now() });
      save();
      return App.isSaved(id);
    },
    restoreSaved: function (entry) { if (!App.isSaved(entry.id)) { st.saved.push(entry); st.saved.sort(function (a, b) { return b.t - a.t; }); save(); } },
    saved: function () {
      return st.saved.filter(function (s) { return byId[s.id]; }).map(function (s) {
        var l = dayLabel(s.t);
        return { entry: s, mel: byId[s.id], when: l === 'hoje' || l === 'ontem' ? 'Salvo ' + l : 'Salvo em ' + l };
      });
    },

    addHistory: function (id, via) {
      var last = st.history[0];
      if (last && last.id === id && Date.now() - last.t < 60e3) return; // evita duplicar leituras seguidas
      st.history.unshift({ id: id, t: Date.now(), via: via });
      st.history = st.history.slice(0, 60);
      save();
    },
    clearHistory: function () { st.history = []; save(); },
    history: function () {
      var groups = [], cur = null;
      st.history.filter(function (h) { return byId[h.id]; }).forEach(function (h) {
        var l = dayLabel(h.t).toUpperCase();
        if (!cur || cur.label !== l) { cur = { label: l, items: [] }; groups.push(cur); }
        cur.items.push({ mel: byId[h.id], hora: hora(h.t), via: h.via === 'token' ? 'via token' : 'via QR Code', isToken: h.via === 'token', isQr: h.via !== 'token' });
      });
      groups.forEach(function (g, i) { g.style = 'font-size:10px;font-weight:700;letter-spacing:.16em;margin-top:' + (i === 0 ? 4 : 18) + 'px'; });
      return groups;
    },

    /* ---------- área do revendedor (demonstração) ---------- */
    rev: function () { return st.rev; },
    login: function (email) { st.rev = { email: String(email).trim().toLowerCase(), nome: 'Revendedor responsável', t: Date.now() }; save(); },
    logout: function () { st.rev = null; save(); },
    OPC: {
      florada: ['Laranjeira', 'Eucalipto', 'Multifloral'],
      cor: ['Clara', 'Âmbar', 'Escura', 'Variável', NI],
      perfil: ['Suave', 'Marcante', 'Intenso', 'Variável', NI],
      crist: ['Lenta', 'Rápida', 'Variável', NI],
      meses: MESES_LONGOS
    },
    isNovo: function (id) { return (st.novos || []).some(function (n) { return n.id === id; }); },
    isEditado: function (id) { return !!(st.edits || {})[id]; },
    proximoLote: function () {
      var max = 0; MEIS.forEach(function (m) { max = Math.max(max, parseInt(m.lote, 10) || 0); });
      return ('0000' + (max + 1)).slice(-5);
    },
    tokenPara: function (florada, lote) {
      var code = String(florada || 'MEL').normalize('NFD').replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 3) || 'MEL';
      return 'MEL-2026-' + (code + 'XXX').slice(0, 3) + '-' + ('0000' + String(lote || '').replace(/\D/g, '')).slice(-5);
    },
    tokenLivre: function (token, exceptId) { return !MEIS.some(function (m) { return m.token === token && m.id !== exceptId; }); },
    /* f: { florada, prodId, mun, cor, perfil, crist, colheita, porque, lote? } — devolve o id salvo. */
    saveMel: function (id, f) {
      var d = new Date(), hoje = ('0' + d.getDate()).slice(-2) + '/' + ('0' + (d.getMonth() + 1)).slice(-2) + '/' + d.getFullYear();
      var campos = { florada: f.florada, prodId: f.prodId, mun: f.mun, cor: f.cor, perfil: f.perfil, crist: f.crist,
        colheita: f.colheita || NI, porque: f.porque || '', atualizado: hoje, cadastradoPor: (st.rev && st.rev.nome) || 'Revendedor responsável' };
      if (id && byId[id] && !App.isNovo(id)) {
        st.edits[id] = campos;
      } else if (id && App.isNovo(id)) {
        st.novos = st.novos.map(function (n) { return n.id === id ? Object.assign({}, n, campos) : n; });
      } else {
        id = 'n' + Date.now().toString(36);
        st.novos.push(Object.assign({ id: id, token: App.tokenPara(f.florada, f.lote || App.proximoLote()) }, campos));
      }
      rebuild(); save();
      return id;
    },
    removeMel: function (id) {
      if (!App.isNovo(id)) return;
      st.novos = st.novos.filter(function (n) { return n.id !== id; });
      st.saved = st.saved.filter(function (x) { return x.id !== id; });
      rebuild(); save();
    },
    resetDemo: function () { st.edits = {}; st.novos = []; rebuild(); save(); },

    /* ---------- etiqueta do pote (modelo do grupo, 180 × 60 mm) ---------- */
    labelHTML: function (m, link) {
      var e = function (x) { return String(x).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
      var HEX = 'clip-path:polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%);';
      var l2 = m.l2, t = l2.length > 11 ? Math.max(5.6, 9 * 11 / l2.length) : 9;
      var chip = function (txt, filled) {
        return filled
          ? '<span style="display:inline-flex;align-items:center;gap:1.4mm;background:' + m.accent + ';padding:0 3.2mm 0 2.4mm;height:5.2mm;border-radius:999px;font-size:2.6mm;font-weight:700"><span style="width:2.4mm;height:2.75mm;background:#161512;display:block;' + HEX + '"></span>' + e(txt) + '</span>'
          : '<span style="display:inline-flex;align-items:center;border:.3mm solid #161512;padding:0 3.2mm;height:5.2mm;box-sizing:border-box;border-radius:999px;font-size:2.6mm;font-weight:600">' + e(txt) + '</span>';
      };
      var pot = '<svg viewBox="0 0 120 160" style="position:absolute;left:23mm;top:19.5mm;width:24mm;height:32mm" aria-hidden="true"><ellipse cx="60" cy="156" rx="44" ry="4" fill="#161512" opacity=".14"></ellipse><rect x="33" y="6" width="54" height="20" rx="5" fill="#161512"></rect><rect x="29" y="25" width="62" height="7" rx="2" fill="#2B2924"></rect><path d="M20 46c0-9 6-14 15-14h50c9 0 15 5 15 14v92c0 9-6 15-15 15H35c-9 0-15-6-15-15z" fill="' + m.accent + '"></path><rect x="27" y="48" width="6" height="92" rx="3" fill="#FFFFFF" opacity=".4"></rect><rect x="36" y="74" width="48" height="50" rx="4" fill="#FFFCF1"></rect><path d="M60 80l6 3.5v7L60 94l-6-3.5v-7z" fill="#161512"></path><text x="60" y="110" text-anchor="middle" font-family="Anton, sans-serif" font-size="' + (m.florUp.length > 10 ? 7.5 : 8.5) + '" fill="#161512">' + e(m.florUp) + '</text></svg>';
      var qr = '<svg viewBox="0 0 100 100" shape-rendering="crispEdges" role="img" aria-label="QR Code ' + e(m.token) + '" style="width:100%;height:100%;display:block"><path d="' + App.qrPath(link, 'M') + '" fill="#161512"></path></svg>';
      return '<div class="etq-pote" style="width:180mm;height:60mm;position:relative;overflow:hidden;background:#FFFCF1;color:#161512;font-family:Montserrat,sans-serif;box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact">' +
        '<span style="position:absolute;left:78mm;top:-6.5mm;width:16mm;height:18.5mm;background:' + m.accent + ';opacity:.55;' + HEX + '"></span>' +
        '<span style="position:absolute;left:8.3mm;top:41.5mm;width:26.4mm;height:30.5mm;background:' + m.accent + ';opacity:.8;' + HEX + '"></span>' +
        '<span style="position:absolute;left:160mm;top:52mm;width:11.6mm;height:13.4mm;background:' + m.accent + ';opacity:.55;' + HEX + '"></span>' +
        '<span style="position:absolute;left:25.4mm;top:4.6mm;display:flex;align-items:center;gap:2mm"><span style="width:5.6mm;height:6.4mm;background:' + m.accent + ';display:flex;align-items:center;justify-content:center;' + HEX + '"><span style="width:3.3mm;height:3.8mm;background:#161512;display:flex;align-items:center;justify-content:center;' + HEX + '"><span style="width:1.5mm;height:1.7mm;background:' + m.accent + ';display:block;' + HEX + '"></span></span></span><span style="font-family:Anton,sans-serif;font-size:5.4mm;line-height:1;letter-spacing:.04em">ORIGEM</span></span>' +
        pot +
        '<div style="position:absolute;left:47.6mm;top:12.4mm;width:72mm;display:flex;flex-direction:column;align-items:flex-start">' +
          '<div style="font-family:Anton,sans-serif;font-size:9mm;line-height:.92">' + e(m.l1) + '<br><span style="font-size:' + t.toFixed(2) + 'mm">' + e(l2) + '</span></div>' +
          '<div style="margin-top:2mm;font-size:3mm;line-height:1.32;font-weight:500">Produzido por <b>' + e(m.prod) + '</b><br>Origem: ' + e(m.mun) + ' — PR</div>' +
          '<div style="margin-top:2.6mm;display:inline-flex;align-items:center;gap:2mm;height:6.1mm;padding:0 3.4mm 0 2.6mm;box-sizing:border-box;border:.3mm solid #161512;border-radius:999px;background:' + m.tint + ';font-size:2.9mm;font-weight:500;white-space:nowrap"><svg viewBox="0 0 24 24" style="width:3.4mm;height:3.4mm" fill="none" stroke="#161512" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zM18 18h2v2h-2zM18 14h2M14 18h2"></path></svg>Token: <b style="letter-spacing:.02em">' + e(m.token) + '</b></div>' +
          '<div style="margin-top:2.2mm;display:flex;gap:1.4mm;flex-wrap:nowrap">' + chip(m.florada, true) + (m.cor !== NI ? chip(m.cor) : '') + (m.perfil !== NI ? chip(m.perfil) : '') + '</div>' +
        '</div>' +
        '<div style="position:absolute;left:124.8mm;top:9.3mm;width:46mm;display:flex;flex-direction:column;align-items:flex-start">' +
          '<span style="display:inline-flex;align-items:center;height:6.6mm;padding:0 3.6mm;border-radius:999px;background:' + m.accent + ';font-family:Anton,sans-serif;font-size:4.2mm;line-height:1;letter-spacing:.02em;white-space:nowrap">ESCANEIE E DESCUBRA</span>' +
          '<span style="margin:1.6mm 0 0 2.2mm;font-size:2.55mm;line-height:1.3;font-weight:500">Acesse a origem e as<br>informações deste mel no app.</span>' +
          '<span style="margin:2.4mm 0 0 2.2mm;width:27mm;height:27mm;background:#FFFFFF;border:.3mm solid #E6DFC4;border-radius:2.4mm;padding:1.8mm;box-sizing:border-box;display:block">' + qr + '</span>' +
        '</div>' +
      '</div>';
    },

    /* QR Code real (qrcode-generator) como path SVG num quadrado de 100×100. */
    qrPath: function (text, ecc) {
      var q = window.qrcode(0, ecc || 'Q'); q.addData(text); q.make();
      var n = q.getModuleCount(), u = 100 / n, d = '', f = function (x) { return +x.toFixed(3); };
      for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) if (q.isDark(r, c)) {
        var c0 = c; while (c + 1 < n && q.isDark(r, c + 1)) c++;
        var w = (c - c0 + 1) * u;
        d += 'M' + f(c0 * u) + ' ' + f(r * u) + 'h' + f(w) + 'v' + f(u) + 'h-' + f(w) + 'z';
      }
      return d;
    }
  };
  window.Origem = App;
})();
