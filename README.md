# App Origem — informação e rastreabilidade do mel

## Status

Ativo — HTML funcional gerado a partir do código-fonte original do Claude Design (19/11/2026).

## Objetivo

Ajudar uma amiga do Pedro a transformar o conceito criado no Claude em um aplicativo funcional para informação, comparação e rastreabilidade de méis por QR Code ou token.

## Referência original

- Artifact: `https://claude.ai/artifact/A2rzpRU9V6foqnVHu6vEoW#page-ea5260f41abe`
- Formato: protótipo mobile de 390 × 844 px.
- Escopo observado: 22 telas.

## Proposta central

Permitir que o consumidor conheça o mel além do pote: produtor, origem, florada, lote, colheita, cor, perfil, cristalização e demais informações associadas a um QR Code ou token do produto.

## Jornadas observadas

1. **Entrada:** splash e onboarding sobre origem, diferenças entre méis e leitura do QR Code.
2. **Scan/token:** scanner, digitação manual, localização, sucesso e token não encontrado.
3. **Ficha do mel:** visão principal, resumo, origem, informações do token e detalhes de rastreabilidade.
4. **Explorar:** comparação, catálogo de méis, produtores, perfil do produtor e conteúdo educativo.
5. **Meus méis:** itens salvos e histórico de leituras.

## Direção visual original

- Paleta dominante: amarelo-mel, preto/carvão e marfim.
- Tipografia: títulos condensados e pesados; textos auxiliares simples e diretos.
- Linguagem: editorial, artesanal e informativa, sem estética rural genérica.
- Componentes: cards de produto, chips de atributos, diagramas de origem, ilustrações de potes/flores, QR Code, token e navegação inferior.
- Ação principal: scanner central destacado na navegação.

## Regras iniciais

- Preservar o conceito, o conteúdo e a personalidade visual da autora.
- Não redesenhar ou simplificar silenciosamente antes de definir o escopo funcional.
- Diferenciar claramente informação declarada pelo produtor, rastreabilidade do lote e qualquer validação/certificação externa.
- Tratar scanner, cadastro de lotes e origem dos dados como requisitos reais, não apenas telas demonstrativas.

## Próximo passo

Validar a V1 com Pedro e a autora. Depois, definir dados reais, painel de cadastro de produtores/lotes, banco de dados, autenticação e leitura real de QR Code para o MVP.

## Versão atual (HTML funcional)

O app é gerado **diretamente do código-fonte das 22 telas do Claude Design**, sem redesenho:

- `design/` — arquivos originais exportados do projeto (`App01Splash.dc.html` … `App22Historico.dc.html` e `canvas.json`).
- `tools/build.mjs` — gera o `index.html` a partir de `design/`. Rodar: `node tools/build.mjs`.
- `tools/runtime.js` — mini-runtime que executa as telas no mesmo formato do Claude Design (`{{holes}}`, `sc-for`, `sc-if`, `setState`), com atualização do DOM no lugar para manter as animações do protótipo.
- `tools/shell.html` — casca da página (fontes, viewport, PWA).

Adaptações feitas sobre o protótipo (só o necessário para virar app):

- **Mobile first:** a tela ocupa o aparelho inteiro; as faixas de status bar/home indicator viram as áreas seguras do celular e o conteúdo rola quando a tela é menor que 844 px. Em telas largas o app aparece no tamanho exato do protótipo (390 × 844).
- **Fluxos:** splash avança sozinho; onboarding só aparece na primeira vez; scan simulado → localizando → mel encontrado; token digitado é validado (`MEL-2026-LAR-00421` encontra o mel; outro código leva para “Token não encontrado” mostrando o código lido).
- **PWA:** pode ser adicionado à tela inicial (manifest + ícones).

Limitações conhecidas: a câmera/leitura real de QR Code ainda é simulada; salvos, histórico e filtros mantêm o estado de demonstração de cada tela, como no protótipo; dados de Produtor A/B/C continuam ilustrativos.

## Links

- Aplicativo: `https://pedrohprazeres17.github.io/app-origem-mel/`
- Repositório: `https://github.com/pedrohprazeres17/app-origem-mel`
