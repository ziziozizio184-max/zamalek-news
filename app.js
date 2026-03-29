/* =============================================
   ZAMALEK NEWS — app.js
   Full JavaScript Logic
   Storage: localStorage (persists in browser)
   ============================================= */

'use strict';

// =============================================
// STORAGE LAYER
// =============================================

const STORAGE_KEY = 'zamalek_news_articles';
const USERS_KEY   = 'zamalek_news_users';

const DEFAULT_USERS = [
  { username: 'zamalek', password: 'zamalek123', displayName: 'إدارة الزمالك' },
  { username: 'admin',   password: 'admin123',   displayName: 'المشرف العام' },
  { username: 'fan1',    password: 'fan1pass',    displayName: 'مشجع الزمالك' },
];

function initUsers() {
  if (!localStorage.getItem(USERS_KEY)) {
    localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS));
  }
}

function getUsers() {
  initUsers();
  return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
}

function getArticles() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return seedDefaultArticles();
  return JSON.parse(raw);
}

function saveArticles(articles) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
}

function seedDefaultArticles() {
  const seed = [
    {
      id: 'seed-001',
      title: 'الزمالك يتوج بكأس السوبر الأفريقي للمرة الثالثة',
      content: 'حقق نادي الزمالك إنجازاً تاريخياً جديداً بفوزه بكأس السوبر الأفريقي في مباراة مثيرة أمام منافسه القاري. وقاد الفريق الأبيض مهاجمه الخطير ليقدم أداءً استثنائياً أبهر جميع المتفرجين في الملعب وعلى الشاشات. وعلّق رئيس النادي على الفوز قائلاً إن هذا الإنجاز يعكس قيمة الزمالك على المستوى الأفريقي وسيُلهم الأجيال القادمة.',
      image: null,
      author: 'إدارة الزمالك',
      username: 'zamalek',
      date: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: 'seed-002',
      title: 'صفقة انتقال نجم شاب إلى صفوف الفريق الأبيض',
      content: 'أتمّ نادي الزمالك صفقة انتقال لاعب موهوب من منافسيه في الدوري المصري وذلك في إطار خطة النادي لتعزيز الخط الأمامي. ويُعدّ اللاعب الجديد من أبرز المواهب الشابة في كرة القدم المصرية، ويُتوقع أن يُشارك في المباريات القادمة مع الفريق الأول. وأبدى الجماهير ترحيباً حاراً بالانضمام الجديد عبر وسائل التواصل الاجتماعي.',
      image: null,
      author: 'مشجع الزمالك',
      username: 'fan1',
      date: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
    {
      id: 'seed-003',
      title: 'تدريبات مكثفة قبيل الديربي المرتقب',
      content: 'خاض لاعبو الزمالك جلسة تدريبية مكثفة في قلعة الجبل استعداداً للديربي المصري الكبير. وكان المدرب حريصاً على تكثيف التدريبات التكتيكية والبدنية لضمان أعلى مستوى من الجاهزية للمواجهة الكبيرة. وأكد القائد أن الفريق بكامل تركيزه وجاهز للمعركة وأن جماهير الزمالك العظيمة تستحق الفوز.',
      image: null,
      author: 'المشرف العام',
      username: 'admin',
      date: new Date(Date.now() - 86400000 * 8).toISOString(),
    },
  ];
  saveArticles(seed);
  return seed;
}

// =============================================
// UTILITIES
// =============================================

function generateId() {
  return 'art-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7);
}

function formatDate(isoString) {
  const d = new Date(isoString);
  return d.toLocaleDateString('ar-EG', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
}

function escHtml(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str || ''));
  return div.innerHTML;
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// =============================================
// HOMEPAGE LOGIC
// =============================================

function renderHomepage() {
  const featuredEl = document.getElementById('featuredArticle');
  const gridEl     = document.getElementById('newsGrid');
  const emptyEl    = document.getElementById('emptyState');
  if (!featuredEl) return; // not on homepage

  const articles = getArticles().sort((a, b) => new Date(b.date) - new Date(a.date));

  if (!articles.length) {
    emptyEl.style.display = 'block';
    return;
  }
  emptyEl.style.display = 'none';

  // Featured (latest)
  const [first, ...rest] = articles;
  featuredEl.innerHTML = buildFeaturedCard(first);

  // Grid (the rest)
  gridEl.innerHTML = rest.map((a, i) => buildNewsCard(a, i)).join('');

  // Update ticker
  updateTicker(articles);
}

function buildFeaturedCard(a) {
  const imgHtml = a.image
    ? `<img src="${a.image}" alt="${escHtml(a.title)}" loading="lazy" />`
    : `<div class="featured-img-placeholder"><span class="placeholder-icon">⚽</span><span>أخبار الزمالك</span></div>`;

  return `
    <article class="featured-card" itemscope itemtype="https://schema.org/NewsArticle">
      <div class="featured-img-wrap">
        <span class="featured-tag">آخر الأخبار</span>
        ${imgHtml}
      </div>
      <div class="featured-body">
        <div class="featured-meta">
          <span class="featured-author">${escHtml(a.author)}</span>
          <span>•</span>
          <time itemprop="datePublished" datetime="${a.date}">${formatDate(a.date)}</time>
        </div>
        <h2 class="featured-title" itemprop="headline">${escHtml(a.title)}</h2>
        <p class="featured-excerpt" itemprop="description">${escHtml(a.content)}</p>
        <span class="featured-read-more">اقرأ المزيد</span>
      </div>
    </article>`;
}

function buildNewsCard(a, index) {
  const imgHtml = a.image
    ? `<img src="${a.image}" alt="${escHtml(a.title)}" loading="lazy" />`
    : `<div class="card-img-placeholder"><span class="ph-icon">⚽</span><span>الزمالك</span></div>`;

  const delay = Math.min(index * 80, 600);

  return `
    <article class="news-card" style="animation-delay:${delay}ms" itemscope itemtype="https://schema.org/NewsArticle">
      <div class="card-img-wrap">${imgHtml}</div>
      <div class="card-body">
        <div class="card-meta">
          <span class="card-author">${escHtml(a.author)}</span>
          <time datetime="${a.date}">${formatDate(a.date)}</time>
        </div>
        <h3 class="card-title" itemprop="headline">${escHtml(a.title)}</h3>
        <p class="card-excerpt" itemprop="description">${escHtml(a.content)}</p>
        <div class="card-footer">
          <span class="card-read-more">تفاصيل الخبر</span>
        </div>
      </div>
    </article>`;
}

function updateTicker(articles) {
  const inner = document.getElementById('tickerInner');
  if (!inner || !articles.length) return;
  const items = articles.slice(0, 5).map(a => `<span>${escHtml(a.title)}</span><span>•</span>`).flat();
  inner.innerHTML = items.join('');
}

// =============================================
// MOBILE MENU
// =============================================

function initMobileMenu() {
  const btn = document.getElementById('mobileMenuBtn');
  const nav = document.getElementById('mobileNav');
  if (!btn || !nav) return;
  btn.addEventListener('click', () => {
    nav.classList.toggle('open');
  });
}

// =============================================
// DASHBOARD LOGIC
// =============================================

let currentUser = null;
let editingId   = null;

function initDashboard() {
  const loginScreen    = document.getElementById('loginScreen');
  const dashboardScreen = document.getElementById('dashboardScreen');
  if (!loginScreen) return; // not on dashboard

  // Check existing session
  const session = sessionStorage.getItem('zamalek_session');
  if (session) {
    try {
      currentUser = JSON.parse(session);
      showDashboard();
    } catch {
      showLogin();
    }
  }

  // Login
  document.getElementById('loginBtn').addEventListener('click', doLogin);
  document.getElementById('loginPassword').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') doLogin();
  });

  // Logout
  document.getElementById('logoutBtn').addEventListener('click', doLogout);

  // Sidebar tabs
  document.querySelectorAll('.sidebar-link[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sidebar-link').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tab = btn.dataset.tab;
      document.querySelectorAll('.dash-tab').forEach(t => t.style.display = 'none');
      document.getElementById(`tab-${tab}`).style.display = 'block';
      if (tab === 'manage') renderMyNews();
      if (tab === 'all') renderAllNews();
    });
  });

  // Add news form
  initAddForm();

  // Edit modal
  document.getElementById('closeModal').addEventListener('click', closeModal);
  document.getElementById('cancelEditBtn').addEventListener('click', closeModal);
  document.getElementById('saveEditBtn').addEventListener('click', saveEdit);

  // Date display
  const now = new Date();
  const el = document.getElementById('dashDate');
  if (el) el.textContent = now.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function doLogin() {
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value.trim();
  const errorEl  = document.getElementById('loginError');

  const users = getUsers();
  const user  = users.find(u => u.username === username && u.password === password);

  if (user) {
    currentUser = { username: user.username, displayName: user.displayName };
    sessionStorage.setItem('zamalek_session', JSON.stringify(currentUser));
    errorEl.style.display = 'none';
    showDashboard();
  } else {
    errorEl.style.display = 'block';
    document.getElementById('loginPassword').value = '';
  }
}

function doLogout() {
  currentUser = null;
  sessionStorage.removeItem('zamalek_session');
  showLogin();
}

function showLogin() {
  document.getElementById('loginScreen').style.display = 'flex';
  document.getElementById('dashboardScreen').style.display = 'none';
}

function showDashboard() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('dashboardScreen').style.display = 'flex';
  document.getElementById('dashGreeting').textContent = `مرحباً، ${currentUser.displayName} 👋`;
  document.getElementById('sidebarUser').textContent = `👤 ${currentUser.displayName}`;
}

// =============================================
// ADD NEWS FORM
// =============================================

let pendingImageBase64 = null;

function initAddForm() {
  const uploadArea    = document.getElementById('imageUploadArea');
  const fileInput     = document.getElementById('newsImage');
  const clearImageBtn = document.getElementById('clearImageBtn');
  const submitBtn     = document.getElementById('submitNewsBtn');
  const clearFormBtn  = document.getElementById('clearFormBtn');

  // Click to upload
  uploadArea.addEventListener('click', (e) => {
    if (e.target.id !== 'clearImageBtn') fileInput.click();
  });

  // Drag & drop
  uploadArea.addEventListener('dragover', (e) => { e.preventDefault(); uploadArea.style.borderColor = 'var(--red)'; });
  uploadArea.addEventListener('dragleave', () => { uploadArea.style.borderColor = ''; });
  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '';
    const file = e.dataTransfer.files[0];
    if (file) handleImageFile(file, 'newsImage');
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files[0]) handleImageFile(fileInput.files[0], 'newsImage');
  });

  clearImageBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    clearImage();
  });

  submitBtn.addEventListener('click', submitNews);
  clearFormBtn.addEventListener('click', resetForm);
}

async function handleImageFile(file, inputId) {
  if (file.size > 5 * 1024 * 1024) {
    showFeedback('حجم الصورة يتجاوز الحد المسموح (5 ميغابايت)', 'error');
    return;
  }
  const b64 = await fileToBase64(file);
  pendingImageBase64 = b64;

  const preview = document.getElementById('imagePreview');
  const placeholder = document.getElementById('uploadPlaceholder');
  const clearBtn = document.getElementById('clearImageBtn');

  preview.src = b64;
  preview.style.display = 'block';
  placeholder.style.display = 'none';
  if (clearBtn) clearBtn.style.display = 'inline-flex';
}

function clearImage() {
  pendingImageBase64 = null;
  const preview = document.getElementById('imagePreview');
  const placeholder = document.getElementById('uploadPlaceholder');
  const clearBtn = document.getElementById('clearImageBtn');
  const fileInput = document.getElementById('newsImage');
  if (preview) { preview.src = ''; preview.style.display = 'none'; }
  if (placeholder) placeholder.style.display = 'flex';
  if (clearBtn) clearBtn.style.display = 'none';
  if (fileInput) fileInput.value = '';
}

async function submitNews() {
  const title   = document.getElementById('newsTitle').value.trim();
  const content = document.getElementById('newsContent').value.trim();

  if (!title) { showFeedback('يرجى إدخال عنوان الخبر', 'error'); return; }
  if (!content) { showFeedback('يرجى إدخال محتوى الخبر', 'error'); return; }

  const article = {
    id:       generateId(),
    title,
    content,
    image:    pendingImageBase64 || null,
    author:   currentUser.displayName,
    username: currentUser.username,
    date:     new Date().toISOString(),
  };

  const articles = getArticles();
  articles.unshift(article);
  saveArticles(articles);

  showFeedback('✅ تم نشر الخبر بنجاح! سيظهر الآن على الصفحة الرئيسية.', 'success');
  resetForm();

  // Switch to manage tab
  setTimeout(() => {
    document.querySelector('.sidebar-link[data-tab="manage"]').click();
  }, 1500);
}

function resetForm() {
  document.getElementById('newsTitle').value = '';
  document.getElementById('newsContent').value = '';
  clearImage();
  hideFeedback();
}

function showFeedback(msg, type) {
  const el = document.getElementById('formFeedback');
  if (!el) return;
  el.textContent = msg;
  el.className = `form-feedback ${type}`;
  el.style.display = 'block';
}

function hideFeedback() {
  const el = document.getElementById('formFeedback');
  if (el) el.style.display = 'none';
}

// =============================================
// MY NEWS LIST
// =============================================

function renderMyNews() {
  const container = document.getElementById('myNewsList');
  if (!container || !currentUser) return;

  const articles = getArticles()
    .filter(a => a.username === currentUser.username)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  if (!articles.length) {
    container.innerHTML = `<div class="dash-empty">لم تنشر أي خبر بعد. ابدأ بإضافة أول خبر لك!</div>`;
    return;
  }

  container.innerHTML = articles.map(a => buildDashItem(a, true)).join('');
  attachDashItemEvents(container);
}

function renderAllNews() {
  const container = document.getElementById('allNewsList');
  if (!container) return;

  const articles = getArticles().sort((a, b) => new Date(b.date) - new Date(a.date));

  if (!articles.length) {
    container.innerHTML = `<div class="dash-empty">لا توجد أخبار حتى الآن.</div>`;
    return;
  }

  container.innerHTML = articles.map(a => buildDashItem(a, a.username === currentUser?.username)).join('');
  attachDashItemEvents(container);
}

function buildDashItem(a, canEdit) {
  const imgHtml = a.image
    ? `<img class="dash-news-thumb" src="${a.image}" alt="${escHtml(a.title)}" />`
    : `<div class="dash-news-thumb-placeholder">⚽</div>`;

  const actionBtns = canEdit
    ? `<button class="btn-edit" data-id="${a.id}">✏️ تعديل</button>
       <button class="btn-delete" data-id="${a.id}">🗑️ حذف</button>`
    : `<span style="font-size:12px;color:var(--mid-gray);">بقلم ${escHtml(a.author)}</span>`;

  return `
    <div class="dash-news-item">
      ${imgHtml}
      <div class="dash-news-info">
        <div class="dash-news-title">${escHtml(a.title)}</div>
        <div class="dash-news-meta">${formatDate(a.date)}</div>
        <div class="dash-news-actions">${actionBtns}</div>
      </div>
    </div>`;
}

function attachDashItemEvents(container) {
  container.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', () => deleteArticle(btn.dataset.id, container));
  });
  container.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', () => openEdit(btn.dataset.id));
  });
}

function deleteArticle(id, container) {
  if (!confirm('هل تريد حذف هذا الخبر نهائياً؟')) return;
  let articles = getArticles();
  const art = articles.find(a => a.id === id);
  if (!art || art.username !== currentUser.username) return;
  articles = articles.filter(a => a.id !== id);
  saveArticles(articles);
  // Re-render the current list
  const myList = document.getElementById('myNewsList');
  const allList = document.getElementById('allNewsList');
  if (myList && myList.innerHTML) renderMyNews();
  if (allList && allList.innerHTML) renderAllNews();
}

// =============================================
// EDIT MODAL
// =============================================

function openEdit(id) {
  const articles = getArticles();
  const art = articles.find(a => a.id === id);
  if (!art || art.username !== currentUser.username) return;

  editingId = id;
  document.getElementById('editTitle').value = art.title;
  document.getElementById('editContent').value = art.content;

  const preview = document.getElementById('editImagePreview');
  if (art.image) { preview.src = art.image; preview.style.display = 'block'; }
  else { preview.src = ''; preview.style.display = 'none'; }

  document.getElementById('editImage').value = '';
  document.getElementById('editModal').style.display = 'flex';
}

function closeModal() {
  editingId = null;
  document.getElementById('editModal').style.display = 'none';
}

async function saveEdit() {
  if (!editingId) return;

  const title   = document.getElementById('editTitle').value.trim();
  const content = document.getElementById('editContent').value.trim();
  const imgFile = document.getElementById('editImage').files[0];

  if (!title || !content) { alert('العنوان والمحتوى مطلوبان'); return; }

  let articles = getArticles();
  const idx = articles.findIndex(a => a.id === editingId);
  if (idx === -1) return;

  articles[idx].title   = title;
  articles[idx].content = content;

  if (imgFile) {
    articles[idx].image = await fileToBase64(imgFile);
  }

  saveArticles(articles);
  closeModal();
  renderMyNews();
  renderAllNews();
}

// =============================================
// INIT
// =============================================

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();

  if (document.getElementById('newsGrid')) {
    // Homepage
    renderHomepage();
  }

  if (document.getElementById('loginScreen')) {
    // Dashboard
    initDashboard();
  }
});
