# App Origem — informação e rastreabilidade do mel

## Status

Ativo — protótipo HTML navegável V1 concluído em 18/11/2026.

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

## V1 navegável

- 22 estados/telas representados em uma SPA responsiva.
- Fluxo completo de onboarding, scan simulado, entrada manual do token, sucesso e erro.
- Ficha, resumo, origem, token e rastreabilidade do lote.
- Catálogo, comparação, produtores, conteúdo educativo, salvos e histórico.
- Persistência local dos méis salvos.
- Dados e QR Code ainda demonstrativos; nenhum deles deve ser interpretado como certificação real.

## Links

- Aplicativo: `https://pedrohprazeres17.github.io/app-origem-mel/`
- Repositório: `https://github.com/pedrohprazeres17/app-origem-mel`
