// Gera index.html a partir das telas originais do Claude Design (design/App*.dc.html).
// Uso: node tools/build.mjs
//
// Cada tela é copiada com o mesmo HTML, estilos e lógica do protótipo. As únicas
// adaptações são as necessárias para funcionar como app de verdade no celular:
//  - a tela deixa de ter 390×844 fixos e ocupa a viewport inteira;
//  - as faixas reservadas para status bar (54px) e home indicator (34px) viram
//    áreas seguras do aparelho (env(safe-area-inset-*));
//  - o conteúdo de <main> rola quando a tela do aparelho é menor que 844px;
//  - links entre telas (AppXX.dc.html) viram rotas (#AppXX).
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const designDir = join(root, 'design');
const canvas = JSON.parse(readFileSync(join(designDir, 'canvas.json'), 'utf8'));
const files = canvas.order.filter((f) => /^App\d\d\w+\.dc\.html$/.test(f) && canvas.boards[f]?.page === 'app');
const available = new Set(readdirSync(designDir));

const screens = files.filter((f) => available.has(f)).map((f) => {
  const src = readFileSync(join(designDir, f), 'utf8');
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
  // Token exibido na busca / no erro passa a ser o token realmente digitado.
  if (id === 'App08Loading') body = body.replace('>MEL-2026-LAR-00421</span>', '>{{$ctx.loadLabel}}</span>');
  if (id === 'App10NotFound') body = body.replace('>MEL-2026-LAR-0042<', '>{{$ctx.nfLabel}}<');
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

const out = shell
  .replace('<!--TEMPLATES-->', () => templates)
  .replace('/*RUNTIME*/', () => runtime)
  .replace('/*SCREENS*/', () => logic)
  .replace('/*FIRST*/', () => JSON.stringify(screens[0].id));
writeFileSync(join(root, 'index.html'), out);
console.log('index.html gerado com ' + screens.length + ' telas: ' + screens.map((s) => s.id).join(', '));
