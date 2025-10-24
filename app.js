// ====== УТИЛИТЫ ======
const KEY = 'requests_v1';
const $ = s => document.querySelector(s);
function uid() { return Math.random().toString(36).slice(2, 9); }

function createRequest({ title, description, priority }) {
  return {
    id: uid(),
    title: title.trim(),
    description: description.trim(),
    priority,               // "Low" | "Medium" | "High"
    status: 'New',          // "New" | "Done"
    createdAt: new Date().toISOString()
  };
}

// ====== ХРАНИЛИЩЕ ======
function load() { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
function save(list) { localStorage.setItem(KEY, JSON.stringify(list)); }

// ====== ССЫЛКИ ======
const listEl = $('#list');
const form = $('#request-form');
const errorEl = form.querySelector('.error');
const qEl = $('#q');
const prioEl = $('#prio');

// ====== ВАЛИДАЦИЯ ======
function validate(fd) {
  const title = (fd.get('title') || '').trim();
  const description = (fd.get('description') || '').trim();
  if (!title || title.length < 3) return 'Заголовок: минимум 3 символа';
  if (!description || description.length < 20) return 'Описание: минимум 20 символов';
  return '';
}

// ====== РЕНДЕР ======
function render() {
  const q = (qEl.value || '').toLowerCase();
  const pr = prioEl.value;

  const data = load().filter(r =>
    (!q || r.title.toLowerCase().includes(q)) &&
    (!pr || r.priority === pr)
  );

  listEl.innerHTML = data.map(r => `
    <li class="item ${r.status==='Done'?'status-done':''}" data-id="${r.id}">
      <input type="checkbox" class="toggle" ${r.status==='Done'?'checked':''} aria-label="Готово">
      <strong title="${r.description.replace(/"/g,'&quot;')}">${r.title}</strong>
      <span class="badge">${r.priority}</span>
      <div class="actions">
        <button class="ghost del" type="button">Удалить</button>
      </div>
    </li>
  `).join('');
}

// ====== СОЗДАНИЕ ======
form.addEventListener('submit', e => {
  e.preventDefault();
  const fd = new FormData(form);
  const msg = validate(fd);
  errorEl.textContent = msg;
  if (msg) return;

  const item = createRequest({
    title: fd.get('title'),
    description: fd.get('description'),
    priority: fd.get('priority')
  });

  const data = load();
  data.unshift(item);
  save(data);
  form.reset();
  render();
});

// ====== СМЕНА СТАТУСА / УДАЛЕНИЕ ======
listEl.addEventListener('click', e => {
  const li = e.target.closest('.item'); if (!li) return;
  const id = li.dataset.id;
  const data = load();

  if (e.target.matches('.toggle')) {
    const it = data.find(x => x.id === id);
    it.status = e.target.checked ? 'Done' : 'New';
    save(data);
    render();
  }

  if (e.target.matches('.del')) {
    save(data.filter(x => x.id !== id));
    render();
  }
});

// ====== ФИЛЬТРЫ ======
[qEl, prioEl].forEach(el => el.addEventListener('input', render));

// стартовый рендер
render();
