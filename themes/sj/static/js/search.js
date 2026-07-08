/* Search powered by Fuse.js */
let fuse = null;

async function initSearch() {
  const res = await fetch('/index.json');
  const posts = await res.json();
  fuse = new Fuse(posts, {
    keys: [
      { name: 'title',       weight: 0.6 },
      { name: 'description', weight: 0.3 },
      { name: 'tags',        weight: 0.2 },
      { name: 'content',     weight: 0.1 },
    ],
    threshold: 0.35,
    includeScore: true,
    ignoreLocation: true,
  });
}

function highlight(text, query) {
  if (!text || !query) return text || '';
  const re = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(re, '<mark>$1</mark>');
}

function renderResults(results, query) {
  const container = document.getElementById('search-results');
  if (!container) return;

  if (!results.length) {
    container.innerHTML = `<p class="search-empty">No results for "<strong>${query}</strong>".</p>`;
    return;
  }

  container.innerHTML = results.map(({ item }) => `
    <a class="search-result-card" href="${item.url}">
      ${item.cover ? `<img class="search-result-img" src="${item.cover}" alt="">` : ''}
      <div class="search-result-body">
        <div class="search-result-tags">${(item.tags || []).slice(0,2).map(t => `<span class="tag">${t}</span>`).join('')}</div>
        <h3 class="search-result-title">${highlight(item.title, query)}</h3>
        <p class="search-result-desc">${highlight(item.description, query)}</p>
        <div class="search-result-meta">${item.date} · ${item.readingTime} min read</div>
      </div>
    </a>
  `).join('');
}

document.addEventListener('DOMContentLoaded', async () => {
  const input   = document.getElementById('search-input');
  const counter = document.getElementById('search-counter');
  if (!input) return;

  await initSearch();

  // Handle URL query param
  const q = new URLSearchParams(window.location.search).get('q');
  if (q) { input.value = q; doSearch(q); }

  input.addEventListener('input', () => doSearch(input.value.trim()));

  function doSearch(query) {
    if (!query) {
      document.getElementById('search-results').innerHTML = '';
      if (counter) counter.textContent = '';
      return;
    }
    const results = fuse.search(query).slice(0, 20);
    if (counter) counter.textContent = `${results.length} result${results.length !== 1 ? 's' : ''}`;
    renderResults(results, query);
  }
});
