document.addEventListener('DOMContentLoaded', function () {
	const followButtons = document.querySelectorAll('.follow-btn');
	const unfollowModal = new bootstrap.Modal(document.getElementById('unfollowModal'));
	const confirmUnfollowBtn = document.getElementById('confirmUnfollowBtn');
	const modalUsernameBody = document.getElementById('modalUsernameBody');

	let pendingUnfollow = null;

	followButtons.forEach((button) => {
		button.addEventListener('click', function (e) {
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
		try {
			const res = await fetch(`/users/${encodeURIComponent(username)}/followers`, {
				method: isFollowing ? 'DELETE' : 'POST',
				headers: { 'Content-Type': 'application/json' },
			});

			if (res.ok) {
				const newState = (!isFollowing).toString();

				// Update all follow buttons for this username
				document.querySelectorAll(`.follow-btn[data-username="${username}"]`).forEach((btn) => {
					btn.dataset.following = newState;

					if (newState === 'true') {
						btn.innerHTML = `
						<img class="icon-sm" alt="checkmark icon" src="/svg/check2.svg" />
						Following
					`;
					} else {
						btn.innerHTML = `
						<span class="text-primary">+</span>
						Follow
					`;
					}
				});
			} else {
				console.error('Follow/unfollow failed');
			}
		} catch (err) {
			console.error('Error sending follow request:', err);
		}
	}
});
