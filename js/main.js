// ===== NAVBAR TOGGLE =====
function toggleMenu() {
  document.querySelector('.nav-links').classList.toggle('open');
}

// ===== COUNTDOWN TIMER =====
function updateCountdown() {
  const deadline = new Date('2025-07-25T23:59:59');
  const now = new Date();
  const diff = deadline - now;
  const el = document.getElementById('countdown');
  if (!el) return;
  if (diff <= 0) { el.textContent = 'Ditutup'; return; }
  el.textContent = Math.ceil(diff / (1000 * 60 * 60 * 24));
}
updateCountdown();
setInterval(updateCountdown, 60000);

// ===== ACCORDION =====
document.querySelectorAll('.accordion-header').forEach(btn => {
  btn.addEventListener('click', () => {
    const body = btn.nextElementSibling;
    const isOpen = body.classList.contains('open');
    document.querySelectorAll('.accordion-body').forEach(b => b.classList.remove('open'));
    document.querySelectorAll('.accordion-header span').forEach(s => s.textContent = '+');
    if (!isOpen) {
      body.classList.add('open');
      btn.querySelector('span').textContent = '−';
    }
  });
});

// ===== MULTI-STEP FORM =====
var currentStep = 1;
var totalSteps = 3;

function nextStep() {
  var stepEl = document.getElementById('step-' + currentStep);
  if (!stepEl) {
    currentStep++;
    updateFormStep();
    return;
  }

  var fields = stepEl.querySelectorAll('[required]');
  var valid = true;

  for (var i = 0; i < fields.length; i++) {
    fields[i].style.borderColor = '';
    if (!fields[i].value.trim()) {
      fields[i].style.borderColor = '#ef4444';
      valid = false;
    }
  }

  if (!valid) {
    alert('Mohon lengkapi semua field yang wajib diisi (ditandai *)');
    return;
  }

  if (currentStep < totalSteps) {
    currentStep++;
    updateFormStep();
    window.scrollTo(0, 0);
  }
}

function prevStep() {
  if (currentStep > 1) {
    currentStep--;
    updateFormStep();
    window.scrollTo(0, 0);
  }
}

function updateFormStep() {
  var steps = document.querySelectorAll('.form-step');
  steps.forEach(function(el, i) {
    el.style.display = (i + 1 === currentStep) ? 'block' : 'none';
  });

  var dots = document.querySelectorAll('.prog-dot');
  dots.forEach(function(dot, i) {
    dot.className = 'prog-dot';
    if (i + 1 < currentStep) dot.classList.add('done');
    else if (i + 1 === currentStep) dot.classList.add('active');
  });

  var lines = document.querySelectorAll('.prog-line');
  lines.forEach(function(line, i) {
    line.className = 'prog-line';
    if (i + 1 < currentStep) line.classList.add('done');
  });
}

// ===== FORM SUBMIT =====
var form = document.getElementById('form-pendaftaran');
if (form) {
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    var APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwN7yHMJS8hxAFn0ZjMQOjE-laKXC2Npd_sT-5MV-BS3FTU0Ghra3d9arG6Uvzs9OOf/exec';
    var submitBtn = document.getElementById('submit-btn');
    if (submitBtn) { submitBtn.textContent = 'Mengirim...'; submitBtn.disabled = true; }

    var payload = {};
    var formData = new FormData(form);
    formData.forEach(function(v, k) { payload[k] = v; });

    fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' }
    })
    .then(function(res) { return res.json(); })
    .then(function(result) {
      if (result.status === 'success') {
        window.location.href = 'sukses.html?noReg=' + result.noRegistrasi + '&nama=' + encodeURIComponent(result.nama);
      } else {
        alert('Terjadi kesalahan: ' + result.message);
        if (submitBtn) { submitBtn.textContent = 'Kirim Pendaftaran'; submitBtn.disabled = false; }
      }
    })
    .catch(function(err) {
      alert('Gagal mengirim data. Coba lagi atau hubungi panitia.');
      if (submitBtn) { submitBtn.textContent = 'Kirim Pendaftaran'; submitBtn.disabled = false; }
    });
  });
}

// ===== CEK STATUS =====
function cekStatus() {
  var noReg = document.getElementById('input-noreg') ? document.getElementById('input-noreg').value.trim() : '';
  var email = document.getElementById('input-email') ? document.getElementById('input-email').value.trim() : '';
  if (!noReg && !email) { alert('Masukkan nomor registrasi atau email'); return; }

  var APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwN7yHMJS8hxAFn0ZjMQOjE-laKXC2Npd_sT-5MV-BS3FTU0Ghra3d9arG6Uvzs9OOf/exec';
  var resultEl = document.getElementById('status-result');
  if (resultEl) resultEl.innerHTML = '<p style="color:#64748b;padding:1rem 0">Mencari data...</p>';

  fetch(APPS_SCRIPT_URL + '?action=cekStatus&noReg=' + noReg + '&email=' + email)
  .then(function(res) { return res.json(); })
  .then(function(data) {
    if (data.found) {
      tampilkanStatus(data);
    } else {
      if (resultEl) resultEl.innerHTML = '<div class="alert alert-warning">Data tidak ditemukan.</div>';
    }
  })
  .catch(function() {
    if (resultEl) resultEl.innerHTML = '<div class="alert alert-warning">Gagal mengambil data.</div>';
  });
}

function tampilkanStatus(data) {
  var el = document.getElementById('status-result');
  if (!el) return;
  var badgeClass = data.status === 'Terverifikasi' ? 'status-terverifikasi' : data.status === 'Ditolak' ? 'status-ditolak' : 'status-menunggu';
  el.innerHTML = '<div class="status-card"><h3>' + data.nama + '</h3><p>No. Registrasi: <strong>' + data.noReg + '</strong></p><span class="status-badge ' + badgeClass + '">' + data.status + '</span></div>';
}
