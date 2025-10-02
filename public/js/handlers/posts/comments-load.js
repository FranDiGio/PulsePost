document.addEventListener('DOMContentLoaded', () => {
	const PAGE_SIZE = 5;

	// Per-post state: { loaded: bool, loading: bool, next: {afterTs, afterId} | null }
	const commentsState = new Map();

	function getPostCardById(postId) {
		return document.querySelector(`.like-button[data-post-id="${postId}"]`)?.closest('.card') || null;
	}

	function getCommentsUIForPost(postId) {
		const card = getPostCardById(postId);
		if (!card) return {};
		const commentsSection = card.querySelector('.comments-section');
		if (!commentsSection) return {};
		const container = commentsSection.querySelector('.container-fluid') || commentsSection;

		let list = container.querySelector('.comments-list');
		let loadMoreBtn = container.querySelector('.comments-load-more');

		return { card, commentsSection, container, list, loadMoreBtn };
	}

	async function reloadFirstPage(postId, pageSize = PAGE_SIZE) {
		const { list, loadMoreBtn } = getCommentsUIForPost(postId);
		if (!list) return;

		// Spinner while fetching
		list.innerHTML = `
		<div class="d-flex justify-content-center mt-4 mb-2">
			<div class="spinner-border text-primary" role="status">
			<span class="visually-hidden">Loading...</span>
			</div>
		</div>`;

		// Reset state
		commentsState.set(postId, { loaded: false, loading: false, next: null });

		try {
			const { items, next } = await fetchPage(postId, pageSize);
			list.innerHTML = '';

			if (!items.length) {
				list.innerHTML = `
				<div class="d-flex justify-content-center fst-italic mt-4 mb-2">
					<p class="text-body-secondary mb-0">💬 Looks quiet here... leave a comment?</p>
				</div>`;

				if (loadMoreBtn) loadMoreBtn.classList.add('d-none');
				commentsState.set(postId, { loaded: true, loading: false, next: null });
				return;
			}

			renderComments(list, items, postId);
			commentsState.set(postId, { loaded: true, loading: false, next });

			if (loadMoreBtn) {
				if (next) {
					loadMoreBtn.dataset.next = JSON.stringify(next);
					loadMoreBtn.classList.remove('d-none');
					loadMoreBtn.disabled = false;
					loadMoreBtn.textContent = 'Load more';
				} else {
					loadMoreBtn.classList.add('d-none');
					loadMoreBtn.dataset.next = '';
				}
			}
		} catch (err) {
			console.error('Reload comments failed:', err);
			list.textContent = 'Couldn’t load comments. Try again.';
		}
	}

	// Open tab / Load more
	document.addEventListener('click', async (e) => {
		// Open Comments tab
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

					renderComments(commentsList, items, postId);
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

		// Load more button
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
				renderComments(commentsList, items, postId);
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

	async function fetchPage(postId, limit = PAGE_SIZE, cursor = null) {
		const params = new URLSearchParams({ limit: String(limit) });

		if (cursor?.beforeTs != null && cursor?.beforeId) {
			params.set('beforeTs', String(cursor.beforeTs));
			params.set('beforeId', cursor.beforeId);
		}

		const res = await fetch(`/posts/${encodeURIComponent(postId)}/comments?${params.toString()}`, {
			headers: { Accept: 'application/json' },
			credentials: 'same-origin',
		});

		if (!res.ok) throw new Error(`Failed to fetch comments: ${res.status}`);
		return res.json(); // { items, next }
	}

	function renderComments(listNode, items, postId) {
		for (const comment of items) {
			const row = document.createElement('div');
			row.className = 'mb-3';
			row.innerHTML = `
        <div class="d-flex align-items-start gap-2">
          <div class="fw-semibold">${escapeHtml(comment.author ?? 'Unknown')}</div>
          <div class="text-muted small">${timeSinceMs(comment.createdAtMs)}</div>
          ${
				comment.canDelete
					? `
            <ul class="nav ms-auto">
              <li class="nav-item ms-auto">
                <a class="flex-shrink-0 overflow-hidden pe-1 pt-0 pb-2"
                   style="max-height: 30px; cursor: pointer"
                   data-bs-toggle="dropdown">
                  <img alt="options icon" src="/svg/three-dots-vertical.svg" />
                </a>
                <ul class="dropdown-menu text-small rounded">
                  <li>
                    <a class="dropdown-item delete-comment-link"
                       data-bs-toggle="modal"
                       data-post-id="${postId}"
                       data-comment-id="${comment.id}"
                       data-bs-target="#confirmDeleteCommentModal">
                      Delete comment
                    </a>
                  </li>
                </ul>
              </li>
            </ul>
          `
					: ''
			}
        </div>
        <div class="mt-1">${escapeHtml(comment.content ?? '')}</div>
      `;
			listNode.appendChild(row);
		}
	}

	// After submit: clear & re-fetch
	document.addEventListener('comment:created', (e) => {
		const postId = e.detail?.postId;
		if (!postId) return;

		// Optimistically bump "Comments (N)" badge if visible
		const card = getPostCardById(postId);
		const badge = card?.querySelector('.comments-tab span');
		if (badge) {
			const m = badge.textContent.match(/\((\d+)\)/);
			const n = m ? parseInt(m[1], 10) : 0;
			badge.textContent = `(${n + 1})`;
		}

		reloadFirstPage(postId);
	});
});
