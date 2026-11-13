/* Seettu Circle — marketing site */
(function () {
  'use strict';

  // Paste the store listing URLs here once the app is published.
  // While a link is empty, its button reads "Coming soon".
  var STORE_LINKS = {
    android: '', // e.g. https://play.google.com/store/apps/details?id=com.seettucircle.app
    ios: '', // e.g. https://apps.apple.com/app/id0000000000
  };
  var STORE_LABELS = { android: 'Get it on', ios: 'Download on the' };

  document.documentElement.classList.add('js');

  Object.keys(STORE_LINKS).forEach(function (key) {
    var link = document.querySelector('[data-store="' + key + '"]');
    if (!link || !STORE_LINKS[key]) return;
    link.href = STORE_LINKS[key];
    link.rel = 'noopener';
    link.removeAttribute('aria-disabled');
    link.querySelector('small').textContent = STORE_LABELS[key];
  });

  document.getElementById('year').textContent = new Date().getFullYear();

  // Trust score dots: 24 cycles, 22 on time.
  var dots = document.getElementById('trustDots');
  if (dots) {
    for (var d = 0; d < 24; d++) {
      var dot = document.createElement('i');
      if (d === 6) dot.className = 'd-late';
      if (d === 15) dot.className = 'd-miss';
      dots.appendChild(dot);
    }
  }

  // ---- The circle: members take the pool in turn ----
  var SVG = 'http://www.w3.org/2000/svg';
  var nodes = document.getElementById('ringNodes');
  var inMembers = document.getElementById('inMembers');
  var inAmount = document.getElementById('inAmount');
  var toggle = document.getElementById('ringToggle');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cycle = 1;
  var playing = !reduceMotion;
  var timer = null;

  function rupees(n) {
    return 'Rs. ' + n.toLocaleString('en-US');
  }
  function frequency() {
    return document.querySelector('input[name="freq"]:checked').value;
  }

  function build() {
    var n = Number(inMembers.value);
    var small = n > 14;
    nodes.textContent = '';
    for (var i = 0; i < n; i++) {
      var angle = (i / n) * Math.PI * 2 - Math.PI / 2;
      var g = document.createElementNS(SVG, 'g');
      g.setAttribute('class', 'ring__node');
      g.setAttribute('transform', 'translate(' + (180 + 138 * Math.cos(angle)).toFixed(1) + ' ' + (180 + 138 * Math.sin(angle)).toFixed(1) + ')');
      var c = document.createElementNS(SVG, 'circle');
      c.setAttribute('r', small ? 13 : 16);
      var t = document.createElementNS(SVG, 'text');
      t.textContent = i + 1;
      g.appendChild(c);
      g.appendChild(t);
      nodes.appendChild(g);
    }
    if (cycle > n) cycle = 1;
    paint();
  }

  function paint() {
    var n = Number(inMembers.value);
    var amount = Number(inAmount.value);

    Array.prototype.forEach.call(nodes.children, function (g, i) {
      g.classList.toggle('is-done', i + 1 < cycle);
      g.classList.toggle('is-now', i + 1 === cycle);
    });

    document.getElementById('outMembers').textContent = n;
    document.getElementById('outAmount').textContent = rupees(amount);
    document.getElementById('ringCycle').textContent = 'Cycle ' + cycle + ' of ' + n;
    document.getElementById('ringPool').textContent = rupees(n * amount);
    document.getElementById('ringWho').textContent = 'goes to member ' + cycle;
  }

  // Kept apart from paint() so screen readers only hear it when the inputs change.
  function summarise() {
    var n = Number(inMembers.value);
    var amount = Number(inAmount.value);
    var unit = frequency();
    document.getElementById('calcSum').innerHTML =
      'Each ' + unit + ', one member receives <b>' + rupees(n * amount) + '</b>. ' +
      'The seettu runs for <b>' + n + ' ' + unit + 's</b>, and everyone pays in <b>' + rupees(n * amount) + '</b> over that time.';
  }

  function tick() {
    cycle = cycle >= Number(inMembers.value) ? 1 : cycle + 1;
    paint();
  }
  function setPlaying(on) {
    playing = on;
    clearInterval(timer);
    if (on) timer = setInterval(tick, 1600);
    toggle.textContent = on ? 'Pause' : reduceMotion ? 'Next cycle' : 'Play';
    toggle.setAttribute('aria-pressed', String(on));
  }

  if (nodes) {
    inMembers.addEventListener('input', function () { build(); summarise(); });
    inAmount.addEventListener('input', function () { paint(); summarise(); });
    Array.prototype.forEach.call(document.querySelectorAll('input[name="freq"]'), function (r) {
      r.addEventListener('change', summarise);
    });
    toggle.addEventListener('click', function () {
      if (reduceMotion) return tick();
      setPlaying(!playing);
    });
    build();
    summarise();
    setPlaying(playing);
  }

  // ---- Reveal on scroll ----
  var targets = document.querySelectorAll('.circle > *, .steps li, .feat > *, .faq > *, .cta__in > *');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        });
      },
      { rootMargin: '0px 0px -8% 0px' }
    );
    Array.prototype.forEach.call(targets, function (el) {
      el.classList.add('reveal');
      io.observe(el);
    });
  }
})();
