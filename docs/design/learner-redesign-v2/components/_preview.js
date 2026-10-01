// Preview-only loader: fetches component .jsx files, strips import/export, transpiles with Babel.
window.loadDS = async function (paths) {
  const names = [];
  let src = '';
  for (const p of paths) {
    let t = await (await fetch(p)).text();
    t = t.replace(/^import .*$/gm, '');
    t = t.replace(/^export (function|const) (\w+)/gm, (m, k, n) => { names.push(n); return k + ' ' + n; });
    src += '\n' + t;
  }
  const code = Babel.transform(src, { presets: ['react'], sourceType: 'script' }).code + '\nreturn {' + names.join(',') + '};';
  return new Function('React', code)(React);
};
window.mountDS = function (paths, render) {
  loadDS(paths).then(C => ReactDOM.createRoot(document.getElementById('root')).render(render(C)));
};
