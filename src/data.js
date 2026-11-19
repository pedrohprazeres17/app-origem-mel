/* Dados e estado do app (V2).
   DADOS ILUSTRATIVOS: Produtor A, B e C são placeholders. Só o Mel de Laranjeira
   tem colheita/lote do briefing; o resto aparece como “Não informado”. */
(function () {
  'use strict';
  var NI = 'Não informado';

  var MEIS = [
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

  var short = function (mun) { return mun.replace('São José dos Pinhais', 'S. J. dos Pinhais'); };
  MEIS.forEach(function (m) {
    m.nomeUp = m.nome.toUpperCase();
    m.munS = short(m.mun);
    m.munSUp = m.munS.toUpperCase();
    m.lote = m.token.slice(-5);
    m.letra = m.prod.slice(-1);
    m.florUp = m.florada.toUpperCase();
  });
  PRODS.forEach(function (p) {
    p.nomeUp = p.nome.toUpperCase();
    p.meis = MEIS.filter(function (m) { return m.prodId === p.id; });
    var fl = [];
    p.meis.forEach(function (m) { if (fl.indexOf(m.florada) < 0) fl.push(m.florada); });
    p.floradas = fl.map(function (f) { return { f: f, c: MEIS.filter(function (m) { return m.florada === f; })[0].accent }; });
    p.floradasTxt = fl.join(' · ');
    p.qtd = p.meis.length + (p.meis.length === 1 ? ' mel cadastrado' : ' méis cadastrados');
    p.disp = p.meis.length + ' no ponto de venda';
  });

  var byId = {}, prodById = {};
  MEIS.forEach(function (m) { byId[m.id] = m; });
  PRODS.forEach(function (p) { prodById[p.id] = p; });

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
