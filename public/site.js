/* Pulsar · site.js
   A página inteira pulsa num ritmo só: o período do PSR B1919+21, o primeiro pulsar descoberto (1,3373 s).
   Cada parte do site fica isolada em parte(): se uma quebrar, as outras seguem. */
(function () {
  "use strict";

  var PERIODO = 1337.3;
  var reduzir = window.matchMedia("(prefers-reduced-motion: reduce)");
  var inicio = performance.now();
  var heroNaTela = true;

  function parte(nome, fn) {
    try { fn(); } catch (erro) { console.error("[pulsar] " + nome, erro); }
  }

  function fase(agora) { return (((agora - inicio) % PERIODO) + PERIODO) % PERIODO / PERIODO; }

  // ---------- relógio do pulsar: avisa todo mundo a cada batida ----------
  var aoPulsar = [];
  var batidas = 0;
  function relogio(agora) {
    var n = Math.floor((agora - inicio) / PERIODO);
    if (n > batidas) {
      batidas = n;
      aoPulsar.forEach(function (fn) {
        try { fn(n); } catch (erro) { console.error("[pulsar] batida", erro); }
      });
    }
    requestAnimationFrame(relogio);
  }
  requestAnimationFrame(relogio);

  function avisarTodos(nome) { document.dispatchEvent(new CustomEvent(nome)); }

  // ---------- abertura: o radiotelescópio grava o pulsar, linha por linha, até a estrela acender ----------
  // Cada linha é uma volta do pulsar (como no gráfico de 1967); a pena do registrador desenha da esquerda
  // para a direita. Depois a estrela acende, PULSAR entra letra por letra e a abertura sai. Uns 4,5 s;
  // um clique ou uma tecla pula. O <head> só liga a abertura uma vez por visita e nunca com menos movimento.
  parte("abertura", function () {
    var raiz = document.documentElement;
    var caixa = document.querySelector(".abertura");
    if (!caixa || !raiz.classList.contains("com-abertura")) return;
    var tela = caixa.querySelector(".abertura-ceu");
    var ctx = tela.getContext("2d");
    var PONTOS = 120;
    var LINHAS = window.innerWidth < 720 ? 18 : 26;
    var PRIMEIRA = 0.3;
    var PASSO = 2.1 / LINHAS;
    var ESTRELA = PRIMEIRA + LINHAS * PASSO;   // a estrela acende quando a última linha termina
    var PALAVRA = ESTRELA + 0.3;
    var SAIDA = PALAVRA + 1.05;
    var FIM = SAIDA + 0.55;
    var L = 0, A = 0;
    var t0 = performance.now();
    var palavraFoi = false, saiu = false;

    var linhas = [];
    for (var k = 0; k < LINHAS; k++) {
      var meio = 0.5 + (Math.random() - 0.5) * 0.03;
      var amp = 0.35 + Math.random() * 0.65;
      var larg = 0.022 + Math.random() * 0.014;
      var pts = new Float32Array(PONTOS + 1);
      var ruido = 0;
      for (var i = 0; i <= PONTOS; i++) {
        var x = i / PONTOS;
        var d = (x - meio) / larg;
        ruido = ruido * 0.55 + (Math.random() - 0.5) * 0.09;
        pts[i] = amp * Math.exp(-d * d) + ruido * (0.25 + 0.75 * Math.exp(-Math.pow((x - meio) / 0.22, 2)));
      }
      linhas.push(pts);
    }

    function medir() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      L = window.innerWidth;
      A = window.innerHeight;
      tela.width = Math.round(L * dpr);
      tela.height = Math.round(A * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function desenhar(seg) {
      ctx.fillStyle = "#08070d";
      ctx.fillRect(0, 0, L, A);
      var largo = L >= 720;
      var x0 = L * (largo ? 0.22 : 0.06);
      var largura = L * (largo ? 0.56 : 0.88);
      var topo = A * 0.3;
      var base = A * 0.58;
      var passoY = (base - topo) / (LINHAS - 1);
      var alto = passoY * 5;
      var degrade = ctx.createLinearGradient(x0, 0, x0 + largura, 0);
      degrade.addColorStop(0, "rgba(228,255,58,0)");
      degrade.addColorStop(0.14, "rgba(228,255,58,1)");
      degrade.addColorStop(0.86, "rgba(228,255,58,1)");
      degrade.addColorStop(1, "rgba(228,255,58,0)");
      var feitas = Math.max(0, Math.min(LINHAS, (seg - PRIMEIRA) / PASSO));
      var caneta = null;
      ctx.lineJoin = "round";
      for (var k = 0; k < Math.ceil(feitas); k++) {
        var pts = linhas[k];
        var y = topo + k * passoY;
        var ate = Math.max(1, Math.floor(Math.min(1, feitas - k) * PONTOS));
        var ultima = k === Math.ceil(feitas) - 1 && feitas < LINHAS;
        ctx.beginPath();
        for (var i = 0; i <= ate; i++) {
          var px = x0 + (i / PONTOS) * largura;
          var py = y - pts[i] * alto;
          if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py);
        }
        var fimX = x0 + (ate / PONTOS) * largura;
        ctx.lineTo(fimX, y + passoY);
        ctx.lineTo(x0, y + passoY);
        ctx.closePath();
        ctx.fillStyle = "#08070d";
        ctx.fill();
        ctx.beginPath();
        for (var j = 0; j <= ate; j++) {
          var qx = x0 + (j / PONTOS) * largura;
          var qy = y - pts[j] * alto;
          if (j) ctx.lineTo(qx, qy); else ctx.moveTo(qx, qy);
        }
        ctx.strokeStyle = ultima ? "#ff2d8a" : degrade;
        ctx.lineWidth = ultima ? 2.4 : 1.6;
        ctx.globalAlpha = 0.35 + 0.65 * ((k + 1) / LINHAS);
        ctx.stroke();
        ctx.globalAlpha = 1;
        if (ultima) caneta = { x: fimX, y: y - pts[ate] * alto };
      }
      if (caneta) {
        ctx.fillStyle = "#e4ff3a";
        ctx.beginPath();
        ctx.arc(caneta.x, caneta.y, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      if (seg > ESTRELA) {
        var e = seg - ESTRELA;
        var cx = x0 + largura / 2;
        var cy = A * 0.2;
        var f = (e % (PERIODO / 1000)) / (PERIODO / 1000);
        var ang = Math.PI * 0.62 + f * Math.PI * 2;
        var acende = Math.min(1, e * 4);
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        var comp = Math.hypot(L, A) * 0.75;
        for (var b = 0; b < 2; b++) {
          var a = ang + b * Math.PI;
          var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, comp);
          g.addColorStop(0, "rgba(228,255,58," + (0.34 * acende).toFixed(3) + ")");
          g.addColorStop(0.3, "rgba(228,255,58," + (0.08 * acende).toFixed(3) + ")");
          g.addColorStop(1, "rgba(228,255,58,0)");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.arc(cx, cy, comp, a - 0.07, a + 0.07);
          ctx.closePath();
          ctx.fill();
        }
        var brilho = Math.exp(-e * 3);
        var halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, 160 + brilho * 260);
        halo.addColorStop(0, "rgba(228,255,58," + (0.5 + brilho * 0.4).toFixed(3) + ")");
        halo.addColorStop(0.3, "rgba(255,45,138," + (0.15 + brilho * 0.2).toFixed(3) + ")");
        halo.addColorStop(1, "rgba(255,45,138,0)");
        ctx.fillStyle = halo;
        ctx.fillRect(cx - 500, cy - 500, 1000, 1000);
        ctx.restore();
        ctx.strokeStyle = "rgba(228,255,58," + (Math.max(0, 1 - e * 1.5) * 0.7).toFixed(3) + ")";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, 8 + e * 600, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = "#fbffe2";
        ctx.beginPath();
        ctx.arc(cx, cy, (8 + brilho * 10) * acende, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    var acabou = false;
    function terminar() {
      if (acabou) return;
      acabou = true;
      raiz.classList.remove("com-abertura");
      try { sessionStorage.setItem("pulsar:abertura", "vista"); } catch (e) {}
      window.removeEventListener("keydown", sair);
    }
    // Sai na hora (botão, clique ou tecla) sem esperar o próximo quadro
    function sair() {
      if (saiu) return;
      saiu = true;
      caixa.classList.add("saindo");
      setTimeout(terminar, (FIM - SAIDA) * 1000);
    }

    function quadro(agora) {
      if (acabou) return;
      var seg = (agora - t0) / 1000;
      if (!palavraFoi && seg >= PALAVRA) {
        palavraFoi = true;
        caixa.classList.add("palavra-entra");
      }
      if (seg >= SAIDA) sair();
      desenhar(Math.min(seg, FIM));
      requestAnimationFrame(quadro);
    }

    medir();
    window.addEventListener("resize", medir);
    caixa.addEventListener("click", sair);
    window.addEventListener("keydown", sair);
    requestAnimationFrame(quadro);
  });

  // ---------- topo ganha fundo quando a página rola ----------
  parte("topo", function () {
    var topo = document.querySelector(".topo");
    function ver() { topo.classList.toggle("rolou", window.scrollY > 30); }
    window.addEventListener("scroll", ver, { passive: true });
    ver();
  });

  // ---------- coisas que sobem ao aparecer ----------
  parte("revela", function () {
    var itens = document.querySelectorAll(".revela");
    document.querySelectorAll(".cards .card").forEach(function (card, i) {
      card.style.setProperty("--atraso", (i % 3) * 80 + "ms");
    });
    document.addEventListener("animationend", function (ev) {
      if (ev.animationName === "sobe") ev.target.classList.remove("revela", "visto");
    });
    if (!("IntersectionObserver" in window)) {
      itens.forEach(function (el) { el.classList.remove("revela"); });
      return;
    }
    var olho = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("visto");
        olho.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    itens.forEach(function (el) { olho.observe(el); });
  });

  // ---------- o céu do topo: pulsar, feixes e o registro dos pulsos ----------
  parte("céu", function () {
    var hero = document.querySelector(".hero");
    var tela = hero.querySelector(".hero-ceu");
    var ctx = tela.getContext("2d");
    var PONTOS = 150;
    var ANG0 = Math.PI * .62; // na batida, um feixe aponta para baixo, na direção do registro
    var L = 0, A = 0, lay = null, degrade = null;
    var estrelas = [], linhas = [], aneis = [];
    var mouse = { x: .5, y: .5 }, suave = { x: .5, y: .5 };
    var forte = null, rodando = false, ultima = 0;

    for (var i = 0; i < 170; i++) {
      estrelas.push({ x: Math.random(), y: Math.random(), r: Math.random() * 1.3 + .3, a: Math.random() * .55 + .2, v: Math.random() * 2 + .4, f: Math.random() * 6.3 });
    }

    // Um pulso gravado: ruído baixo nas pontas, um pico forte no meio e às vezes uns picos menores do lado.
    function novaLinha(meioClicado) {
      var meio = meioClicado == null ? .5 + (Math.random() - .5) * .03 : meioClicado;
      var amp = meioClicado == null ? .35 + Math.random() * .65 : 1.35;
      var larg = .022 + Math.random() * .014;
      var subs = [];
      for (var s = Math.floor(Math.random() * 3); s > 0; s--) {
        subs.push({ x: meio + (Math.random() - .5) * .09, a: amp * (.25 + Math.random() * .5), w: .008 + Math.random() * .012 });
      }
      var pts = new Float32Array(PONTOS + 1);
      var ruido = 0;
      for (var k = 0; k <= PONTOS; k++) {
        var x = k / PONTOS;
        var d = (x - meio) / larg;
        var perto = .25 + .75 * Math.exp(-Math.pow((x - meio) / .22, 2));
        ruido = ruido * .55 + (Math.random() - .5) * .09;
        var v = amp * Math.exp(-d * d) + ruido * perto;
        for (var j = 0; j < subs.length; j++) {
          var d2 = (x - subs[j].x) / subs[j].w;
          v += subs[j].a * Math.exp(-d2 * d2);
        }
        pts[k] = v;
      }
      return pts;
    }

    function medir() {
      var caixa = hero.getBoundingClientRect();
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      L = caixa.width;
      A = caixa.height;
      tela.width = Math.round(L * dpr);
      tela.height = Math.round(A * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      lay = L >= 760
        ? { x0: .5, x1: .97, topo: .5, base: .9, ex: .735, ey: .27, n: 26, r: Math.max(4, A * .008), traco: 1.6 }
        : { x0: .06, x1: .94, topo: .16, base: .31, ex: .5, ey: .105, n: 15, r: 3.5, traco: 1.2 };
      degrade = ctx.createLinearGradient(L * lay.x0, 0, L * lay.x1, 0);
      degrade.addColorStop(0, "rgba(228,255,58,0)");
      degrade.addColorStop(.14, "rgba(228,255,58,1)");
      degrade.addColorStop(.86, "rgba(228,255,58,1)");
      degrade.addColorStop(1, "rgba(228,255,58,0)");
      while (linhas.length < lay.n + 1) linhas.unshift(novaLinha());
      while (linhas.length > lay.n + 1) linhas.shift();
      if (!rodando) desenhar(performance.now());
    }

    function feixes(c, f) {
      var ang = ANG0 + f * Math.PI * 2;
      var comp = Math.hypot(L, A) * .75;
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      for (var b = 0; b < 2; b++) {
        var a = ang + b * Math.PI;
        var g = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, comp);
        g.addColorStop(0, "rgba(228,255,58,.34)");
        g.addColorStop(.3, "rgba(228,255,58,.09)");
        g.addColorStop(1, "rgba(228,255,58,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(c.x, c.y);
        ctx.arc(c.x, c.y, comp, a - .07, a + .07);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(c.x, c.y);
        ctx.arc(c.x, c.y, comp, a - .012, a + .012);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }

    function registro(f) {
      var n = linhas.length;
      var topo = A * lay.topo, base = A * lay.base;
      var passo = (base - topo) / (lay.n - 1);
      var entrou = reduzir.matches ? 1 : 1 - Math.pow(1 - Math.min(1, f * 2.2), 3);
      var desloca = (1 - entrou) * passo;
      var x0 = L * lay.x0, larg = L * (lay.x1 - lay.x0);
      var alto = passo * 5;
      ctx.lineJoin = "round";
      for (var k = 0; k < n; k++) {
        var pts = linhas[k];
        var y = base - (n - 1 - k) * passo + desloca;
        var fundo = k / (n - 1);
        var alfa = .12 + .88 * Math.pow(fundo, 1.3);
        if (k === 0) alfa *= 1 - entrou;
        if (k === n - 1) alfa *= entrou;

        ctx.beginPath();
        tracar(pts, x0, larg, y, alto);
        ctx.lineTo(x0 + larg, y + passo);
        ctx.lineTo(x0, y + passo);
        ctx.closePath();
        ctx.fillStyle = "#08070d";
        ctx.fill();

        if (k === n - 1) {
          ctx.globalAlpha = alfa;
          ctx.strokeStyle = "#ff2d8a";
          ctx.lineWidth = lay.traco + 1;
          ctx.beginPath();
          tracar(pts, x0 + 3, larg, y + 3, alto);
          ctx.stroke();
        }
        ctx.globalAlpha = alfa;
        ctx.strokeStyle = degrade;
        ctx.lineWidth = k === n - 1 ? lay.traco + .8 : lay.traco;
        ctx.beginPath();
        tracar(pts, x0, larg, y, alto);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }

    function tracar(pts, x0, larg, y, alto) {
      for (var k = 0; k <= PONTOS; k++) {
        var px = x0 + (k / PONTOS) * larg;
        var py = y - pts[k] * alto;
        if (k) ctx.lineTo(px, py); else ctx.moveTo(px, py);
      }
    }

    function ondas(agora) {
      for (var k = aneis.length - 1; k >= 0; k--) {
        var a = aneis[k];
        var p = (agora - a.t) / a.dur;
        if (p >= 1) { aneis.splice(k, 1); continue; }
        ctx.strokeStyle = "rgba(" + a.cor + "," + ((1 - p) * .6).toFixed(3) + ")";
        ctx.lineWidth = 2.6 * (1 - p) + .4;
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.r0 + (1 - Math.pow(1 - p, 3)) * a.max, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    function estrela(c, f) {
      var brilho = reduzir.matches ? .35 : Math.exp(-f * 9);
      var r = c.r * (1 + brilho * .9);
      var halo = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, r * 16);
      halo.addColorStop(0, "rgba(228,255,58," + (.38 + brilho * .45).toFixed(3) + ")");
      halo.addColorStop(.22, "rgba(255,45,138," + (.1 + brilho * .14).toFixed(3) + ")");
      halo.addColorStop(1, "rgba(255,45,138,0)");
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(c.x, c.y, r * 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fbffe2";
      ctx.beginPath();
      ctx.arc(c.x, c.y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    function desenhar(agora) {
      var f = reduzir.matches ? .22 : fase(agora);
      suave.x += (mouse.x - suave.x) * .05;
      suave.y += (mouse.y - suave.y) * .05;
      var c = { x: L * lay.ex + (suave.x - .5) * 22, y: A * lay.ey + (suave.y - .5) * 14, r: lay.r };

      var n = Math.floor((agora - inicio) / PERIODO);
      if (n > ultima && !reduzir.matches) {
        ultima = n;
        linhas.push(novaLinha(forte));
        linhas.shift();
        forte = null;
        aneis.push({ x: c.x, y: c.y, r0: c.r, max: Math.max(L, A) * .5, t: agora, dur: 1700, cor: "228,255,58" });
      }

      ctx.fillStyle = "#08070d";
      ctx.fillRect(0, 0, L, A);
      var t = agora / 1000;
      ctx.fillStyle = "#ffffff";
      for (var k = 0; k < estrelas.length; k++) {
        var e = estrelas[k];
        ctx.globalAlpha = e.a * (reduzir.matches ? 1 : .55 + .45 * Math.sin(t * e.v + e.f));
        ctx.fillRect(e.x * L, e.y * A, e.r, e.r);
      }
      ctx.globalAlpha = 1;
      feixes(c, f);
      registro(f);
      ondas(agora);
      estrela(c, f);
    }

    function quadro(agora) {
      if (!rodando) return;
      desenhar(agora);
      requestAnimationFrame(quadro);
    }
    function ligar() {
      if (rodando || reduzir.matches) return;
      rodando = true;
      requestAnimationFrame(quadro);
    }
    function desligar() { rodando = false; }

    tela.addEventListener("pointerdown", function (ev) {
      if (reduzir.matches) return;
      var caixa = tela.getBoundingClientRect();
      var x = ev.clientX - caixa.left, y = ev.clientY - caixa.top;
      aneis.push({ x: x, y: y, r0: 2, max: Math.max(L, A) * .35, t: performance.now(), dur: 1200, cor: "255,45,138" });
      var rel = (x - L * lay.x0) / (L * (lay.x1 - lay.x0));
      forte = Math.min(.9, Math.max(.1, rel));
      avisarTodos("pulsar:clique");
    });
    window.addEventListener("pointermove", function (ev) {
      if (!heroNaTela || ev.pointerType !== "mouse") return;
      mouse.x = ev.clientX / window.innerWidth;
      mouse.y = ev.clientY / window.innerHeight;
    }, { passive: true });

    medir();
    if ("ResizeObserver" in window) new ResizeObserver(medir).observe(hero);
    else window.addEventListener("resize", medir);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) {
        heroNaTela = es[0].isIntersecting;
        if (heroNaTela) ligar(); else desligar();
      }).observe(hero);
    } else {
      ligar();
    }
    reduzir.addEventListener("change", function () {
      if (reduzir.matches) { desligar(); desenhar(performance.now()); } else if (heroNaTela) ligar();
    });
  });

  // ---------- a palavra PULSAR pula a cada batida ----------
  parte("palavra", function () {
    var letras = document.querySelectorAll(".letras > span");
    function pular() {
      if (reduzir.matches || !heroNaTela || document.hidden) return;
      letras.forEach(function (l) {
        l.classList.remove("bate");
        void l.offsetWidth;
        l.classList.add("bate");
      });
    }
    aoPulsar.push(pular);
    document.addEventListener("pulsar:clique", pular);
  });

  // ---------- quantas vezes o pulsar piscou desde que a pessoa chegou ----------
  parte("contador", function () {
    var numero = document.querySelector("[data-contador]");
    var vezes = document.querySelector("[data-vezes]");
    aoPulsar.push(function (n) {
      numero.textContent = n.toLocaleString("pt-BR");
      vezes.textContent = n === 1 ? "vez" : "vezes";
    });
  });

  // ---------- o som do pulsar: um estalo por batida, só se a pessoa ligar ----------
  parte("som", function () {
    var botao = document.querySelector(".som");
    var rotulo = botao.querySelector("[data-som-rotulo]");
    var ac = null, ruido = null, ligado = false;

    function estalo() {
      var t = ac.currentTime;
      var fonte = ac.createBufferSource();
      fonte.buffer = ruido;
      var filtro = ac.createBiquadFilter();
      filtro.type = "bandpass";
      filtro.frequency.value = 2400;
      filtro.Q.value = .8;
      var g = ac.createGain();
      g.gain.setValueAtTime(.45, t);
      g.gain.exponentialRampToValueAtTime(.001, t + .05);
      fonte.connect(filtro);
      filtro.connect(g);
      g.connect(ac.destination);
      fonte.start(t);
      fonte.stop(t + .06);

      var grave = ac.createOscillator();
      grave.frequency.setValueAtTime(150, t);
      grave.frequency.exponentialRampToValueAtTime(50, t + .12);
      var g2 = ac.createGain();
      g2.gain.setValueAtTime(.32, t);
      g2.gain.exponentialRampToValueAtTime(.001, t + .14);
      grave.connect(g2);
      g2.connect(ac.destination);
      grave.start(t);
      grave.stop(t + .15);
    }

    function definir(on) {
      ligado = on;
      botao.setAttribute("aria-pressed", String(on));
      rotulo.textContent = on ? "Silenciar o pulso" : "Ouvir o pulso";
    }

    botao.addEventListener("click", function () {
      if (!ac) {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) { rotulo.textContent = "Sem som neste navegador"; return; }
        ac = new AC();
        ruido = ac.createBuffer(1, Math.round(ac.sampleRate * .06), ac.sampleRate);
        var canal = ruido.getChannelData(0);
        for (var i = 0; i < canal.length; i++) canal[i] = Math.random() * 2 - 1;
      }
      ac.resume();
      definir(!ligado);
      if (ligado) estalo();
    });
    aoPulsar.push(function () { if (ligado && !document.hidden) estalo(); });
    document.addEventListener("pulsar:podcast-tocando", function () { if (ligado) definir(false); });
    document.addEventListener("pulsar:video-tocando", function () { if (ligado) definir(false); });
  });

  // ---------- pulsos: os cards de curiosidade ----------
  parte("pulsos", function () {
    var cards = Array.prototype.slice.call(document.querySelectorAll(".card:not(.convite)"));
    var surpresa = document.querySelector(".surpresa");

    function botaoDe(card) { return card.querySelector(".card-titulo button"); }

    function fechar(card) {
      card.classList.remove("aberto", "estoura");
      botaoDe(card).setAttribute("aria-expanded", "false");
      if (location.hash === "#" + card.id) history.replaceState(null, "", location.pathname + location.search);
    }

    function abrir(card, rolar) {
      var antes = card.getBoundingClientRect().top;
      cards.forEach(function (c) { if (c !== card && c.classList.contains("aberto")) fechar(c); });
      card.classList.add("aberto");
      botaoDe(card).setAttribute("aria-expanded", "true");
      if (!reduzir.matches) {
        card.classList.remove("estoura");
        void card.offsetWidth;
        card.classList.add("estoura");
      }
      history.replaceState(null, "", "#" + card.id);
      if (rolar) {
        card.scrollIntoView({ behavior: reduzir.matches ? "auto" : "smooth", block: "start" });
      } else {
        // o card vira linha inteira e pode mudar de lugar: rola junto pra ele ficar onde a pessoa clicou
        var depois = card.getBoundingClientRect().top;
        if (Math.abs(depois - antes) > 2) window.scrollBy(0, depois - antes);
      }
    }

    cards.forEach(function (card) {
      botaoDe(card).addEventListener("click", function () {
        if (card.classList.contains("aberto")) fechar(card); else abrir(card, false);
      });
      card.addEventListener("animationend", function (ev) {
        if (ev.target === card && ev.animationName === "estoura") card.classList.remove("estoura");
      });
      var comp = card.querySelector("button.card-compartilhar");
      comp.addEventListener("click", function () { compartilhar(card, comp); });
    });

    surpresa.addEventListener("click", function () {
      var fechados = cards.filter(function (c) { return !c.classList.contains("aberto"); });
      var sorteado = fechados[Math.floor(Math.random() * fechados.length)];
      abrir(sorteado, true);
      botaoDe(sorteado).focus({ preventScroll: true });
    });

    function peloEndereco() {
      var id = location.hash.slice(1);
      var card = id && document.getElementById(id);
      if (card && card.classList.contains("card") && !card.classList.contains("aberto")) abrir(card, true);
    }
    window.addEventListener("hashchange", peloEndereco);
    peloEndereco();

    function compartilhar(card, botao) {
      var url = location.origin + location.pathname + "#" + card.id;
      var titulo = botaoDe(card).textContent.trim();
      var texto = card.querySelector(".card-gancho").textContent.trim();
      if (navigator.share) {
        navigator.share({ title: titulo + " · Pulsar", text: texto, url: url }).catch(function () {});
        return;
      }
      copiar(url).then(function () { marcar(botao, "Link copiado!"); }, function () { marcar(botao, "Não deu pra copiar"); });
    }

    function copiar(texto) {
      if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(texto);
      return new Promise(function (ok, falha) {
        var campo = document.createElement("textarea");
        campo.value = texto;
        campo.setAttribute("readonly", "");
        campo.style.position = "fixed";
        campo.style.opacity = "0";
        document.body.appendChild(campo);
        campo.select();
        var deu = document.execCommand("copy");
        campo.remove();
        if (deu) ok(); else falha();
      });
    }

    function marcar(botao, texto) {
      var antes = botao.dataset.rotulo || botao.textContent;
      botao.dataset.rotulo = antes;
      botao.textContent = texto;
      clearTimeout(botao._volta);
      botao._volta = setTimeout(function () { botao.textContent = antes; }, 2200);
    }
  });

  // ---------- podcast: player próprio, com onda redonda que reage à voz ----------
  parte("podcast", function () {
    var raiz = document.querySelector(".player");
    var audio = document.querySelector(".player-audio");
    var play = raiz.querySelector(".player-play");
    var barra = raiz.querySelector(".player-barra");
    var atualEl = raiz.querySelector("[data-atual]");
    var totalEl = raiz.querySelector("[data-total]");
    var tituloEl = raiz.querySelector("[data-titulo]");
    var epEl = raiz.querySelector("[data-ep]");
    var aviso = raiz.querySelector(".player-aviso");
    var vel = raiz.querySelector(".player-vel");
    var eps = Array.prototype.slice.call(raiz.querySelectorAll(".ep"));
    var VELOCIDADES = [1, 1.25, 1.5, 2];
    var v = 0, atual = 0, carregado = -1, arrastando = false, alvo = null;
    var inteiros = {}, baixando = {};

    function relogio(s) {
      s = Math.max(0, Math.floor(s || 0));
      return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
    }
    function duracao() {
      if (carregado === atual && isFinite(audio.duration) && audio.duration > 0) return audio.duration;
      return parseFloat(eps[atual].dataset.dur);
    }
    function avisar(texto) { aviso.textContent = texto; }

    function tempo(t) {
      if (alvo !== null) t = alvo; // enquanto baixa pra pular, mostra onde a pessoa pediu
      var d = duracao();
      barra.max = Math.floor(d);
      if (!arrastando) barra.value = t;
      barra.style.setProperty("--p", (d ? Math.min(100, (barra.value / d) * 100) : 0) + "%");
      atualEl.textContent = relogio(arrastando ? barra.value : t);
      totalEl.textContent = relogio(d);
      barra.setAttribute("aria-valuetext", relogio(barra.value) + " de " + relogio(d));
    }

    function mostrar() {
      eps.forEach(function (ep, i) {
        if (i === atual) ep.setAttribute("aria-current", "true"); else ep.removeAttribute("aria-current");
      });
      tituloEl.textContent = eps[atual].querySelector(".ep-titulo").textContent;
      epEl.textContent = "EP " + String(atual + 1).padStart(2, "0") + " / " + String(eps.length).padStart(2, "0");
      tempo(carregado === atual ? audio.currentTime : 0);
      sessao();
    }

    function carregar(i) {
      atual = i;
      carregado = i;
      alvo = null;
      audio.src = inteiros[i] || eps[i].dataset.src;
      audio.defaultPlaybackRate = audio.playbackRate = VELOCIDADES[v];
      avisar("");
      mostrar();
    }

    function tocar() {
      if (carregado !== atual) carregar(atual);
      ligarAnalise();
      var p = audio.play();
      if (p && p.catch) p.catch(function (e) { if (e.name !== "AbortError") avisar("Não consegui tocar agora. Tenta de novo."); });
    }

    function noBuffer(t) {
      var b = audio.buffered;
      for (var k = 0; k < b.length; k++) if (t >= b.start(k) && t <= b.end(k)) return true;
      return false;
    }

    // O servidor dos áudios não aceita pedir só um pedaço do arquivo, então só dá pra pular
    // dentro do que já baixou. Pra ir além, baixa o episódio inteiro uma vez e toca da memória.
    function baixarInteiro(i) {
      if (inteiros[i]) return Promise.resolve(inteiros[i]);
      if (baixando[i]) return baixando[i];
      avisar("Baixando o episódio inteiro pra liberar o avanço (o servidor do áudio não deixa pular direto pro meio)…");
      // no-store: sem isso o Chrome espera o <audio> largar o mesmo arquivo no cache (até uns 20 s)
      baixando[i] = fetch(eps[i].dataset.src, { cache: "no-store" })
        .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.blob(); })
        .then(function (blob) { inteiros[i] = URL.createObjectURL(blob); avisar(""); return inteiros[i]; })
        .catch(function (erro) {
          delete baixando[i];
          avisar("Não consegui baixar o episódio pra pular. Tenta de novo.");
          throw erro;
        });
      return baixando[i];
    }

    function pularPara(t) {
      t = Math.max(0, Math.min(duracao() - .5, t));
      if (carregado === atual && (inteiros[atual] || noBuffer(t))) {
        audio.currentTime = t;
        tempo(t);
        return;
      }
      var i = atual, tocava = !audio.paused;
      alvo = t;
      tempo(t);
      baixarInteiro(i).then(function (url) {
        if (atual !== i) { alvo = null; return; }
        carregado = i;
        audio.src = url;
        audio.defaultPlaybackRate = audio.playbackRate = VELOCIDADES[v];
        audio.addEventListener("loadedmetadata", function () {
          audio.currentTime = alvo !== null ? alvo : t;
          alvo = null;
          if (tocava) tocar();
        }, { once: true });
      }, function () { alvo = null; tempo(audio.currentTime); });
    }

    play.addEventListener("click", function () { if (audio.paused) tocar(); else audio.pause(); });
    eps.forEach(function (ep, i) {
      ep.addEventListener("click", function () {
        if (i === atual && carregado === i) { if (audio.paused) tocar(); else audio.pause(); return; }
        carregar(i);
        tocar();
      });
    });
    raiz.querySelectorAll("[data-pular]").forEach(function (b) {
      b.addEventListener("click", function () {
        var agora = carregado === atual ? audio.currentTime : 0;
        pularPara(agora + parseFloat(b.dataset.pular));
      });
    });
    barra.addEventListener("input", function () { arrastando = true; tempo(carregado === atual ? audio.currentTime : 0); });
    barra.addEventListener("change", function () { arrastando = false; pularPara(parseFloat(barra.value)); });
    vel.addEventListener("click", function () {
      v = (v + 1) % VELOCIDADES.length;
      audio.defaultPlaybackRate = audio.playbackRate = VELOCIDADES[v];
      var rot = String(VELOCIDADES[v]).replace(".", ",") + "×";
      vel.textContent = rot;
      vel.setAttribute("aria-label", "Velocidade: " + rot);
    });

    audio.addEventListener("play", function () {
      raiz.dataset.estado = "tocando";
      play.setAttribute("aria-label", "Pausar episódio");
      avisarTodos("pulsar:podcast-tocando");
    });
    audio.addEventListener("pause", function () {
      raiz.dataset.estado = "parado";
      play.setAttribute("aria-label", "Ouvir episódio");
    });
    audio.addEventListener("timeupdate", function () { tempo(audio.currentTime); });
    audio.addEventListener("loadedmetadata", function () { tempo(audio.currentTime); });
    audio.addEventListener("waiting", function () { if (!aviso.textContent) avisar("Carregando…"); });
    audio.addEventListener("playing", function () { if (aviso.textContent === "Carregando…") avisar(""); });
    audio.addEventListener("ended", function () {
      if (atual < eps.length - 1) { carregar(atual + 1); tocar(); }
    });
    audio.addEventListener("error", function () {
      if (!audio.getAttribute("src")) return;
      raiz.dataset.estado = "parado";
      avisar("Não consegui carregar o áudio agora. Tenta de novo daqui a pouco.");
    });

    function sessao() {
      if (!("mediaSession" in navigator) || typeof MediaMetadata === "undefined") return;
      navigator.mediaSession.metadata = new MediaMetadata({
        title: tituloEl.textContent,
        artist: "Pulsar · voz gerada por IA",
        album: "Podcast Pulsar"
      });
    }
    if ("mediaSession" in navigator) {
      var acoes = {
        play: tocar,
        pause: function () { audio.pause(); },
        seekbackward: function () { pularPara(audio.currentTime - 15); },
        seekforward: function () { pularPara(audio.currentTime + 15); },
        previoustrack: function () { if (atual > 0) { carregar(atual - 1); tocar(); } },
        nexttrack: function () { if (atual < eps.length - 1) { carregar(atual + 1); tocar(); } }
      };
      Object.keys(acoes).forEach(function (nome) {
        try { navigator.mediaSession.setActionHandler(nome, acoes[nome]); } catch (e) { /* ação não suportada */ }
      });
    }

    // onda redonda: barras em volta do botão, puxadas pela voz quando há análise de áudio
    var ctxAudio = null, analisador = null, dados = null;
    function ligarAnalise() {
      if (ctxAudio) { ctxAudio.resume(); return; }
      try {
        var AC = window.AudioContext || window.webkitAudioContext;
        ctxAudio = new AC();
        var fonte = ctxAudio.createMediaElementSource(audio);
        analisador = ctxAudio.createAnalyser();
        analisador.fftSize = 256;
        analisador.smoothingTimeConstant = .8;
        fonte.connect(analisador);
        analisador.connect(ctxAudio.destination);
        dados = new Uint8Array(analisador.frequencyBinCount);
      } catch (e) {
        analisador = null;
      }
    }

    var tela = raiz.querySelector(".player-onda");
    var ctx = tela.getContext("2d");
    var lado = 0, naTela = false, rodando = false, ondaT = -1;
    function medir() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      lado = tela.getBoundingClientRect().width;
      tela.width = tela.height = Math.round(lado * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      desenhar(performance.now());
    }
    function desenhar(agora) {
      if (!lado) return;
      ctx.clearRect(0, 0, lado, lado);
      var c = lado / 2, r0 = lado * .2, aro = r0 * 1.12;
      var N = 72;
      var f = reduzir.matches ? .5 : fase(agora);
      var batida = reduzir.matches ? 0 : Math.exp(-f * 6);
      var vivo = analisador && !audio.paused;
      if (vivo) analisador.getByteFrequencyData(dados);

      if (!reduzir.matches && !vivo) {
        // em repouso, uma onda sai a cada batida do pulsar
        var p = f;
        ctx.strokeStyle = "rgba(228,255,58," + ((1 - p) * .45).toFixed(3) + ")";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(c, c, aro + p * (c - aro - 2), 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.lineCap = "round";
      ctx.lineWidth = Math.max(2, (Math.PI * 2 * aro / N) * .5);
      for (var k = 0; k < N; k++) {
        var meia = k < N / 2 ? k : N - 1 - k;
        var valor;
        if (vivo) valor = dados[1 + Math.floor(meia / (N / 2) * 34)] / 255;
        else valor = .1 + .08 * (.5 + .5 * Math.sin(k * .9 + agora / 900 * (reduzir.matches ? 0 : 1))) + batida * .18;
        var ang = (k / N) * Math.PI * 2 - Math.PI / 2;
        var comp = r0 * .1 + valor * r0 * 1.15;
        var cos = Math.cos(ang), sen = Math.sin(ang);
        ctx.strokeStyle = valor > .72 ? "#ff2d8a" : "rgba(228,255,58," + (.35 + valor * .65).toFixed(3) + ")";
        ctx.beginPath();
        ctx.moveTo(c + cos * aro, c + sen * aro);
        ctx.lineTo(c + cos * (aro + comp), c + sen * (aro + comp));
        ctx.stroke();
      }
    }
    function laco(agora) {
      if (!rodando) return;
      desenhar(agora);
      requestAnimationFrame(laco);
    }
    function conferir() {
      var deve = naTela && !document.hidden && !reduzir.matches;
      if (deve && !rodando) { rodando = true; requestAnimationFrame(laco); }
      if (!deve) rodando = false;
    }
    medir();
    if ("ResizeObserver" in window) new ResizeObserver(medir).observe(tela);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) { naTela = es[0].isIntersecting; conferir(); }).observe(tela);
    }
    document.addEventListener("visibilitychange", conferir);
    reduzir.addEventListener("change", function () { conferir(); desenhar(performance.now()); });
    audio.addEventListener("play", function () { if (reduzir.matches) desenhar(performance.now()); });
  });

  // ---------- vídeos: um som de cada vez (vídeo, podcast e o estalo do pulsar não se atropelam) ----------
  parte("vídeos", function () {
    var videos = Array.prototype.slice.call(document.querySelectorAll(".celular-video"));
    var podcast = document.querySelector(".player-audio");
    videos.forEach(function (video) {
      video.addEventListener("play", function () {
        if (podcast && !podcast.paused) podcast.pause();
        videos.forEach(function (outro) { if (outro !== video && !outro.paused) outro.pause(); });
        avisarTodos("pulsar:video-tocando");
      });
    });
    document.addEventListener("pulsar:podcast-tocando", function () {
      videos.forEach(function (video) { if (!video.paused) video.pause(); });
    });
  });
})();
