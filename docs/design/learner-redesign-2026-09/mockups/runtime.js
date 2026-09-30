(function(){
  const xdc = document.querySelector('x-dc');
  const helmet = xdc.querySelector('helmet');
  if (helmet) { [...helmet.children].forEach(n => document.head.appendChild(n)); helmet.remove(); }
  const tpl = document.createElement('div');
  [...xdc.childNodes].forEach(n => tpl.appendChild(n));
  const scriptEl = document.querySelector('script[data-dc-script]');
  const props = JSON.parse(scriptEl.getAttribute('data-props') || '{}');
  class DCLogic { constructor(){ this.state = {}; this.props = {}; } setState(p){ Object.assign(this.state, typeof p === 'function' ? p(this.state) : p); schedule(); } forceUpdate(){ schedule(); } }
  const Component = new Function('DCLogic', scriptEl.textContent + '\n;return Component;')(DCLogic);
  const inst = new Component();
  const defaults = {}; for (const k in props) if (props[k] && 'default' in props[k]) defaults[k] = props[k].default;
  const qp = new URLSearchParams(location.search);
  inst.props = { ...defaults, ...(qp.get('theme') ? { theme: qp.get('theme') } : {}), ...(qp.get('review') ? { showReview: true } : {}) };
  const HOLE = /\{\{\s*([^}]+?)\s*\}\}/g;
  function get(path, scopes){ path = path.trim(); if (path === 'true') return true; if (path === 'false') return false; if (/^-?\d/.test(path)) return Number(path);
    const parts = path.split('.'); for (const s of scopes) { if (s && parts[0] in s) { let v = s; for (const p of parts) v = v == null ? undefined : v[p]; return v; } } return undefined; }
  function whole(str){ const m = /^\s*\{\{\s*([^}]+?)\s*\}\}\s*$/.exec(str); return m ? m[1] : null; }
  function interp(str, scopes){ return str.replace(HOLE, (_, p) => { const v = get(p, scopes); return v == null ? '' : String(v); }); }
  function render(node, scopes, out){
    if (node.nodeType === 3) { out.push(document.createTextNode(interp(node.nodeValue, scopes))); return; }
    if (node.nodeType !== 1) return;
    const tag = node.tagName.toLowerCase();
    if (tag === 'sc-if') { const v = get(whole(node.getAttribute('value')), scopes); if (v) node.childNodes.forEach(c => render(c, scopes, out)); return; }
    if (tag === 'sc-for') { const list = get(whole(node.getAttribute('list')), scopes) || []; const as = node.getAttribute('as') || 'item';
      list.forEach((it, i) => { const sc = [{ [as]: it, $index: i }, ...scopes]; node.childNodes.forEach(c => render(c, sc, out)); }); return; }
    const el = document.createElementNS(node.namespaceURI, node.tagName.toLowerCase() === node.tagName ? node.tagName : node.localName);
    for (const a of node.attributes) {
      const w = whole(a.value);
      if (/^on/i.test(a.name) && w) { const fn = get(w, scopes); const ev = a.name.slice(2).toLowerCase(); const evn = ev === 'change' ? 'input' : ev; if (typeof fn === 'function') el.addEventListener(evn, fn); continue; }
      if (a.name.startsWith('hint-')) continue;
      const val = interp(a.value, scopes);
      if (a.name === 'value' && tag === 'input') { el.value = val; el.setAttribute('value', val); continue; }
      el.setAttribute(a.name, val);
    }
    const kids = []; node.childNodes.forEach(c => render(c, scopes, kids)); kids.forEach(k => el.appendChild(k));
    out.push(el);
  }
  let pending = false; function schedule(){ if (!pending) { pending = true; queueMicrotask(draw); } }
  function draw(){ pending = false;
    const act = document.activeElement; const fid = act && act.id; const sel = act && act.selectionStart;
    const vals = inst.renderVals(); const out = []; tpl.childNodes.forEach(c => render(c, [vals], out));
    xdc.replaceChildren(...out);
    if (fid) { const e = document.getElementById(fid); if (e) { e.focus(); try { e.setSelectionRange(sel, sel); } catch(_){} } }
  }
  xdc.style.display = 'block';
  draw(); window.__dcReady = true;
})();
