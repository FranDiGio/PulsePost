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
			const method = nowLiked ? 'POST' : 'DELETE';
			const res = await fetch(`/posts/${encodeURIComponent(postId)}/likes`, {
				method,
				headers: { Accept: 'application/json' },
				credentials: 'same-origin',
			});

			if (!res.ok) throw new Error(`HTTP ${res.status}`);

			const data = await res.json().catch(() => null);
			if (data && typeof data.likeCount === 'number') {
				countEl.textContent = String(Math.max(0, data.likeCount));
			}
			if (data && typeof data.isLiked === 'boolean') {
				heart.classList.toggle('filled', data.isLiked);
			}
		} catch (err) {
			console.error('Like request failed:', err);
			// Revert optimistic UI on failure
			heart.classList.toggle('filled', wasLiked);
			countEl.textContent = String(currentCount);
		} finally {
			btn.dataset.loading = '';
		}
	});
})();
