// Gera index.html a partir das telas em src/screens/ (V2, derivadas das telas
// originais do Claude Design guardadas em design/).
// Uso: npm install && npm run build
//
// Cada tela mantém o mesmo HTML, estilos e lógica do protótipo. As únicas
// adaptações são as necessárias para funcionar como app de verdade no celular:
//  - a tela deixa de ter 390×844 fixos e ocupa a viewport inteira;
//  - as faixas reservadas para status bar (54px) e home indicator (34px) viram
//    áreas seguras do aparelho (env(safe-area-inset-*));
//  - o conteúdo de <main> rola quando a tela do aparelho é menor que 844px;
//  - links entre telas (AppXX.dc.html) viram rotas (#AppXX).
import { readFileSync, writeFileSync, readdirSync, mkdirSync, copyFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const designDir = join(root, 'design');
const canvas = JSON.parse(readFileSync(join(designDir, 'canvas.json'), 'utf8'));
const files = canvas.order.filter((f) => /^App\d\d\w+\.dc\.html$/.test(f) && canvas.boards[f]?.page === 'app');
const screensDir = join(root, 'src', 'screens');
const available = new Set(readdirSync(screensDir));

// Telas novas (sem prancha no Claude Design) entram depois, em ordem de nome.
const extra = [...available].filter((f) => /^App\d\d\w+\.dc\.html$/.test(f) && !files.includes(f)).sort();
const screens = files.filter((f) => available.has(f)).concat(extra).map((f) => {
  const src = readFileSync(join(screensDir, f), 'utf8');
  const id = f.replace('.dc.html', '');
  const title = (src.match(/<title>([^<]*)<\/title>/) || [])[1] || 'Origem';
  let body = src.match(/<x-dc>([\s\S]*?)<\/x-dc>/)[1];
  body = body.replace(/<helmet>[\s\S]*?<\/helmet>/, '').trim();
  const logic = src.match(/<script type="text\/x-dc"[^>]*>([\s\S]*?)<\/script>/)[1].trim();

  // Moldura: 390×844 fixo -> viewport inteira.
  body = body.replace('width:390px;height:844px;', 'width:100%;height:100%;');
  // Status bar / home indicator -> áreas seguras.
  body = body.replace(/<div aria-hidden="true" style="height:54px;flex:none"><\/div>/g,
    '<div aria-hidden="true" style="height:var(--sat);flex:none"></div>');
  body = body.replace(/<div aria-hidden="true" style="height:34px;flex:none"><\/div>/g,
    '<div aria-hidden="true" style="height:var(--sab);flex:none"></div>');
  // Barra de navegação inferior.
  body = body.replace(/height:88px;flex:none;box-sizing:border-box;border-top:1px solid #E6DFC4;([^"]*?)padding:6px 6px 34px;/g,
    'height:var(--nav-h);flex:none;box-sizing:border-box;border-top:1px solid #E6DFC4;$1padding:6px 6px var(--sab);');
  // Conteúdo rola verticalmente quando não cabe.
  body = body.replace(/<main style="flex:1;min-height:0;overflow:hidden;/g,
    '<main style="flex:1;min-height:0;overflow-x:hidden;overflow-y:auto;overscroll-behavior:contain;');
  // Ficha do mel: botões do topo ficavam abaixo da status bar (top:58px = 54 + 4).
  if (id === 'App11Mel') body = body.replace('left:16px;right:16px;top:58px;', 'left:16px;right:16px;top:calc(var(--sat) + 4px);');
  // Links entre telas.
  body = body.replace(/href="(App\w+)\.dc\.html"/g, 'href="#$1"');
  // <sc-for>/<sc-if> viram <template> para o parser do navegador aceitá-los em
  // qualquer lugar (inclusive dentro de <select>).
  body = body.replace(/<sc-(for|if)\b/g, '<template data-sc="$1"').replace(/<\/sc-(for|if)>/g, '</template>');

  // Toast acima da barra de navegação (bottom:102px = 88 + 14).
  const js = logic.replace(/bottom:102px/g, "bottom:calc(var(--nav-h) + 14px)");
  if (/<\/script/i.test(js) || /<template\b(?! data-sc)/.test(body)) throw new Error('conteúdo inesperado em ' + f);
  return { id, title, body, js };
});

const templates = screens.map((s) => `<template id="t-${s.id}" data-title="${s.title.replace(/"/g, '&quot;')}">\n${s.body}\n</template>`).join('\n');
const logic = screens.map((s) => `S[${JSON.stringify(s.id)}] = (function () {\n${s.js}\nreturn Component;\n})();`).join('\n\n');
const runtime = readFileSync(join(root, 'tools', 'runtime.js'), 'utf8');
const shell = readFileSync(join(root, 'tools', 'shell.html'), 'utf8');
const qrlib = readFileSync(join(root, 'node_modules', 'qrcode-generator', 'qrcode.js'), 'utf8');
const data = readFileSync(join(root, 'src', 'data.js'), 'utf8');

// Leitor de QR (carregado só quando a câmera é usada e o navegador não tem BarcodeDetector).
mkdirSync(join(root, 'vendor'), { recursive: true });
copyFileSync(join(root, 'node_modules', 'jsqr', 'dist', 'jsQR.js'), join(root, 'vendor', 'jsQR.js'));

const out = shell
  .replace('<!--TEMPLATES-->', () => templates)
  .replace('/*LIBS*/', () => qrlib + '\n' + data)
  .replace('/*RUNTIME*/', () => runtime)
  .replace('/*SCREENS*/', () => logic)
  .replace('/*FIRST*/', () => JSON.stringify(screens[0].id));
writeFileSync(join(root, 'index.html'), out);

// Etiquetas com QR Code para imprimir e colar nos potes.
const labels = readFileSync(join(root, 'tools', 'etiquetas.html'), 'utf8').replace('/*LIBS*/', () => qrlib + '\n' + data);
writeFileSync(join(root, 'etiquetas.html'), labels);

// Service worker: versão muda sempre que o app muda.
const version = createHash('sha1').update(out).update(readFileSync(join(root, 'tools', 'sw.js'), 'utf8')).digest('hex').slice(0, 10);
writeFileSync(join(root, 'sw.js'), readFileSync(join(root, 'tools', 'sw.js'), 'utf8').replace('__VERSION__', version));
console.log('index.html gerado com ' + screens.length + ' telas (v' + version + '): ' + screens.map((s) => s.id).join(', '));
