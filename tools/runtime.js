/* Mini-runtime que executa as telas no mesmo formato do Claude Design:
   holes {{caminho}}, <sc-for>, <sc-if>, eventos onClick/onChange e classes
   DCLogic com state/setState/componentDidMount/componentWillUnmount.
   A tela é re-renderizada por "morph" (atualiza o DOM existente no lugar),
   para que as transições CSS do protótipo funcionem como desenhadas. */
(function () {
  'use strict';

  var S = {};
  window.__screens = S;

  function DCLogic(props) { this.props = props || {}; this.state = {}; }
  DCLogic.prototype.setState = function (patch) {
    if (this.__dead) return;
    if (typeof patch === 'function') patch = patch(this.state, this.props);
    this.state = Object.assign({}, this.state, patch);
    var self = this;
    if (this.__pending || !this.__mounted) return;
    this.__pending = true;
    queueMicrotask(function () { self.__pending = false; if (!self.__dead) paint(self); });
  };
  DCLogic.prototype.forceUpdate = function () { this.setState({}); };
  DCLogic.prototype.renderVals = function () { return {}; };
  window.DCLogic = DCLogic;

  /* ---------- holes ---------- */
  var HOLE = /\{\{\s*([^}]+?)\s*\}\}/g;
  var WHOLE = /^\s*\{\{\s*([^}]+?)\s*\}\}\s*$/;
  function lookup(path, scope) {
    if (path === 'true') return true;
    if (path === 'false') return false;
    if (path === 'null') return null;
    if (/^-?\d+(\.\d+)?$/.test(path)) return Number(path);
    if (/^(['"]).*\1$/.test(path)) return path.slice(1, -1);
    var parts = path.split('.'), v = scope;
    for (var i = 0; i < parts.length; i++) { if (v == null) return undefined; v = v[parts[i]]; }
    return v;
  }
  function evalAttr(raw, scope) {
    var m = raw.match(WHOLE);
    if (m) return lookup(m[1], scope);
    return interp(raw, scope);
  }
  function interp(text, scope) {
    if (text.indexOf('{{') < 0) return text;
    return text.replace(HOLE, function (_, p) { var v = lookup(p, scope); return v == null ? '' : String(v); });
  }

  /* ---------- render (template -> nós novos, destacados) ---------- */
  var FORM = { input: 1, select: 1, textarea: 1 };
  function kidsOf(n) { return n.content ? n.content.childNodes : n.childNodes; }
  function renderInto(nodes, scope, out) { for (var i = 0; i < nodes.length; i++) renderNode(nodes[i], scope, out); }
  function renderNode(n, scope, out) {
    if (n.nodeType === 3) { out.push(document.createTextNode(interp(n.nodeValue, scope))); return; }
    if (n.nodeType !== 1) return;
    var tag = n.localName;
    if (tag === 'template' && n.hasAttribute('data-sc')) {
      var kind = n.getAttribute('data-sc');
      if (kind === 'if') {
        if (evalAttr(n.getAttribute('value') || '', scope)) renderInto(kidsOf(n), scope, out);
      } else {
        var list = evalAttr(n.getAttribute('list') || '', scope) || [];
        var as = n.getAttribute('as') || 'item';
        for (var i = 0; i < list.length; i++) {
          var s = Object.create(scope); s[as] = list[i]; s.$index = i;
          renderInto(kidsOf(n), s, out);
        }
      }
      return;
    }
    var el = document.createElementNS(n.namespaceURI, tag);
    var attrs = n.attributes;
    for (var a = 0; a < attrs.length; a++) {
      var at = attrs[a], name = at.name;
      if (name.indexOf('hint-') === 0) continue;
      var v = at.value.indexOf('{{') < 0 ? at.value : evalAttr(at.value, scope);
      if (name.length > 2 && name.indexOf('on') === 0) {
        if (typeof v === 'function') (el.__h || (el.__h = {}))[name.slice(2)] = v;
        continue;
      }
      if (name === 'value' && FORM[tag]) {
        el.__value = v == null ? '' : String(v);
        if (tag === 'input') el.setAttribute('value', el.__value);
        continue;
      }
      var aria = name.indexOf('aria-') === 0;
      if (v == null || (v === false && !aria)) continue;
      if (v === true && !aria) v = '';
      if (at.namespaceURI) el.setAttributeNS(at.namespaceURI, name, String(v));
      else el.setAttribute(name, String(v));
    }
    var kids = [];
    renderInto(kidsOf(n), scope, kids);
    for (var k = 0; k < kids.length; k++) el.appendChild(kids[k]);
    if ((tag === 'select' || tag === 'textarea') && el.__value != null) el.value = el.__value;
    out.push(el);
  }

  /* ---------- morph (aplica nós novos sobre o DOM vivo) ---------- */
  function morph(live, next) {
    if (live.nodeType !== next.nodeType || live.nodeName !== next.nodeName || live.namespaceURI !== next.namespaceURI) {
      live.parentNode.replaceChild(next, live);
      return;
    }
    if (live.nodeType === 3) { if (live.nodeValue !== next.nodeValue) live.nodeValue = next.nodeValue; return; }
    var la = live.attributes, na = next.attributes, i;
    for (i = la.length - 1; i >= 0; i--) if (!next.hasAttribute(la[i].name)) live.removeAttribute(la[i].name);
    for (i = 0; i < na.length; i++) if (live.getAttribute(na[i].name) !== na[i].value) {
      if (na[i].namespaceURI) live.setAttributeNS(na[i].namespaceURI, na[i].name, na[i].value);
      else live.setAttribute(na[i].name, na[i].value);
    }
    live.__h = next.__h;
    if (!live.hasAttribute('data-raw')) morphChildren(live, next); // data-raw: conteúdo gerenciado pela tela
    if (next.__value != null && live.value !== next.__value) live.value = next.__value;
  }
  function morphChildren(live, next) {
    var a = Array.prototype.slice.call(live.childNodes), b = Array.prototype.slice.call(next.childNodes), i;
    for (i = 0; i < b.length; i++) { if (i < a.length) morph(a[i], b[i]); else live.appendChild(b[i]); }
    for (i = b.length; i < a.length; i++) live.removeChild(a[i]);
  }

  /* ---------- montagem ---------- */
  var host, current = null, ctx = { token: null, via: 'qr' };
  window.__ctx = ctx;
  var App = window.Origem;
  var DEFAULT = 'MEL-2026-LAR-00421';
  function ctxVals() {
    var t = ctx.token == null ? null : App.norm(ctx.token);
    var raw = ctx.token == null ? null : String(ctx.token).toUpperCase().trim();
    var shown = t == null ? DEFAULT : (App.byToken(t) || /^MEL-\d{4}-[A-Z]{3}-\d{5}$/.test(t) ? t : (raw.indexOf('MEL-') === 0 ? raw : 'MEL-' + raw));
    if (shown.length > 26) shown = shown.slice(0, 25) + '…';
    return { loadLabel: shown, nfLabel: t == null || App.byToken(t) ? 'MEL-2026-LAR-0042' : shown };
  }

  function paint(inst) {
    var vals = inst.renderVals() || {};
    var scope = Object.create(vals);
    scope.$ctx = ctxVals();
    var out = [];
    renderInto(inst.__tpl.content.childNodes, scope, out);
    var frag = document.createElement('div');
    for (var i = 0; i < out.length; i++) frag.appendChild(out[i]);
    if (!inst.__mounted) host.replaceChildren.apply(host, Array.prototype.slice.call(frag.childNodes));
    else morphChildren(host, frag);
    if (inst.componentDidRender) inst.componentDidRender();
  }

  function find(e, type) {
    for (var el = e.target; el && el !== host.parentNode; el = el.parentNode) if (el.__h && el.__h[type]) return el.__h[type];
    return null;
  }

  var timers = [];
  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
  var replacing = false;
  function to(hash) { replacing = true; location.replace('#' + hash); }
  window.__go = to;

  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function animateIn(dir) {
    var el = host.firstElementChild;
    if (!el || reduce || !el.animate || dir === 0) return;
    el.animate([{ opacity: 0, transform: 'translateX(' + (dir > 0 ? 28 : -28) + 'px)' }, { opacity: 1, transform: 'none' }],
      { duration: 260, easing: 'cubic-bezier(.2,.8,.2,1)' });
  }

  function mount(id, param, dir) {
    if (current) {
      current.__dead = true;
      if (current.__unsub) current.__unsub();
      if (current.componentWillUnmount) try { current.componentWillUnmount(); } catch (e) { console.error(e); }
    }
    timers.forEach(clearTimeout); timers = [];
    var tpl = document.getElementById('t-' + id);
    var inst = new S[id]({ param: param || null });
    inst.__tpl = tpl;
    current = inst; current.__id = id; current.__param = param || null;
    document.title = (tpl.getAttribute('data-title') || 'Origem').replace(/^[^—]*— /, '') + ' · Origem';
    paint(inst);
    inst.__mounted = true;
    inst.__unsub = App.subscribe(function () { inst.forceUpdate(); });
    animateIn(dir);
    if (inst.componentDidMount) inst.componentDidMount();
    hooks(id);
  }

  function buzz(p) {
    var ua = navigator.userActivation;
    if (navigator.vibrate && (!ua || ua.hasBeenActive)) try { navigator.vibrate(p); } catch (e) {}
  }
  function resolveToken() {
    var m = App.byToken(ctx.token == null ? DEFAULT : ctx.token);
    if (m) { App.addHistory(m.id, ctx.via); buzz(35); return 'App09Found/' + m.id; }
    buzz([30, 60, 30]);
    return 'App10NotFound';
  }

  /* Comportamentos de app que o protótipo apenas sugere. */
  function hooks(id) {
    if (id === 'App01Splash') later(function () { to(!App.onboarded() ? 'App02OnbA' : App.needsEntry() ? 'App27Entrar' : 'App05Home'); }, 2600);
    if (id === 'App27Entrar') App.setOnboarded();
    if (id === 'App05Home') App.setOnboarded();
    if (id === 'App08Loading') later(function () { to(resolveToken()); }, 1900);
  }

  var depth = 0;
  function route() {
    var hash = decodeURIComponent(location.hash.slice(1));
    var prev = current && current.__id;
    // Link direto do QR Code: #t=MEL-2026-LAR-00421
    if (/^t=/.test(hash)) {
      ctx.token = hash.slice(2); ctx.via = 'qr';
      App.setOnboarded();
      history.replaceState({ d: depth }, '', '#App08Loading');
      hash = 'App08Loading';
      prev = '#deeplink';
    }
    var parts = hash.split('/'), id = parts[0], param = parts[1] || null;
    if (!S[id]) { id = window.__FIRST; param = null; }
    if (id === 'App08Loading' && prev === 'App07Token') { ctx.token = current.state.val; ctx.via = 'token'; }
    else if (id === 'App08Loading' && prev !== '#deeplink' && prev !== 'App08Loading' && prev !== 'App06Scanner') { ctx.token = null; ctx.via = 'qr'; }
    if (id === 'App09Found' && !param && prev === 'App08Loading') { timers.forEach(clearTimeout); return to(resolveToken()); }
    if (id === 'App02OnbA' && prev === 'App01Splash' && App.onboarded()) { id = App.needsEntry() ? 'App27Entrar' : 'App05Home'; param = null; }
    // Login ao abrir o app: ao sair do onboarding, ou ao abrir direto na Início sem conta.
    if (id === 'App05Home' && App.needsEntry() && (!current || /^App0[1-4]/.test(prev || ''))) { id = 'App27Entrar'; param = null; }

    // Direção da navegação (para a transição e para o botão Voltar).
    var dir = 1, st = history.state;
    if (st && typeof st.d === 'number' && !replacing) { dir = st.d < depth ? -1 : st.d > depth ? 1 : 0; depth = st.d; }
    else if (replacing) { dir = prev === 'App08Loading' || prev === 'App01Splash' ? 1 : 0; }
    else if (current) depth++;
    replacing = false;
    var want = '#' + id + (param ? '/' + param : '');
    history.replaceState({ d: depth }, '', want);
    if (prev === id && (current.__param || null) === param) return;
    mount(id, param, current ? dir : 0);
  }

  function fit() {
    var s = Math.min(1, (window.innerHeight - 32) / 844, (window.innerWidth - 32) / 390);
    document.documentElement.style.setProperty('--fit', String(Math.max(0.3, s)));
  }

  window.__start = function () {
    host = document.getElementById('app');
    host.addEventListener('click', function (e) {
      var back = e.target.closest && e.target.closest('a[aria-label="Voltar"]');
      if (back && depth > 0) { e.preventDefault(); history.back(); return; }
      var f = find(e, 'click'); if (f) f(e);
    });
    host.addEventListener('keydown', function (e) { var f = find(e, 'keydown'); if (f) f(e); });
    host.addEventListener('input', function (e) { var f = find(e, 'change') || find(e, 'input'); if (f) f(e); });
    window.addEventListener('hashchange', route);
    window.addEventListener('resize', fit);
    fit();
    route();
  };
})();
