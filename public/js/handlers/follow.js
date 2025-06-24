document.addEventListener('DOMContentLoaded', function () {
	const followButtons = document.querySelectorAll('.follow-btn');

	followButtons.forEach((button) => {
		button.addEventListener('click', async function (e) {
			e.preventDefault();

			const username = this.dataset.username;
			const isFollowing = this.dataset.following === 'true';

			try {
				const res = await fetch(isFollowing ? '/unfollow' : '/follow', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ targetUser: username }),
				});

				if (res.ok) {
					// Toggle dataset
					this.dataset.following = (!isFollowing).toString();

					// Toggle text
					this.innerHTML = `
            <span class="text-primary">${!isFollowing ? '-' : '+'}</span> 
            ${!isFollowing ? 'Unfollow' : 'Follow'}
          `;
				} else {
					console.error('Follow/unfollow failed');
				}
			} catch (err) {
				console.error('Error sending follow request:', err);
			}
		});
	});
});
