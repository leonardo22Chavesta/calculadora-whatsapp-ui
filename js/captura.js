// Genera una imagen con el logo de Busset Agency para compartir el presupuesto
(function () {
  var C = window.Calculadora, f = C.fmt;
  var $ = function (id) { return document.getElementById(id); };
  var BRAND = '#721833', ROSE = '#E3A1B5', SOFT = '#F8EDF1';
  var current = null; // { blob, url, name }

  function esc(s) {
    return s.replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function detail(s, key) {
    if (key === 'cLeads') return f.int(s.leads) + ' leads · ' + f.int(s.leadMsgs) + ' mensajes';
    if (key === 'cRec') return f.int(s.recMsgs) + ' mensajes · ' + f.int(s.recFree) + ' gratis';
    if (key === 'cRem') return f.int(s.rem) + ' mensajes';
    return f.int(s.camp) + ' mensajes';
  }

  function buildCard() {
    var s = C.getState(), cliente = C.cliente();
    var fecha = new Date().toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' });

    var rows = C.ROWS.map(function (r, i) {
      var amount = r.key === 'cLeads'
        ? '<span style="color:#047857">Gratis</span>'
        : f.pen(s[r.key] * s.fx);
      return '<div style="display:flex;align-items:center;gap:12px;padding:12px 0;' + (i ? 'border-top:1px solid #F1F5F9;' : '') + '">' +
          '<div style="width:36px;height:36px;border-radius:10px;background:' + SOFT + ';display:flex;align-items:center;justify-content:center;font-size:17px;">' + r.icon + '</div>' +
          '<div style="flex:1;min-width:0;">' +
            '<div style="font-size:14px;font-weight:700;">' + r.label + '</div>' +
            '<div style="font-size:12px;color:#64748B;">' + detail(s, r.key) + '</div>' +
          '</div>' +
          '<div style="font-size:15px;font-weight:800;">' + amount + '</div>' +
        '</div>';
    }).join('');

    return '<div id="captura" style="width:420px;background:#FFFFFF;color:#000000;font-family:Inter,system-ui,sans-serif;">' +
      '<div style="height:6px;background:' + BRAND + ';"></div>' +
      '<div style="display:flex;align-items:center;gap:16px;padding:22px 28px 18px;">' +
        '<img id="captura-logo" src="' + window.BUSSET_LOGO + '" style="height:78px;width:auto;">' +
        '<div>' +
          '<div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:' + BRAND + ';">Presupuesto mensual</div>' +
          '<div style="font-size:21px;font-weight:800;line-height:1.2;">WhatsApp API · Perú</div>' +
          '<div style="font-size:12px;color:#64748B;margin-top:2px;">' + fecha + '</div>' +
        '</div>' +
      '</div>' +
      (cliente
        ? '<div style="margin:0 28px 14px;padding:10px 14px;border:1px solid #E2E8F0;border-radius:12px;font-size:13px;color:#475569;">Preparado para <b style="color:#000;">' + esc(cliente) + '</b></div>'
        : '') +
      '<div style="margin:0 28px;padding:22px;border-radius:20px;background:' + BRAND + ';color:#FFFFFF;">' +
        '<div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:' + ROSE + ';">Inversión mensual estimada</div>' +
        '<div style="font-size:40px;font-weight:800;line-height:1.3;margin-top:4px;">' + f.pen(s.total * s.fx) + '</div>' +
        '<div style="font-size:13px;color:#F3D3DD;margin-top:6px;">' + f.usd(s.total) + ' · T.C. ' + s.fx.toFixed(2) + '</div>' +
      '</div>' +
      '<div style="padding:10px 28px 4px;">' + rows + '</div>' +
      '<div style="margin:0 28px;padding:12px 14px;border-radius:12px;background:' + SOFT + ';font-size:13px;color:' + BRAND + ';">' +
        '✨ Ahorro por mensajes gratuitos: <b>' + f.pen(s.saved * s.fx) + '</b>' +
      '</div>' +
      '<div style="display:flex;gap:10px;margin:12px 28px 24px;">' +
        '<div style="flex:1;padding:12px;border-radius:12px;background:#F8FAFC;text-align:center;">' +
          '<div style="font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#64748B;">Mensajes totales</div>' +
          '<div style="font-size:18px;font-weight:800;">' + f.int(s.totalMsgs) + '</div>' +
        '</div>' +
        '<div style="flex:1;padding:12px;border-radius:12px;background:#F8FAFC;text-align:center;">' +
          '<div style="font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#64748B;">Mensajes cobrados</div>' +
          '<div style="font-size:18px;font-weight:800;">' + f.int(s.paidMsgs) + '</div>' +
        '</div>' +
      '</div>' +
      '<div style="background:#000000;color:#FFFFFF;padding:16px 28px;">' +
        '<div style="font-size:14px;font-weight:800;letter-spacing:1px;">BUSSET AGENCY</div>' +
        '<div style="font-size:11px;color:#A1A1AA;margin-top:2px;">Tarifas referenciales de Meta en US$ por mensaje, sujetas a cambio.</div>' +
      '</div>' +
    '</div>';
  }

  function waitImage(img) {
    if (img.complete && img.naturalWidth) return Promise.resolve();
    return new Promise(function (res) { img.onload = img.onerror = function () { res(); }; });
  }

  function slug(s) {
    return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  function fileName() {
    var d = new Date(), c = slug(C.cliente());
    var date = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    return 'presupuesto-whatsapp' + (c ? '-' + c : '') + '-' + date + '.png';
  }

  function openModal() { $('modal').classList.remove('hidden'); $('modal').classList.add('flex'); }
  function closeModal() { $('modal').classList.add('hidden'); $('modal').classList.remove('flex'); }

  function generate(btn) {
    if (typeof html2canvas !== 'function') {
      C.toast('⚠️ Necesitas conexión a internet para generar la imagen');
      return;
    }
    var label = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '⏳ Generando…';

    var host = $('captura-host');
    host.innerHTML = buildCard();

    var fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    Promise.all([fontsReady, waitImage($('captura-logo'))])
      .then(function () {
        return html2canvas($('captura'), { scale: 3, backgroundColor: '#FFFFFF', logging: false });
      })
      .then(function (canvas) {
        return new Promise(function (res) { canvas.toBlob(res, 'image/png'); });
      })
      .then(function (blob) {
        if (current) URL.revokeObjectURL(current.url);
        current = { blob: blob, url: URL.createObjectURL(blob), name: fileName() };
        $('preview').src = current.url;
        openModal();
      })
      .catch(function () { C.toast('⚠️ No se pudo generar la imagen'); })
      .then(function () {
        host.innerHTML = '';
        btn.disabled = false;
        btn.innerHTML = label;
      });
  }

  function download() {
    if (!current) return;
    var a = document.createElement('a');
    a.href = current.url; a.download = current.name;
    document.body.appendChild(a); a.click(); a.remove();
    C.toast('✅ Imagen descargada');
  }

  function share() {
    if (!current) return;
    var file = new File([current.blob], current.name, { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({ files: [file], title: 'Presupuesto WhatsApp API · Busset Agency' })
        .catch(function (e) { if (e && e.name !== 'AbortError') download(); });
    } else {
      // Navegadores de escritorio sin "compartir": se descarga para adjuntarla manualmente
      download();
    }
  }

  document.querySelectorAll('[data-capture]').forEach(function (b) {
    b.addEventListener('click', function () { generate(b); });
  });
  $('btn-download').addEventListener('click', download);
  $('btn-share').addEventListener('click', share);
  $('modal-close').addEventListener('click', closeModal);
  $('modal').addEventListener('click', function (e) { if (e.target === $('modal')) closeModal(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });
})();
