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
				handleFollowAction(this, username, isFollowing);
			}
		});
	});

	confirmUnfollowBtn.addEventListener('click', function () {
		if (pendingUnfollow) {
			const username = pendingUnfollow.dataset.username;
			handleFollowAction(pendingUnfollow, username, true);
			unfollowModal.hide();
			pendingUnfollow = null;
		}
	});

	// Handles the HTTP request for both 'follow' and 'unfollow'
	async function handleFollowAction(button, username, isFollowing) {
		try {
			const res = await fetch(isFollowing ? '/unfollow' : '/follow', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ targetUser: username }),
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
