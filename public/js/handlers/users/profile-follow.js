document.addEventListener('DOMContentLoaded', function () {
	const followButton = document.getElementById('follow-btn');
	const unfollowModal = new bootstrap.Modal(document.getElementById('unfollowModal'));
	const confirmUnfollowBtn = document.getElementById('confirmUnfollowBtn');
	const modalUsernameBody = document.getElementById('modalUsernameBody');

	let pendingUnfollow = null;

	followButton.addEventListener('click', function (e) {
		e.preventDefault();

		const username = this.dataset.username;
		const isFollowing = this.dataset.following === 'true';

		if (isFollowing) {
			pendingUnfollow = this;
			modalUsernameBody.textContent = username;
			unfollowModal.show();
		} else {
			handleFollowAction(username, isFollowing);
		}
	});

	confirmUnfollowBtn.addEventListener('click', function () {
		if (pendingUnfollow) {
			const username = pendingUnfollow.dataset.username;
			handleFollowAction(username, true);
			unfollowModal.hide();
			pendingUnfollow = null;
		}
	});

	// Handles the HTTP request for both 'follow' and 'unfollow'
	async function handleFollowAction(username, isFollowing) {
		const previousState = isFollowing.toString();
		const newState = (!isFollowing).toString();

		// Optimistically update UI
		followButton.dataset.following = newState;

		if (newState === 'true') {
			followButton.innerHTML = `Following`;
			followButton.classList.remove('btn-outline-primary');
			followButton.classList.add('btn-outline-secondary');
		} else {
			followButton.innerHTML = `Follow`;
			followButton.classList.remove('btn-outline-secondary');
			followButton.classList.add('btn-outline-primary');
		}

		// Send request in background
		try {
			const res = await fetch(isFollowing ? '/unfollow' : '/follow', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ targetUser: username }),
			});

			if (!res.ok) {
				throw new Error('Request failed');
			}
		} catch (err) {
			console.error('Follow/unfollow request failed:', err);

			followButton.dataset.following = previousState;

			if (previousState === 'true') {
				followButton.innerHTML = `Following`;
				followButton.classList.remove('btn-outline-primary');
				followButton.classList.add('btn-outline-secondary');
			} else {
				followButton.innerHTML = `Follow`;
				followButton.classList.remove('btn-outline-secondary');
				followButton.classList.add('btn-outline-primary');
			}
		}
	}
});
