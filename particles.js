/* ============================================================
   MAJUL AI · Fondos en movimiento
   - [data-fx-net="dark|light"]  : red de partículas (efecto 01)
   - [data-fx-rain="dark|light"] : lluvia de datos   (efecto 05)
   dark  = trazos claros (fondos navy) · light = trazos navy (fondos claros)
   Respeta "reducir movimiento" y se pausa con la pestaña oculta.
   ============================================================ */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var netHosts = document.querySelectorAll('[data-fx-net]');
  var rainHosts = document.querySelectorAll('[data-fx-rain]');
  if (!netHosts.length && !rainHosts.length) return;

  var st = document.createElement('style');
  st.textContent =
    '[data-fx-net],[data-fx-rain]{position:relative;overflow:hidden}' +
    '[data-fx-net]>.fx-canvas,[data-fx-rain]>.fx-canvas{position:absolute;inset:0;width:100%;height:100%;z-index:0;pointer-events:none}' +
    '[data-fx-net]>.wrap,[data-fx-rain]>.wrap{position:relative;z-index:1}';
  document.head.appendChild(st);

  function palette(theme) {
    return theme === 'dark'
      ? { dot: 'rgba(160,202,244,', line: 'rgba(120,196,240,', lm: 1 }
      : { dot: 'rgba(32,52,122,',  line: 'rgba(40,92,172,',   lm: 3 };
  }

  var instances = [];
  var DPR = Math.min(2, window.devicePixelRatio || 1);

  function makeCanvas(host) {
    var canvas = document.createElement('canvas');
    canvas.className = 'fx-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    host.insertBefore(canvas, host.firstChild);
    return canvas;
  }

  /* ---------- efecto 01 · red de partículas ---------- */
  netHosts.forEach(function (host) {
    var C = palette(host.getAttribute('data-fx-net') === 'dark' ? 'dark' : 'light');
    var canvas = makeCanvas(host), ctx = canvas.getContext('2d');
    var W = 0, H = 0, pts = [], m = { x: -9999, y: -9999 };

    function seed() {
      var n = Math.min(64, Math.round(W * H / 17000));
      pts = [];
      for (var i = 0; i < n; i++) {
        pts.push({ x: Math.random() * W, y: Math.random() * H,
                   vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35 });
      }
    }
    function resize() {
      var r = host.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = W * DPR; canvas.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      seed();
    }
    function frame() {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, 1.7, 0, 6.283);
        ctx.fillStyle = C.dot + '.85)'; ctx.fill();
      }
      for (var a = 0; a < pts.length; a++) {
        for (var b = a + 1; b < pts.length; b++) {
          var dx = pts[a].x - pts[b].x, dy = pts[a].y - pts[b].y, d = dx * dx + dy * dy;
          if (d < 19000) {
            ctx.beginPath(); ctx.moveTo(pts[a].x, pts[a].y); ctx.lineTo(pts[b].x, pts[b].y);
            ctx.strokeStyle = C.line + (C.lm * .16 * (1 - d / 19000)) + ')';
            ctx.lineWidth = 1; ctx.stroke();
          }
        }
        var mx = pts[a].x - m.x, my = pts[a].y - m.y, md = mx * mx + my * my;
        if (md < 28000) {
          ctx.beginPath(); ctx.moveTo(pts[a].x, pts[a].y); ctx.lineTo(m.x, m.y);
          ctx.strokeStyle = C.dot + (.42 * (1 - md / 28000)) + ')';
          ctx.lineWidth = 1; ctx.stroke();
        }
      }
    }
    host.addEventListener('pointermove', function (e) {
      var r = host.getBoundingClientRect(); m.x = e.clientX - r.left; m.y = e.clientY - r.top;
    });
    host.addEventListener('pointerleave', function () { m.x = m.y = -9999; });
    resize();
    window.addEventListener('resize', resize);
    instances.push(frame);
    if (reduce) frame();
  });

  /* ---------- efecto 05 · lluvia de datos ---------- */
  rainHosts.forEach(function (host) {
    var C = palette(host.getAttribute('data-fx-rain') === 'dark' ? 'dark' : 'light');
    var canvas = makeCanvas(host), ctx = canvas.getContext('2d');
    var W = 0, H = 0, cols = [], glyphs = '01<>{}[]/=+*ABCDEF', fs = 15;

    function seed() {
      var n = Math.floor(W / fs);
      cols = [];
      for (var i = 0; i < n; i++) cols.push({ y: Math.random() * H, sp: .6 + Math.random() * 1.4 });
    }
    function resize() {
      var r = host.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = W * DPR; canvas.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      seed();
    }
    function frame() {
      ctx.clearRect(0, 0, W, H);
      ctx.font = fs + 'px monospace';
      for (var i = 0; i < cols.length; i++) {
        var c = cols[i];
        c.y += c.sp;
        if (c.y > H + fs) { c.y = -fs * Math.random() * 8; c.sp = .6 + Math.random() * 1.4; }
        ctx.fillStyle = C.dot + '.85)';
        ctx.fillText(glyphs[(Math.random() * glyphs.length) | 0], i * fs + 2, c.y);
        ctx.fillStyle = C.line + (C.lm * .12) + ')';
        ctx.fillText(glyphs[(Math.random() * glyphs.length) | 0], i * fs + 2, c.y - fs * 3);
      }
    }
    resize();
    window.addEventListener('resize', resize);
    instances.push(frame);
    if (reduce) frame();
  });

  if (!reduce) {
    var on = true;
    document.addEventListener('visibilitychange', function () { on = !document.hidden; });
    (function tick() {
      if (on) for (var i = 0; i < instances.length; i++) instances[i]();
      requestAnimationFrame(tick);
    })();
  }
})();
