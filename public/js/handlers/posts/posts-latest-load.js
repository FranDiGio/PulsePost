(() => {
	const list = document.getElementById('posts-list');
	const trigger = document.getElementById('infinite-trigger');
	const spinner = document.getElementById('infinite-spinner');
	const label = document.getElementById('infinite-text');
	if (!list || !trigger) return;

	const userPic = list.dataset.userPictureUrl || '/images/default-profile.png';
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
		if (loading || nextCursor === null) return;
		loading = true;
		setLoadingUI(true);

		try {
			const url = new URL(`/posts/latest`, window.location.origin);
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

				const el = document.createElement('div');
				el.className = 'd-flex flex-nowrap pt-4';
				el.innerHTML = `
					<!-- Author Details -->
					<div class="col-2 col-lg-3 d-inline-flex justify-content-end align-items-start me-4">
						<div class="d-flex flex-nowrap dropdown-center border rounded-5 bg-white px-2 py-1">
						<p class="d-xl-block d-none mx-2 my-2">${escapeHtml(post.author ?? '')}</p>
						<a class="d-block link-body-emphasis text-decoration-none" role="button" data-bs-toggle="dropdown">
							<img src="${escapeHtml(post.profilePictureUrl || userPic)}" width="40" height="40" alt="profile-picture" class="rounded-circle" />
						</a>
						<ul class="dropdown-menu">
							<li><a class="dropdown-item" href="/profile/${encodeURIComponent(post.author || '')}">Profile</a></li>
							${
								post.uid && window.currentUserId && post.uid !== window.currentUserId
									? `
							<li>
								<a class="dropdown-item follow-btn"
								data-username="${escapeHtml(post.author || '')}"
								data-following="${post.isFollowedByCurrentUser}">
								${
									post.isFollowedByCurrentUser
										? '<img class="icon-sm" alt="checkmark icon" src="/svg/check2.svg" /> Following'
										: '<span class="text-primary">+</span> Follow'
								}
								</a>
							</li>`
									: ''
							}
						</ul>
						</div>
					</div>

					<!-- Post Details -->
					<div class="col-8">
						<div class="card border-secondary">
						<div class="card-header d-flex justify-content-between">
							<ul class="nav nav-tabs card-header-tabs">
							<li class="nav-item"><a class="nav-link post-tab active">Post</a></li>
							<li class="nav-item">
								<a class="nav-link comments-tab">Comments <span>(${post.commentCount || 0})</span></a>
							</li>
							</ul>
							<p class="d-flex d-xl-none text-muted mb-0 pt-2" style="font-size:0.8rem">${escapeHtml(post.author ?? '')}</p>
						</div>

						<div class="card-body">
							<div class="m-0 p-0 post-section">
							<h5 class="card-title pb-1">${escapeHtml(post.title ?? '')}</h5>
							<p class="card-text post-content mb-1 overflow-hidden">${escapeHtml(post.content ?? '')}</p>
							<button type="button" class="btn text-muted p-0 read-more-btn" style="font-size:0.8rem">Show more</button>
							</div>

							<div class="m-0 p-0 comments-section d-none">
							<div class="container-fluid px-0">
								<div class="d-flex fake-input-bar align-items-center border rounded-5 bg-light ps-2 pe-4 py-2 gap-2"
									data-bs-toggle="modal" data-bs-target="#commentModal"
									data-post-id="${post.id}" role="button">
								<a class="d-flex">
									<img src="${userPic}" width="40" height="40" alt="profile-picture" class="rounded-circle" />
								</a>
								<div class="flex-grow-1 bg-light px-2 py-2"><span class="text-muted">Add a comment</span></div>
								</div>
							</div>
							</div>
						</div>

						<div class="card-footer d-flex justify-content-between">
							<div class="d-flex">
							<button class="like-button p-0" data-post-id="${post.id}">
								${post.isLikedByCurrentUser ? '<i class="heart-icon filled"></i>' : '<i class="heart-icon"></i>'}
							</button>
							<p class="like-count text-muted my-0 ms-2 py-0" style="font-size:0.8rem">${post.likeCount || 0}</p>
							</div>
							<p class="timestamp text-muted my-0 py-0" style="font-size:0.8rem" data-ms="${post.createdAtMs}">
							${post.createdAtMs}
							</p>
						</div>
						</div>
					</div>
					`;
				frag.appendChild(el);
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
