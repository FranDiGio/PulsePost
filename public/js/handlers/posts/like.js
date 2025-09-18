(function () {
  // Delegated click handler for dynamically-added .like-button 
  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('.like-button');
    if (!btn) return;

    // Avoid double-submits
    if (btn.dataset.loading === '1') return;
    btn.dataset.loading = '1';

    const heart = btn.querySelector('.heart-icon');
    const postId = btn.dataset.postId;
    const countEl = btn.closest('.d-flex')?.querySelector('.like-count');

    if (!heart || !postId || !countEl) {
      btn.dataset.loading = '';
      return;
    }

    const currentCount = Number.parseInt(countEl.textContent.trim(), 10) || 0;

    // Optimistic toggle
    const wasLiked = heart.classList.contains('filled');
    const nowLiked = !wasLiked;
    heart.classList.toggle('filled', nowLiked);
    countEl.textContent = String(Math.max(0, currentCount + (nowLiked ? 1 : -1)));

    try {
      const res = await fetch(`/likes/${encodeURIComponent(postId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        credentials: 'same-origin',
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

    } catch (err) {
      console.error('Like toggle failed:', err);
      // Revert optimistic UI on failure
      heart.classList.toggle('filled', wasLiked);
      countEl.textContent = String(currentCount);
    } finally {
      btn.dataset.loading = '';
    }
  });

})();
