/* Strato Lab — constellation background.
   Small dependency-free particle network drawn on #constellation.
   Respects prefers-reduced-motion (renders one static frame, no loop)
   and pauses while the tab is hidden. */
(function () {
  "use strict";

  var canvas = document.getElementById("constellation");
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext("2d");

  var reduceMotion = window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var LINK_DIST = 140;     // px: draw a line between points closer than this
  var AREA_PER_PT = 15000; // px^2 per point
  var MIN_PTS = 24;
  var MAX_PTS = 90;

  var points = [];
  var rafId = null;

  function seed() {
    var w = canvas.clientWidth;
    var h = canvas.clientHeight;

    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var count = Math.round((w * h) / AREA_PER_PT);
    count = Math.max(MIN_PTS, Math.min(count, MAX_PTS));

    points = [];
    for (var i = 0; i < count; i++) {
      points.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18
      });
    }
  }

  function draw() {
    var w = canvas.clientWidth;
    var h = canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);

    var i, a, b, dx, dy, dist;

    for (i = 0; i < points.length; i++) {
      var p = points[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.x <= 0 || p.x >= w) p.vx *= -1;
      if (p.y <= 0 || p.y >= h) p.vy *= -1;
    }

    for (a = 0; a < points.length; a++) {
      for (b = a + 1; b < points.length; b++) {
        dx = points[a].x - points[b].x;
        dy = points[a].y - points[b].y;
        dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < LINK_DIST) {
          ctx.strokeStyle =
            "rgba(120,150,235," + (0.32 * (1 - dist / LINK_DIST)).toFixed(3) + ")";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(points[a].x, points[a].y);
          ctx.lineTo(points[b].x, points[b].y);
          ctx.stroke();
        }
      }
    }

    ctx.fillStyle = "rgba(200,214,255,0.9)";
    for (i = 0; i < points.length; i++) {
      ctx.beginPath();
      ctx.arc(points[i].x, points[i].y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function loop() {
    draw();
    rafId = window.requestAnimationFrame(loop);
  }

  function start() {
    if (rafId === null && !reduceMotion) loop();
  }

  function stop() {
    if (rafId !== null) {
      window.cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  var resizeTimer = null;
  window.addEventListener("resize", function () {
    if (resizeTimer) window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(function () {
      seed();
      if (reduceMotion) draw();
    }, 150);
  });

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stop();
    else start();
  });

  seed();
  if (reduceMotion) draw();
  else start();
})();
