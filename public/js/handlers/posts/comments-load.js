document.addEventListener('DOMContentLoaded', () => {
	const PAGE_SIZE = 5;

	// Per-post state: { loaded: bool, loading: bool, next: {afterTs, afterId} | null }
	const commentsState = new Map();

	// Event delegation: handle clicks on Comments tab and Load more button
	document.addEventListener('click', async (e) => {
		// --- Open Comments tab ---
		const tab = e.target.closest('.comments-tab');
		if (tab) {
			const card = tab.closest('.card');
			const commentsSection = card?.querySelector('.comments-section');
			if (!commentsSection) return;

			const trigger = commentsSection.querySelector('[data-post-id]');
			const postId = trigger?.dataset?.postId || card?.querySelector('.like-button')?.dataset?.postId; // fallback
			if (!postId) return console.error('Missing postId');

			const container = trigger.closest('.container-fluid') || commentsSection;

			let commentsList = container.querySelector('.comments-list');
			if (!commentsList) {
				commentsList = document.createElement('div');
				commentsList.className = 'comments-list mt-3';
				container.appendChild(commentsList);
			}

			// Ensure "Load more" button
			let loadMoreBtn = container.querySelector('.comments-load-more');
			if (!loadMoreBtn) {
				loadMoreBtn = document.createElement('button');
				loadMoreBtn.type = 'button';
				loadMoreBtn.className = 'btn text-muted p-0 comments-load-more d-none shadow-none';
				loadMoreBtn.style.fontSize = '0.8rem';
				loadMoreBtn.textContent = 'Load more';
				loadMoreBtn.dataset.postId = postId;
				container.appendChild(loadMoreBtn);
			}

			// Init state
			if (!commentsState.has(postId)) {
				commentsState.set(postId, { loaded: false, loading: false, next: null });
			}
			const st = commentsState.get(postId);

			// First open: fetch first page
			if (!st.loaded) {
				commentsList.innerHTML = `
				<div class="d-flex justify-content-center mt-4 mb-2">
					<div class="spinner-border text-primary" role="status">
						<span class="visually-hidden">Loading...</span>
					</div>
				</div>`;

				try {
					const { items, next } = await fetchPage(postId, PAGE_SIZE);
					commentsList.innerHTML = '';
					if (!items.length) {
						commentsList.innerHTML = `
							<div class="d-flex justify-content-center fst-italic mt-4 mb-2">
								<p class="text-body-secondary mb-0">💬 Looks quiet here... leave a comment?</p>
							</div>`;

						loadMoreBtn.classList.add('d-none');
						st.loaded = true;
						st.next = null;
						return;
					}
					renderComments(commentsList, items);
					st.loaded = true;
					st.next = next;

					if (next) {
						loadMoreBtn.dataset.next = JSON.stringify(next);
						loadMoreBtn.classList.remove('d-none');
					} else {
						loadMoreBtn.classList.add('d-none');
					}
				} catch (err) {
					commentsList.textContent = 'Couldn’t load comments. Try again.';
					console.error(err);
				}
			}
			return;
		}

		// --- Load more button ---
		const moreBtn = e.target.closest('.comments-load-more');
		if (moreBtn) {
			const postId = moreBtn.dataset.postId;
			const container = moreBtn.closest('.container-fluid') || moreBtn.closest('.comments-section');
			const commentsList = container.querySelector('.comments-list');
			const st = commentsState.get(postId);
			if (!st) return;

			const next = moreBtn.dataset.next ? JSON.parse(moreBtn.dataset.next) : null;
			if (!next || st.loading) return;

			st.loading = true;
			const prevLabel = moreBtn.textContent;
			moreBtn.disabled = true;
			moreBtn.textContent = 'Loading…';

			try {
				const { items, next: nextCursor } = await fetchPage(postId, PAGE_SIZE, next);
				renderComments(commentsList, items);
				st.next = nextCursor;

				if (nextCursor && items.length === PAGE_SIZE) {
					// There might be more: keep button visible
					moreBtn.dataset.next = JSON.stringify(nextCursor);
					moreBtn.disabled = false;
					moreBtn.textContent = prevLabel;
					moreBtn.classList.remove('d-none');
				} else {
					moreBtn.classList.add('d-none');
					moreBtn.dataset.next = '';
				}
			} catch (err) {
				console.error('Load more failed:', err);
				moreBtn.disabled = false;
				moreBtn.textContent = prevLabel;
			} finally {
				st.loading = false;
			}
		}
	});

	async function fetchPage(postId, limit = 5, cursor = null) {
		const params = new URLSearchParams({ limit: String(limit) });
		if (cursor?.afterTs != null && cursor?.afterId) {
			params.set('afterTs', String(cursor.afterTs));
			params.set('afterId', cursor.afterId);
		}
		const res = await fetch(`/posts/${encodeURIComponent(postId)}/comments?${params.toString()}`, {
			headers: { Accept: 'application/json' },
			credentials: 'same-origin',
		});
		if (!res.ok) throw new Error(`Failed to fetch comments: ${res.status}`);
		return res.json(); // { items, next }
	}

	function renderComments(listNode, items) {
		for (const c of items) {
			const row = document.createElement('div');
			row.className = 'mb-3';
			row.innerHTML = `
        <div class="d-flex align-items-start gap-2">
          <div class="fw-semibold">${escapeHtml(c.author ?? 'Unknown')}</div>
          <div class="text-muted small">${timeSinceMs(c.createdAtMs)}</div>
        </div>
        <div class="mt-1">${escapeHtml(c.comment ?? '')}</div>
      `;
			listNode.appendChild(row);
		}
	}
});
