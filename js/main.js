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

// ===== FORM VALIDATION =====
const form = document.getElementById('form-pendaftaran');
if (form) {
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const requiredFields = form.querySelectorAll('[required]');
    let valid = true;
    requiredFields.forEach(field => {
      field.style.borderColor = '';
      if (!field.value.trim()) {
        field.style.borderColor = '#ef4444';
        valid = false;
      }
    });
    if (!valid) {
      alert('Mohon lengkapi semua field yang wajib diisi (ditandai *)');
      return;
    }
    submitToAppsScript(new FormData(form));
  });
}

// ===== SUBMIT KE APPS SCRIPT =====
async function submitToAppsScript(formData) {
  const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwN7yHMJS8hxAFn0ZjMQOjE-laKXC2Npd_sT-5MV-BS3FTU0Ghra3d9arG6Uvzs9OOf/exec; // Ganti dengan URL deploy Apps Script
  const submitBtn = document.getElementById('submit-btn');
  if (submitBtn) { submitBtn.textContent = 'Mengirim...'; submitBtn.disabled = true; }

  try {
    const payload = {};
    formData.forEach((v, k) => payload[k] = v);

    const res = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' }
    });
    const result = await res.json();

    if (result.status === 'success') {
      window.location.href = 'sukses.html?noReg=' + result.noRegistrasi + '&nama=' + encodeURIComponent(result.nama);
    } else {
      alert('Terjadi kesalahan: ' + result.message);
    }
  } catch (err) {
    console.error(err);
    alert('Gagal mengirim data. Coba lagi atau hubungi panitia.');
  } finally {
    if (submitBtn) { submitBtn.textContent = 'Kirim Pendaftaran'; submitBtn.disabled = false; }
  }
}

// ===== CEK STATUS =====
async function cekStatus() {
  const noReg = document.getElementById('input-noreg')?.value.trim();
  const email = document.getElementById('input-email')?.value.trim();
  if (!noReg && !email) { alert('Masukkan nomor registrasi atau email'); return; }

  const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwN7yHMJS8hxAFn0ZjMQOjE-laKXC2Npd_sT-5MV-BS3FTU0Ghra3d9arG6Uvzs9OOf/exec';
  const resultEl = document.getElementById('status-result');
  if (resultEl) resultEl.innerHTML = '<p style="color:#64748b;padding:1rem 0">Mencari data...</p>';

  try {
    const url = APPS_SCRIPT_URL + '?action=cekStatus&noReg=' + noReg + '&email=' + email;
    const res = await fetch(url);
    const data = await res.json();

    if (data.found) {
      tampilkanStatus(data);
    } else {
      if (resultEl) resultEl.innerHTML = '<div class="alert alert-warning">Data tidak ditemukan. Pastikan nomor registrasi atau email sudah benar.</div>';
    }
  } catch (err) {
    if (resultEl) resultEl.innerHTML = '<div class="alert alert-warning">Gagal mengambil data. Coba lagi.</div>';
  }
}

function tampilkanStatus(data) {
  const el = document.getElementById('status-result');
  if (!el) return;
  const badgeClass = {
    'Terverifikasi': 'status-terverifikasi',
    'Menunggu Dokumen': 'status-menunggu',
    'Ditolak': 'status-ditolak'
  }[data.status] || 'status-menunggu';

  el.innerHTML = '<div class="status-card">' +
    '<div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:10px;margin-bottom:1rem">' +
    '<div><h3>' + data.nama + '</h3><p style="font-size:13px;color:#64748b">No. Registrasi: <strong>' + data.noReg + '</strong></p></div>' +
    '<span class="status-badge ' + badgeClass + '">' + data.status + '</span></div>' +
    '<div class="info-grid">' +
    '<div class="info-item"><div class="info-label">Program Studi</div><div class="info-value">' + data.prodi1 + '</div></div>' +
    '<div class="info-item"><div class="info-label">Pilihan 2</div><div class="info-value">' + (data.prodi2 || '-') + '</div></div>' +
    '<div class="info-item"><div class="info-label">Tanggal Daftar</div><div class="info-value">' + data.tanggalDaftar + '</div></div>' +
    '<div class="info-item"><div class="info-label">Dokumen</div><div class="info-value">' + (data.dokumenLengkap ? 'Lengkap' : 'Belum Lengkap') + '</div></div>' +
    '</div></div>';
}

// ===== MULTI-STEP FORM =====
let currentStep = 1;
const totalSteps = 3;

function nextStep() {
  // Cek semua field required di step yang aktif
  const stepEl = document.getElementById('step-' + currentStep);
  const requiredFields = stepEl.querySelectorAll('[required]');
  let valid = true;

  requiredFields.forEach(field => {
    field.style.borderColor = '';
    if (!field.value.trim()) {
      field.style.borderColor = '#ef4444';
      valid = false;
    }
  });

  if (!valid) {
    alert('Mohon lengkapi semua field yang wajib diisi (ditandai *)');
    return;
  }

  if (currentStep < totalSteps) {
    currentStep++;
    updateFormStep();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
function prevStep() {
  if (currentStep > 1) { currentStep--; updateFormStep(); }
}
function updateFormStep() {
  document.querySelectorAll('.form-step').forEach((el, i) => {
    el.style.display = (i + 1 === currentStep) ? 'block' : 'none';
  });
  document.querySelectorAll('.prog-dot').forEach((dot, i) => {
    dot.className = 'prog-dot';
    if (i + 1 < currentStep) dot.classList.add('done');
    else if (i + 1 === currentStep) dot.classList.add('active');
  });
  document.querySelectorAll('.prog-line').forEach((line, i) => {
    line.className = 'prog-line';
    if (i + 1 < currentStep) line.classList.add('done');
  });
}
