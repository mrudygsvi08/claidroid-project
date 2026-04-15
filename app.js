// ══════════════════════════════════════════════════
//  STATE
// ══════════════════════════════════════════════════
let allFiles     = [];
let activeFilter = null;
let toastTimer;

// ══════════════════════════════════════════════════
//  LANDING ↔ DASHBOARD
// ══════════════════════════════════════════════════
function goToDashboard() {
  document.getElementById('landingPage').style.display  = 'none';
  document.getElementById('dashboardPage').style.display = 'block';
  loadFiles();
}
function goToLanding() {
  document.getElementById('dashboardPage').style.display = 'none';
  document.getElementById('landingPage').style.display   = 'block';
}

// ══════════════════════════════════════════════════
//  THEME
// ══════════════════════════════════════════════════
function setTheme(theme, btn) {
  document.documentElement.setAttribute('data-theme', theme);
  document.querySelectorAll('.theme-opt').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  showToast('Theme: ' + theme);
}

// ══════════════════════════════════════════════════
//  SIDEBAR ACTIVE
// ══════════════════════════════════════════════════
function setActive(el) {
  document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
  el.classList.add('active');
}

// ══════════════════════════════════════════════════
//  HELPERS
// ══════════════════════════════════════════════════
function getExt(name) { return (name.split('.').pop() || 'file').toLowerCase(); }

function getIcon(name) {
  const ext = getExt(name);
  if (['jpg','jpeg','png','gif','svg','webp'].includes(ext)) return '🖼️';
  if (['pdf','doc','docx','txt','ppt','pptx','xls','xlsx'].includes(ext)) return '📄';
  if (['mp4','mov','avi','mp3','wav'].includes(ext)) return '🎬';
  if (['zip','rar','7z'].includes(ext)) return '📦';
  return '📁';
}

function getCategory(name) {
  const ext = getExt(name);
  if (['jpg','jpeg','png','gif','svg','webp'].includes(ext)) return 'image';
  if (['pdf','doc','docx','txt','ppt','pptx','xls','xlsx'].includes(ext)) return 'document';
  if (['mp4','mov','avi','mp3','wav'].includes(ext)) return 'media';
  return 'other';
}

function fmtSize(bytes) {
  if (!bytes || bytes === 0) return '—';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

// ══════════════════════════════════════════════════
//  TOAST
// ══════════════════════════════════════════════════
function showToast(msg) {
  clearTimeout(toastTimer);
  document.getElementById('toastMsg').textContent = msg;
  document.getElementById('toast').classList.remove('hidden');
  toastTimer = setTimeout(() => document.getElementById('toast').classList.add('hidden'), 2500);
}

// ══════════════════════════════════════════════════
//  LOAD FILES FROM BACKEND
// ══════════════════════════════════════════════════
async function loadFiles() {
  try {
    const res = await fetch('http://localhost:5000/files');
    allFiles  = await res.json();
    renderAll(allFiles);
  } catch (e) {
    renderDemo();
  }
}

// ══════════════════════════════════════════════════
//  RENDER ALL
// ══════════════════════════════════════════════════
function renderAll(files) {
  renderFileCards(files);
  renderTable(files);
  updateCounts(allFiles);   // counts always from full list
  updateStorage(allFiles);  // storage always from full list
}

// ══════════════════════════════════════════════════
//  FILE CARDS
// ══════════════════════════════════════════════════
function renderFileCards(files) {
  const box = document.getElementById('files');
  if (!files.length) {
    box.innerHTML = '<div class="file-card placeholder">No files found.</div>';
    return;
  }
  box.innerHTML = files.map(f => `
    <div class="file-card" onclick="openFile('${f.name}','${f.url}')" title="${f.name}">
      <div class="fc-icon">${getIcon(f.name)}</div>
      <div class="fc-name">${f.name}</div>
      <div class="fc-meta">${getExt(f.name).toUpperCase()} · ${fmtSize(f.size)}</div>
    </div>`).join('');
}

// ══════════════════════════════════════════════════
//  TABLE
// ══════════════════════════════════════════════════
function renderTable(files) {
  const tbody = document.getElementById('tableBody');
  if (!files.length) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--text3);padding:20px">No files yet</td></tr>';
    return;
  }
  tbody.innerHTML = files.map(f => `
    <tr>
      <td>
        <div class="file-name-cell">
          ${getIcon(f.name)}
          <span style="cursor:pointer;text-decoration:underline;text-decoration-color:var(--text3)"
                onclick="openFile('${f.name}','${f.url}')">${f.name}</span>
        </div>
      </td>
      <td><span class="file-type-badge">${getExt(f.name)}</span></td>
      <td style="color:var(--text2)">${fmtSize(f.size)}</td>
      <td>
        <button class="open-btn" onclick="openFile('${f.name}','${f.url}')">View</button>
        <button class="del-btn"  onclick="deleteFile('${f.name}')">Delete</button>
      </td>
    </tr>`).join('');
}

// ══════════════════════════════════════════════════
//  OPEN FILE IN MODAL (view, not download)
// ══════════════════════════════════════════════════
function openFile(name, url) {
  const ext  = getExt(name);
  const modal = document.getElementById('fileModal');
  document.getElementById('modalFileName').textContent = name;

  let content = '';

  if (['jpg','jpeg','png','gif','svg','webp'].includes(ext)) {
    content = `<img src="${url}" alt="${name}"/>`;

  } else if (ext === 'pdf') {
    content = `<iframe src="${url}"></iframe>`;

  } else if (['mp4','mov','avi','webm'].includes(ext)) {
    content = `<video controls><source src="${url}">Your browser does not support video.</video>`;

  } else if (['mp3','wav','ogg'].includes(ext)) {
    content = `<audio controls><source src="${url}">Your browser does not support audio.</audio>`;

  } else if (['txt'].includes(ext)) {
    // Fetch and display text content
    content = `<div style="color:var(--text3);font-size:13px">Loading text...</div>`;
    fetch(url).then(r => r.text()).then(text => {
      document.getElementById('modalBody').innerHTML = `<pre>${text}</pre>`;
    }).catch(() => {
      document.getElementById('modalBody').innerHTML = noPreviewHTML(name, url);
    });

  } else {
    content = noPreviewHTML(name, url);
  }

  document.getElementById('modalBody').innerHTML = content;
  modal.style.display = 'flex';
}

function noPreviewHTML(name, url) {
  return `<div class="modal-no-preview">
    <div class="np-icon">📄</div>
    <p>Preview not available for this file type.</p>
    <a href="${url}" download="${name}">
      <button class="modal-download-btn">⬇ Download File</button>
    </a>
  </div>`;
}

function closeModal(e) {
  // Close only if clicking the overlay background, not the box
  if (e.target.id === 'fileModal') {
    document.getElementById('fileModal').style.display = 'none';
  }
}

// ══════════════════════════════════════════════════
//  CATEGORY FILTER
// ══════════════════════════════════════════════════
function filterCategory(cat) {
  activeFilter = cat;
  const filtered = allFiles.filter(f => getCategory(f.name) === cat);
  renderFileCards(filtered);
  renderTable(filtered);

  // Highlight selected category card
  document.querySelectorAll('.cat-card').forEach(c => c.classList.remove('selected'));
  const catMap = { image:0, document:1, media:2, other:3 };
  document.querySelectorAll('.cat-card')[catMap[cat]]?.classList.add('selected');

  // Show clear filter button
  document.getElementById('clearFilterBtn').style.display = 'inline-block';
}

function clearFilter() {
  activeFilter = null;
  renderAll(allFiles);
  document.querySelectorAll('.cat-card').forEach(c => c.classList.remove('selected'));
  document.getElementById('clearFilterBtn').style.display = 'none';
}

// ══════════════════════════════════════════════════
//  CATEGORY COUNTS
// ══════════════════════════════════════════════════
function updateCounts(files) {
  const counts = { image:0, document:0, media:0, other:0 };
  files.forEach(f => counts[getCategory(f.name)]++);
  document.getElementById('imgCount').textContent   = counts.image    + ' Files';
  document.getElementById('docCount').textContent   = counts.document + ' Files';
  document.getElementById('mediaCount').textContent = counts.media    + ' Files';
  document.getElementById('otherCount').textContent = counts.other    + ' Files';
}

// ══════════════════════════════════════════════════
//  STORAGE
// ══════════════════════════════════════════════════
function updateStorage(files) {
  const total   = files.reduce((a, f) => a + (f.size || 0), 0);
  const limit   = 10 * 1024 * 1024 * 1024;
  const usedPct = Math.min(100, Math.round(total / limit * 100));
  document.getElementById('storageBar').style.width = usedPct + '%';
  document.getElementById('storagePct').textContent = (100 - usedPct) + '% left';
  document.getElementById('storageSub').textContent = fmtSize(total) + ' of 10 GB are used';
}

// ══════════════════════════════════════════════════
//  DELETE
// ══════════════════════════════════════════════════
async function deleteFile(name) {
  if (!confirm(`Delete "${name}"?`)) return;
  try {
    await fetch(`http://localhost:5000/delete/${name}`, { method: 'DELETE' });
    showToast(`"${name}" deleted`);
    loadFiles();
  } catch (e) {
    // Remove locally if backend unavailable
    allFiles = allFiles.filter(f => f.name !== name);
    renderAll(allFiles);
    showToast(`"${name}" removed`);
  }
}

// ══════════════════════════════════════════════════
//  UPLOAD
// ══════════════════════════════════════════════════
async function uploadFile(input) {
  const file = input.files[0];
  if (!file) return;
  const form = new FormData();
  form.append('file', file);
  showToast(`Uploading "${file.name}"...`);
  try {
    await fetch('http://localhost:5000/upload', { method: 'POST', body: form });
    showToast(`"${file.name}" uploaded!`);
    loadFiles();
  } catch (e) {
    allFiles.push({ name: file.name, url: URL.createObjectURL(file), size: file.size });
    renderAll(allFiles);
    showToast(`"${file.name}" added (demo mode)`);
  }
  input.value = '';
}

// ══════════════════════════════════════════════════
//  SEARCH
// ══════════════════════════════════════════════════
function handleSearch(q) {
  const term = q.toLowerCase().trim();
  const filtered = term ? allFiles.filter(f => f.name.toLowerCase().includes(term)) : allFiles;
  renderFileCards(filtered);
  renderTable(filtered);
}

// ══════════════════════════════════════════════════
//  DEMO DATA (when backend not running)
// ══════════════════════════════════════════════════
function renderDemo() {
  allFiles = [
    { name:'BTQZ8979.JPG',        url:'https://picsum.photos/800/600?random=1', size:2400000 },
    { name:'BWSL5614.JPG',        url:'https://picsum.photos/800/600?random=2', size:1800000 },
    { name:'WhatsApp Image.jpg',  url:'https://picsum.photos/800/600?random=3', size:980000  },
    { name:'Startup Framing.pdf', url:'#', size:512000  },
    { name:'Task proposal.docx',  url:'#', size:148000  },
    { name:'Demo Video.mp4',      url:'#', size:8900000 },
  ];
  renderAll(allFiles);
}

// ══════════════════════════════════════════════════
//  INIT — start on landing page, don't auto-load
// ══════════════════════════════════════════════════
// (loadFiles is called by goToDashboard when user clicks Get Started)