# Pulsar

Curiosidades de tecnologia em pulsos curtos, sempre com fonte. Uma marca do grupo Plêiade.

Site estático em HTML, CSS e JavaScript puros, sem dependências. Tudo que mexe na página bate no ritmo do PSR B1919+21, o primeiro pulsar descoberto (um pulso a cada 1,3373 s).

## O que tem

- **Topo:** o pulsar girando, com os feixes e o registro dos pulsos empilhados, desenhados ao vivo num `<canvas>`. Clicar no céu manda um pulso extra. O botão "Ouvir o pulso" toca um estalo por batida.
- **Pulsos:** cards de curiosidade, cada um com fonte e com link próprio (`#pulso-001`, `#pulso-002`…).
- **Podcast Pulsar:** player próprio que toca os episódios hospedados em `hellys.dev.br/audio/`. Como aquele servidor não aceita pedir só um pedaço do arquivo, pular para um trecho ainda não baixado faz o player baixar o episódio inteiro uma vez.
- **Vídeos:** prévia do estilo dos vídeos curtos.

## Estrutura

```
public/        o site publicado (index.html, estilo.css, site.js, og.jpg)
og/og.html     fonte da imagem de prévia de link (public/og.jpg, 1200×630)
.github/       publicação automática no GitHub Pages a cada push na main
```

## Rodar localmente

```bash
python -m http.server 5192 --directory public
```

## Novo pulso

Copie um `<li class="card">` em `public/index.html`, troque o número, o `id` (`pulso-010`), o título, o gancho, o texto e a fonte. A regra da casa: sem fonte boa, não publica.

## Refazer a imagem de prévia

```bash
msedge --headless=new --hide-scrollbars --window-size=1200,630 --virtual-time-budget=6000 --screenshot=og.png og/og.html
```

Depois converta `og.png` para `public/og.jpg`.
