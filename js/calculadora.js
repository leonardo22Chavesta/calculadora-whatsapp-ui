// Cálculo en tiempo real, resumen y texto para WhatsApp
(function () {
  var DEFAULTS = {
    'n-leads': 300, 'n-leadsmsg': 6,
    'n-rec': 250, 'n-recmsg': 6,
    'n-rem': 400, 'n-mkt': 1000,
    'n-fx': 3.75,
    'p-svc': 0.03, 'p-util': 0.03, 'p-mkt': 0.07, 'p-free': 1000
  };
  var SLIDERS = [['r-leads', 'n-leads'], ['r-rec', 'n-rec'], ['r-rem', 'n-rem'], ['r-mkt', 'n-mkt']];

  // Partidas del resumen; también las usa captura.js
  var ROWS = [
    { key: 'cLeads', icon: '📣', label: 'Leads de anuncios', color: '#E3A1B5' },
    { key: 'cRec', icon: '💬', label: 'Clientes recurrentes', color: '#721833' },
    { key: 'cRem', icon: '⏰', label: 'Recordatorios', color: '#B0506B' },
    { key: 'cMkt', icon: '🚀', label: 'Campañas', color: '#000000' }
  ];

  var $ = function (id) { return document.getElementById(id); };
  function val(id) { var v = parseFloat($(id).value); return isFinite(v) && v > 0 ? v : 0; }
  function int(n) { return Math.round(n).toLocaleString('es-PE'); }
  function money(n) { return n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function usd(n) { return 'US$ ' + money(n); }
  function pen(n) { return 'S/ ' + money(n); }

  function paintSlider(r) {
    var pct = (r.value - r.min) / (r.max - r.min) * 100;
    r.style.setProperty('--fill', Math.min(100, pct) + '%');
  }

  function setDefaults() {
    Object.keys(DEFAULTS).forEach(function (id) { $(id).value = DEFAULTS[id]; });
    SLIDERS.forEach(function (p) { $(p[0]).value = DEFAULTS[p[1]]; paintSlider($(p[0])); });
  }

  SLIDERS.forEach(function (p) {
    var r = $(p[0]), n = $(p[1]);
    r.addEventListener('input', function () { n.value = r.value; paintSlider(r); calc(); });
    n.addEventListener('input', function () {
      var v = val(p[1]);
      if (v > +r.max) r.max = Math.ceil(v / 100) * 100;
      r.value = v; paintSlider(r); calc();
    });
  });
  ['n-leadsmsg', 'n-recmsg', 'n-fx', 'p-svc', 'p-util', 'p-mkt', 'p-free'].forEach(function (id) {
    $(id).addEventListener('input', calc);
  });
  $('btn-reset').addEventListener('click', function () { setDefaults(); calc(); });

  var state = {};

  function calc() {
    var fx = val('n-fx'), svc = val('p-svc'), util = val('p-util'), mkt = val('p-mkt'), free = val('p-free');

    var leads = val('n-leads'), leadMsgs = leads * val('n-leadsmsg');
    var rec = val('n-rec'), recMsgs = rec * val('n-recmsg');
    var recFree = Math.min(recMsgs, free), recPaid = Math.max(0, recMsgs - free);
    var rem = val('n-rem'), camp = val('n-mkt');

    var cRec = recPaid * svc, cRem = rem * util, cMkt = camp * mkt;
    var total = cRec + cRem + cMkt;
    var saved = (leadMsgs + recFree) * svc;

    state = {
      fx: fx, util: util, mkt: mkt,
      leads: leads, leadMsgs: leadMsgs, rec: rec, recMsgs: recMsgs, recFree: recFree, recPaid: recPaid,
      rem: rem, camp: camp, cLeads: 0, cRec: cRec, cRem: cRem, cMkt: cMkt, total: total, saved: saved,
      totalMsgs: leadMsgs + recMsgs + rem + camp, paidMsgs: recPaid + rem + camp
    };

    $('m-leads').innerHTML = int(leads) + ' leads × ' + int(val('n-leadsmsg')) + ' mensajes = <b class="text-ink">' + int(leadMsgs) + ' mensajes</b> · <span class="text-emerald-700 font-semibold">S/ 0.00</span>';
    $('m-rec').innerHTML = int(recMsgs) + ' mensajes · <b class="text-ink">' + int(recFree) + '</b> gratis y <b class="text-ink">' + int(recPaid) + '</b> cobrados = <b class="text-ink">' + pen(cRec * fx) + '</b>';
    $('m-rem').innerHTML = int(rem) + ' × ' + usd(util) + ' = <b class="text-ink">' + pen(cRem * fx) + '</b> <span class="text-slate-400">(' + usd(cRem) + ')</span>';
    $('m-mkt').innerHTML = int(camp) + ' × ' + usd(mkt) + ' = <b class="text-ink">' + pen(cMkt * fx) + '</b> <span class="text-slate-400">(' + usd(cMkt) + ')</span>';

    var usedPct = free > 0 ? Math.min(100, recMsgs / free * 100) : 100;
    $('free-bar').style.width = usedPct + '%';
    $('free-bar').style.background = recMsgs > free ? '#000000' : '#721833';
    $('free-pct').textContent = int(recFree) + ' / ' + int(free);

    $('t-pen').textContent = pen(total * fx);
    $('t-usd').textContent = usd(total) + ' · T.C. ' + fx.toFixed(2);
    $('b-pen').textContent = pen(total * fx);
    $('b-usd').textContent = usd(total) + ' · ver detalle';
    $('t-save').textContent = 'Te ahorras ' + pen(saved * fx) + ' (' + usd(saved) + ') con ' + int(leadMsgs + recFree) + ' mensajes sin costo.';
    $('t-msgs').textContent = int(state.totalMsgs);
    $('t-paid').textContent = int(state.paidMsgs);

    var max = Math.max(total, 0.0001);
    $('lines').innerHTML = ROWS.map(function (r) {
      var c = state[r.key];
      return '<div>' +
        '<div class="flex justify-between items-baseline gap-3 text-[13px]">' +
          '<span class="text-slate-600">' + r.icon + ' ' + r.label + '</span>' +
          '<span class="font-bold tabular">' + (r.key === 'cLeads' ? '<span class="text-emerald-700">Gratis</span>' : pen(c * fx)) + '</span>' +
        '</div>' +
        '<div class="mt-1.5 h-1.5 bg-slate-100 rounded-full overflow-hidden"><div class="bar h-full rounded-full" style="width:' + (c / max * 100) + '%;background:' + r.color + '"></div></div>' +
      '</div>';
    }).join('');
  }

  function cliente() { return $('n-cliente').value.trim(); }

  function proposal() {
    var s = state, c = cliente();
    return [
      '*📊 Presupuesto WhatsApp API · Busset Agency*',
      c ? '👤 Cliente: *' + c + '*' : null,
      '_Estimado mensual de costos de Meta (Perú)_',
      '',
      '📣 *Leads de anuncios:* ' + int(s.leads) + ' leads (' + int(s.leadMsgs) + ' mensajes)',
      '   → Gratis ✅ (ventana de 72 h)',
      '',
      '💬 *Clientes recurrentes:* ' + int(s.recMsgs) + ' mensajes',
      '   → ' + int(s.recFree) + ' gratis + ' + int(s.recPaid) + ' cobrados = ' + pen(s.cRec * s.fx),
      '',
      '⏰ *Recordatorios:* ' + int(s.rem) + ' mensajes',
      '   → ' + pen(s.cRem * s.fx),
      '',
      '🚀 *Campañas:* ' + int(s.camp) + ' mensajes',
      '   → ' + pen(s.cMkt * s.fx),
      '',
      '━━━━━━━━━━━━━━',
      '💰 *TOTAL MENSUAL: ' + pen(s.total * s.fx) + '*',
      '💵 Equivalente: ' + usd(s.total),
      '✨ Ahorro por mensajes gratuitos: ' + pen(s.saved * s.fx),
      '',
      '_Tipo de cambio: S/ ' + s.fx.toFixed(2) + ' por US$. Tarifas referenciales de Meta, sujetas a cambio._'
    ].filter(function (l) { return l !== null; }).join('\n');
  }

  function toast(msg) {
    var t = $('toast');
    t.textContent = msg;
    t.classList.remove('opacity-0');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { t.classList.add('opacity-0'); }, 2200);
  }

  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text; ta.setAttribute('readonly', '');
    ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
    toast(ok ? '✅ ¡Texto copiado!' : '⚠️ No se pudo copiar');
  }

  document.querySelectorAll('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      var text = proposal();
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(function () { toast('✅ ¡Texto copiado!'); }, function () { fallbackCopy(text); });
      } else {
        fallbackCopy(text);
      }
    });
  });

  setDefaults();
  calc();

  window.Calculadora = {
    getState: function () { return state; },
    cliente: cliente,
    ROWS: ROWS,
    fmt: { int: int, usd: usd, pen: pen },
    toast: toast
  };
})();
