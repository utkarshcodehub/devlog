(function () {
  const SUPABASE_URL = 'https://xgturrtqrnrrhfamidgh.supabase.co';
  const SUPABASE_ANON_KEY = 'sb_publishable_XC44vNaSpqkGGdigPDPQlg_8p4G7SFd';

  const styles = `
    :host { display: block; font-family: system-ui, -apple-system, sans-serif; }
    * { box-sizing: border-box; margin: 0; padding: 0; }

    .dl-wrap {
      background: #fafafa;
      border: 1px solid #e5e5e5;
      border-radius: 16px;
      padding: 24px;
      max-width: 640px;
      color: #111;
    }

    .dl-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid #e5e5e5;
    }

    .dl-brand {
      font-weight: 800;
      font-size: 15px;
      letter-spacing: -0.3px;
      color: #111;
      text-decoration: none;
    }

    .dl-brand span { color: #6366f1; }

    .dl-username {
      font-family: monospace;
      font-size: 12px;
      color: #888;
    }

    .dl-loading {
      text-align: center;
      padding: 32px;
      font-family: monospace;
      font-size: 12px;
      color: #aaa;
    }

    .dl-error {
      text-align: center;
      padding: 32px;
      font-size: 13px;
      color: #888;
    }

    .dl-empty {
      text-align: center;
      padding: 32px;
      font-size: 13px;
      color: #888;
    }

    .dl-timeline { position: relative; }

    .dl-entry {
      position: relative;
      padding-left: 24px;
      padding-bottom: 28px;
    }

    .dl-entry:last-child { padding-bottom: 0; }

    .dl-entry::before {
      content: '';
      position: absolute;
      left: 7px;
      top: 20px;
      bottom: 0;
      width: 1px;
      background: #e5e5e5;
    }

    .dl-entry:last-child::before { display: none; }

    .dl-dot {
      position: absolute;
      left: 0;
      top: 5px;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      border: 2px solid #6366f1;
      background: #fafafa;
    }

    .dl-date {
      font-family: monospace;
      font-size: 11px;
      color: #aaa;
      margin-bottom: 6px;
    }

    .dl-title {
      font-size: 16px;
      font-weight: 700;
      color: #111;
      margin-bottom: 6px;
      line-height: 1.3;
    }

    .dl-summary {
      font-size: 13px;
      color: #666;
      line-height: 1.6;
      margin-bottom: 10px;
    }

    .dl-bullets {
      list-style: none;
      margin-bottom: 10px;
    }

    .dl-bullets li {
      font-size: 13px;
      color: #444;
      padding: 2px 0;
      display: flex;
      align-items: flex-start;
      gap: 8px;
    }

    .dl-bullet-dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: #6366f1;
      margin-top: 6px;
      flex-shrink: 0;
      opacity: 0.6;
    }

    .dl-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .dl-tag {
      font-family: monospace;
      font-size: 11px;
      color: #6366f1;
      background: rgba(99, 102, 241, 0.06);
      border: 1px solid rgba(99, 102, 241, 0.15);
      border-radius: 6px;
      padding: 2px 8px;
    }

    .dl-footer {
      margin-top: 20px;
      padding-top: 16px;
      border-top: 1px solid #e5e5e5;
      text-align: center;
    }

    .dl-footer a {
      font-family: monospace;
      font-size: 11px;
      color: #aaa;
      text-decoration: none;
    }

    .dl-footer a:hover { color: #6366f1; }
  `;

  async function fetchJSON(url) {
    const res = await fetch(url, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function renderEntry(entry) {
    const bullets = Array.isArray(entry.bullets) ? entry.bullets : [];
    const tags = Array.isArray(entry.tags) ? entry.tags : [];

    const bulletsHTML = bullets.length > 0 ? `
      <ul class="dl-bullets">
        ${bullets.map(b => `
          <li>
            <span class="dl-bullet-dot"></span>
            <span>${escapeHTML(b)}</span>
          </li>
        `).join('')}
      </ul>
    ` : '';

    const tagsHTML = tags.length > 0 ? `
      <div class="dl-tags">
        ${tags.map(t => `<span class="dl-tag">${escapeHTML(t)}</span>`).join('')}
      </div>
    ` : '';

    return `
      <div class="dl-entry">
        <div class="dl-dot"></div>
        <div class="dl-date">${formatDate(entry.created_at)}</div>
        <div class="dl-title">${escapeHTML(entry.title)}</div>
        ${entry.summary ? `<div class="dl-summary">${escapeHTML(entry.summary)}</div>` : ''}
        ${bulletsHTML}
        ${tagsHTML}
      </div>
    `;
  }

  function escapeHTML(str) {
    const d = document.createElement('div');
    d.appendChild(document.createTextNode(str || ''));
    return d.innerHTML;
  }

  async function init(scriptEl) {
    const username = scriptEl.getAttribute('data-username');
    if (!username) return;

    // Create host element after the script tag
    const host = document.createElement('div');
    scriptEl.parentNode.insertBefore(host, scriptEl.nextSibling);

    // Attach shadow DOM
    const shadow = host.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <style>${styles}</style>
      <div class="dl-wrap">
        <div class="dl-header">
          <a class="dl-brand" href="https://devlog-wheat.vercel.app/u/${encodeURIComponent(username)}" target="_blank" rel="noopener">
            Dev<span>Log</span>
          </a>
          <span class="dl-username">@${escapeHTML(username)}</span>
        </div>
        <div class="dl-loading">Loading changelog...</div>
      </div>
    `;

    const wrap = shadow.querySelector('.dl-wrap');
    const loadingEl = shadow.querySelector('.dl-loading');

    try {
      // Resolve username → user_id
      const profiles = await fetchJSON(
        `${SUPABASE_URL}/rest/v1/public_profiles?select=id&username=eq.${encodeURIComponent(username)}&limit=1`
      );

      if (!profiles || profiles.length === 0) {
        loadingEl.outerHTML = `<div class="dl-error">No DevLog found for @${escapeHTML(username)}</div>`;
        return;
      }

      const userId = profiles[0].id;

      // Fetch published entries
      const entries = await fetchJSON(
        `${SUPABASE_URL}/rest/v1/entries?select=*&user_id=eq.${userId}&status=eq.published&order=created_at.desc&limit=20`
      );

      if (!entries || entries.length === 0) {
        loadingEl.outerHTML = `<div class="dl-empty">No published entries yet.</div>`;
      } else {
        loadingEl.outerHTML = `
          <div class="dl-timeline">
            ${entries.map(renderEntry).join('')}
          </div>
          <div class="dl-footer">
            <a href="https://devlog-wheat.vercel.app/u/${encodeURIComponent(username)}" target="_blank" rel="noopener">
              View full changelog on DevLog →
            </a>
          </div>
        `;
      }
    } catch (err) {
      loadingEl.outerHTML = `<div class="dl-error">Failed to load changelog.</div>`;
      console.error('[DevLog widget]', err);
    }
  }

  // Find and initialize all devlog script tags on the page
  const scripts = document.querySelectorAll('script[data-devlog]');
  scripts.forEach(init);

  // Also handle the current script if it has data-username
  const currentScript = document.currentScript;
  if (currentScript && currentScript.getAttribute('data-username')) {
    init(currentScript);
  }
})();