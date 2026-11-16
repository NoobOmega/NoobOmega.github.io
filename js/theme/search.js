/*
 * Meow local search: load the generated index only when it is needed.
 */
const initSearch = () => {
  const overlay = document.querySelector('.search-overlay');
  const input = document.getElementById('search-input');
  const container = document.querySelector('.search-result-container');
  const trigger = document.querySelector('#search-btn a');
  const closeButton = document.querySelector('.search-close-btn');
  if (!overlay || !input || !container || !trigger || !closeButton || overlay.dataset.initialized) return;
  overlay.dataset.initialized = 'true';

  const messages = container.dataset;
  const search = GLOBALCONFIG.search.path && typeof LocalSearch !== 'undefined'
    ? new LocalSearch({
      path: new URL(GLOBALCONFIG.search.path, new URL(GLOBALCONFIG.root, location.origin)).href,
      top_n_per_article: GLOBALCONFIG.search.local.top_n_per_article,
      unescape: false
    }) : null;
  let loading = null;
  let failed = false;
  let composing = false;

  const showMessage = (message, retry = false) => {
    const text = document.createElement('p');
    text.className = 'search-message';
    text.textContent = message;
    container.replaceChildren(text);
    if (retry) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'search-retry';
      button.textContent = messages.retry;
      button.addEventListener('click', loadIndex);
      container.append(button);
    }
  };

  const renderResults = () => {
    if (!search) {
      showMessage(messages.failed);
      return;
    }
    if (!search.isfetched) {
      showMessage(failed ? messages.failed : messages.loading, failed);
      return;
    }
    const query = input.value.trim().toLowerCase();
    const keywords = [...new Set(query.split(/[-\s]+/).filter(Boolean))];
    if (!keywords.length) {
      showMessage(messages.empty);
      return;
    }
    const items = search.getResultItems(keywords);
    items.sort((a, b) => b.includedCount - a.includedCount ||
      b.titleHits - a.titleHits || b.hitCount - a.hitCount || a.id - b.id);
    if (!items.length) {
      showMessage(messages.noResults);
      return;
    }
    const stats = document.createElement('div');
    stats.className = 'search-stats';
    stats.textContent = messages.results.replace('{count}', items.length);
    const list = document.createElement('ul');
    list.className = 'search-result-list';
    list.innerHTML = items.map(result => result.item).join('');
    list.querySelectorAll('a').forEach(link => {
      const url = new URL(link.href);
      url.searchParams.delete('highlight');
      link.href = url.href;
    });
    container.replaceChildren(stats, list);
  };

  const loadIndex = () => {
    if (!search || search.isfetched) {
      renderResults();
      return Promise.resolve();
    }
    if (loading) return loading;
    failed = false;
    container.setAttribute('aria-busy', 'true');
    showMessage(messages.loading);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    loading = search.fetchData({ signal: controller.signal })
      .then(renderResults)
      .catch(error => {
        failed = true;
        console.warn('Search index could not be loaded:', error);
        showMessage(messages.failed, true);
      })
      .finally(() => {
        clearTimeout(timeout);
        loading = null;
        container.setAttribute('aria-busy', 'false');
      });
    return loading;
  };

  const close = () => {
    overlay.removeAttribute('active');
    overlay.setAttribute('aria-hidden', 'true');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.focus({ preventScroll: true });
  };
  trigger.addEventListener('click', event => {
    event.preventDefault();
    if (overlay.hasAttribute('active')) {
      close();
      return;
    }
    overlay.setAttribute('active', '');
    overlay.setAttribute('aria-hidden', 'false');
    trigger.setAttribute('aria-expanded', 'true');
    // Wait for the scale/visibility transition before focusing the input.
    setTimeout(() => {
      if (overlay.hasAttribute('active')) input.focus({ preventScroll: true });
    }, 350);
    loadIndex();
  });
  closeButton.addEventListener('click', close);
  overlay.addEventListener('click', event => {
    if (event.target === overlay) close();
  });
  input.addEventListener('compositionstart', () => { composing = true; });
  input.addEventListener('compositionend', () => {
    composing = false;
    renderResults();
  });
  input.addEventListener('input', () => {
    if (!composing) renderResults();
  });
  overlay.addEventListener('keydown', event => {
    if (composing || event.isComposing) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
    } else if (event.key === 'Enter' && event.target === input) {
      event.preventDefault();
      container.querySelector('.search-result-title')?.click();
    } else if (event.key === 'Tab') {
      const focusable = [...overlay.querySelectorAll('button, input, a[href]')];
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
  if (GLOBALCONFIG.search.local.preload) loadIndex();
};

export default initSearch;
