# App Origem — informação e rastreabilidade do mel

## Status

Ativo — V2 funcional (scanner real, QR Codes por lote, fichas dinâmicas, offline) sobre as telas originais do Claude Design.

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

Validar a V2 com Pedro e a autora (de preferência escaneando etiquetas impressas em potes reais). Depois: dados reais dos produtores, painel de cadastro de lotes, banco de dados e autenticação.

## V2 — app funcional

A V2 mantém a aparência das 22 telas do Claude Design e transforma o protótipo em app de verdade.

**O que funciona**

- **Scanner real:** abre a câmera traseira e lê QR Codes (BarcodeDetector quando o navegador tem; senão jsQR, carregado só nessa hora). Lanterna real nos aparelhos que suportam. Sem câmera ou sem permissão, a tela volta à ilustração do design, com um aviso; tocar no código simula a leitura.
- **QR Codes reais e link direto:** cada lote tem um link `…/#t=MEL-2026-LAR-00421`. Escanear com a câmera nativa do celular abre o app direto na ficha. A tela "Detalhes de origem" mostra o QR do lote, com botão de compartilhar.
- **Etiquetas para imprimir:** `etiquetas.html` gera uma etiqueta com QR Code para cada lote (A4, pronta para imprimir).
- **Fichas dinâmicas:** ficha, resumo, origem, detalhes do token, "mel encontrado" e perfil do produtor funcionam para os 4 méis e os 3 produtores (`#App11Mel/euc`, `#App15Produtor/b`…). O que o briefing não informa aparece como "Não informado".
- **Token digitado:** valida os 4 tokens cadastrados (Enter também busca). Token inválido leva para "Não encontramos este token", mostrando o código lido.
- **Meus méis:** salvar/remover em qualquer ficha (com desfazer), "Comparar salvos" já abre os dois primeiros, histórico real de leituras (via QR Code ou token) agrupado por dia, com limpar.
- **App de verdade:** botão Voltar segue o histórico, transições entre telas, vibração na leitura, funciona offline (service worker) e pode ser instalado na tela inicial.

**Área do revendedor (demonstração)** — pedido do grupo em 24/11/2026

- **Login ao abrir o app:** depois da abertura e do onboarding aparece "Como você quer entrar?", com "Sou comprador", "Sou revendedor" e "Continuar sem conta" (vale só até fechar o app). Quem já entrou vai direto para a Início; quem abre pelo QR Code de um pote vai direto para a ficha. Na demonstração vale qualquer e-mail e senha (o botão "USAR" preenche um exemplo). Não há servidor: as contas e as alterações ficam salvas só no aparelho. O card no fim da Início mostra a conta e permite sair.
- **Painel "Seus méis":** lista os méis com atalhos para editar, fazer etiqueta e ver a ficha; permite cadastrar mel novo e restaurar os dados originais.
- **Editar mel:** florada (ou outra), produtor, município, cor, perfil, cristalização, colheita e "por que este mel é diferente". Mel novo ganha lote e token automáticos. O token de um mel existente não muda, para não invalidar etiquetas impressas. As mudanças aparecem na hora em todas as telas do app.
- **Etiqueta do pote:** segue o modelo do grupo (`Etiqueta_Projeto_III.pdf`, 180 × 60 mm) com as fontes e cores do app, e com o QR Code do lote à direita, em "Escaneie e descubra". Prévia, quantidade (1, 4, 8 ou 12) e "Imprimir ou salvar PDF" em tamanho real, 4 por folha A4. Com o revendedor conectado, os cards de "Explore os méis", "Méis disponíveis" e a ficha do mel ganham o botão de etiqueta.
- O modelo da etiqueta fica num lugar só (`labelHTML` em `src/data.js`), usado pelo app e por `etiquetas.html`.

**Como o código está organizado**

- `design/` — arquivos originais exportados do Claude Design (referência, não editar).
- `src/screens/` — as 22 telas do design (com dados dinâmicos) e as telas novas de entrada e do revendedor (`App23Login` a `App27Entrar`), no mesmo formato e padrão visual.
- `src/data.js` — méis, produtores, tokens, salvos e histórico (salvos no aparelho, via `localStorage`).
- `tools/runtime.js` — executa o formato do Claude Design (`{{holes}}`, `sc-for`, `sc-if`, `setState`), rotas, link do QR e transições.
- `tools/build.mjs` — gera `index.html`, `etiquetas.html`, `sw.js` e `vendor/jsQR.js`.

Para regerar depois de mudar algo:

```bash
npm install
npm run build
```

**Limitações conhecidas:** o login do revendedor é só de demonstração (sem servidor nem senha de verdade); edições, salvos e histórico ficam só no aparelho; Produtor A/B/C continuam ilustrativos.

## Links

- Aplicativo: `https://pedrohprazeres17.github.io/app-origem-mel/`
- Etiquetas: `https://pedrohprazeres17.github.io/app-origem-mel/etiquetas.html`
- Repositório: `https://github.com/pedrohprazeres17/app-origem-mel`
