/* global LIFEKIT_SITE_URL, LIFEKIT_TOOLS, LIFEKIT_CATEGORIES */
const site = LIFEKIT_SITE_URL;
const list = document.getElementById('list');
const input = document.getElementById('q');
const empty = document.getElementById('empty');
let shown = [];
let active = 0;

const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

function open(path) {
  chrome.tabs.create({ url: site + path });
  window.close();
}

/** Score a tool against search terms (0 = no match). Mirrors the website's search ranking. */
function score(tool, terms, query) {
  const name = norm(tool.name);
  const keywords = tool.keywords.map(norm);
  const desc = norm(`${tool.short} ${tool.category}`);
  const startsWord = (text, term) => text.split(/[^a-z0-9%]+/).some((w) => w.startsWith(term));
  let total = 0;
  for (const term of terms) {
    let s = 0;
    if (startsWord(name, term)) s = 10;
    else if (name.includes(term)) s = 7;
    if (keywords.some((k) => startsWord(k, term))) s = Math.max(s, 6);
    if (desc.includes(term)) s = Math.max(s, 2);
    if (s === 0) return 0;
    total += s;
  }
  if (keywords.includes(query)) total += 20;
  if (name === query) total += 30;
  return total;
}

function render() {
  const terms = norm(input.value.trim()).split(/\s+/).filter(Boolean);
  const query = terms.join(' ');
  shown = terms.length
    ? LIFEKIT_TOOLS.map((t) => ({ t, s: score(t, terms, query) })).filter((x) => x.s > 0).sort((a, b) => b.s - a.s).map((x) => x.t)
    : LIFEKIT_TOOLS;
  active = Math.min(active, Math.max(0, shown.length - 1));
  list.textContent = '';
  empty.hidden = shown.length > 0;
  let lastCat = null;
  shown.forEach((tool, i) => {
    if (!terms.length && tool.category !== lastCat) {
      lastCat = tool.category;
      const g = document.createElement('li');
      g.className = 'group';
      g.setAttribute('role', 'presentation');
      g.textContent = LIFEKIT_CATEGORIES[tool.category];
      list.appendChild(g);
    }
    const li = document.createElement('li');
    li.className = 'item';
    li.setAttribute('role', 'option');
    li.setAttribute('aria-selected', String(i === active));
    li.innerHTML = '<span class="dot"></span><span><div class="name"></div><div class="desc"></div></span>';
    li.querySelector('.dot').textContent = tool.emoji;
    li.querySelector('.name').textContent = tool.name;
    li.querySelector('.desc').textContent = tool.short;
    li.addEventListener('click', () => open(`/tools/${tool.slug}`));
    li.addEventListener('mousemove', () => {
      if (active !== i) {
        active = i;
        updateActive();
      }
    });
    list.appendChild(li);
  });
}

function updateActive() {
  list.querySelectorAll('.item').forEach((el, i) => {
    el.setAttribute('aria-selected', String(i === active));
    if (i === active) el.scrollIntoView({ block: 'nearest' });
  });
}

input.addEventListener('input', () => {
  active = 0;
  render();
});
input.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    active = Math.min(shown.length - 1, active + 1);
    updateActive();
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    active = Math.max(0, active - 1);
    updateActive();
  } else if (e.key === 'Enter') {
    e.preventDefault();
    if (shown[active]) open(`/tools/${shown[active].slug}`);
    else open(`/tools?q=${encodeURIComponent(input.value.trim())}`);
  }
});
document.getElementById('home').addEventListener('click', (e) => {
  e.preventDefault();
  open('/');
});

render();
