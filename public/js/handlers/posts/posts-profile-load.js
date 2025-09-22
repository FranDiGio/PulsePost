(() => {
	const list = document.getElementById('posts-list');
	const trigger = document.getElementById('infinite-trigger');
	const spinner = document.getElementById('infinite-spinner');
	const label = document.getElementById('infinite-text');
	if (!list || !trigger) return;

	const userPic = list.dataset.userPictureUrl || '/images/default-profile.png';
	const isSelf = list.dataset.isSelf === 'true';
	const profileId = list.dataset.profileId || '';
	const nextCursorStr = list.dataset.nextCursor || '';

	let renderedIds = [];
	try {
		renderedIds = JSON.parse(list.dataset.initialIds || '[]');
	} catch {}
	const renderedSet = new Set(renderedIds);

	let nextCursor = nextCursorStr !== '' ? Number(nextCursorStr) : null;
	if (nextCursor === null) {
		if (spinner) spinner.classList.add('d-none');
		if (renderedIds.length) {
			if (label) label.textContent = 'No more posts';
		} else {
			if (label) label.textContent = '';
		}
	} else {
		if (label) label.textContent = '';
		window.addEventListener('scroll', enableObserverOnce, { once: true, passive: true });
	}

	let loading = false;
	let observing = false;

	// Show/hide spinner
	function setLoadingUI(isLoading) {
		if (!spinner || !label) return;
		if (isLoading) {
			spinner.classList.remove('d-none');
		} else {
			spinner.classList.add('d-none');
		}
	}

	async function loadMore() {
		if (loading || nextCursor === null || !profileId) return;
		loading = true;
		setLoadingUI(true);

		try {
			const url = new URL(`/posts/${profileId}`, window.location.origin);
			url.searchParams.set('limit', '5');
			url.searchParams.set('beforeTs', String(nextCursor));

			const resp = await fetch(url.toString(), {
				headers: { Accept: 'application/json' },
				credentials: 'same-origin', // Session cookie
			});

			if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
			const { items, nextCursor: nc } = await resp.json();

			const frag = document.createDocumentFragment();
			for (const post of items) {
				if (!post?.id || renderedSet.has(post.id)) continue;
				renderedSet.add(post.id);

				const element = document.createElement('div');
				element.className = 'd-flex flex-nowrap pt-4 m-2';
				element.innerHTML = `
					<div class="col-12">
						<div class="card border-secondary">
						<div class="card-header">
							<ul class="nav nav-tabs card-header-tabs">
							<li class="nav-item">
								<a class="nav-link post-tab active">Post</a>
							</li>
							<li class="nav-item">
								<a class="nav-link comments-tab">
								Comments
								<span>(${post.commentCount || 0})</span>
								</a>
							</li>
							${
								isSelf
									? `
							<li class="nav-item ms-auto">
								<a
								class="flex-shrink-0 overflow-hidden pe-1 pt-0 pb-2"
								style="max-height: 40px; cursor: pointer"
								data-bs-toggle="dropdown"
								>
								<img alt="options icon" src="/svg/three-dots-vertical.svg" />
								</a>
								<ul class="dropdown-menu text-small rounded">
								<li>
									<a
									class="dropdown-item delete-post-link"
									data-key="${post.id}"
									data-bs-toggle="modal"
									data-bs-target="#confirmDeletePostModal"
									>
									Delete post
									</a>
								</li>
								</ul>
							</li>`
									: ``
							}
							</ul>
						</div>

						<div class="card-body">
							<!-- Post Section -->
							<div class="m-0 p-0 post-section">
							<h5 class="card-title pb-1">${escapeHtml(post.title ?? '')}</h5>
							<p class="card-text post-content mb-1 overflow-hidden">${escapeHtml(post.content ?? '')}</p>
							<button type="button" class="btn text-muted p-0 read-more-btn" style="font-size: 0.8rem">
								Show more
							</button>
							</div>

							<!-- Comments Section -->
							<div class="m-0 p-0 comments-section d-none">
							<div class="container-fluid px-0">
								<div
								class="d-flex fake-input-bar align-items-center border rounded-5 bg-light ps-2 pe-4 py-2 gap-2"
								data-bs-toggle="modal"
								data-bs-target="#commentModal"
								data-post-id="${post.id}"
								role="button"
								>
								<a class="d-flex">
									<img
									src="${userPic}"
									width="40"
									height="40"
									alt="profile-picture"
									class="rounded-circle"
									/>
								</a>

								<div class="flex-grow-1 bg-light px-2 py-2">
									<span class="text-muted">Add a comment</span>
								</div>
								</div>
							</div>
							</div>
						</div>

						<div class="card-footer d-flex justify-content-between">
							<div class="d-flex">
							<button class="like-button p-0" data-post-id="${post.id}">
								${post.isLikedByCurrentUser ? '<i class="heart-icon filled"></i>' : '<i class="heart-icon"></i>'}
							</button>
							<p class="like-count text-muted my-0 ms-2 py-0" style="font-size: 0.8rem">
								${post.likeCount || 0}
							</p>
							</div>
							<p class="timestamp text-muted my-0 py-0" style="font-size: 0.8rem" data-ms="${post.createdAtMs}">
							${post.createdAtMs}
							</p>
						</div>
						</div>
					</div>
					`;
				frag.appendChild(element);
			}

			if (window.truncatePostContents) window.truncatePostContents(frag);
			if (window.formatTimestamps) window.formatTimestamps(frag);
			
			list.appendChild(frag);
			nextCursor = nc;

			if (nextCursor === null) {
				if (spinner) spinner.classList.add('d-none');
				if (label) label.textContent = 'No more posts';
				observer.disconnect();
				observing = false;
			} else {
				setLoadingUI(false);
			}
		} catch (err) {
			console.error('loadMore error', err);
			if (label) label.textContent = 'Error loading posts';
			if (spinner) spinner.classList.add('d-none');
		} finally {
			loading = false;
		}
	}

	// Fires when the trigger is within 200px of the viewport bottom
	const observer = new IntersectionObserver(
		(entries) => {
			if (entries.some((e) => e.isIntersecting)) loadMore();
		},
		{ root: null, rootMargin: '0px 0px 200px 0px', threshold: 0 },
	);

	// Prevents auto-loading on initial page load if the trigger is already near viewport
	function enableObserverOnce() {
		if (observing || nextCursor === null) return;
		observer.observe(trigger);
		observing = true;
		window.removeEventListener('scroll', enableObserverOnce);
	}
})();
