document.addEventListener('DOMContentLoaded', function () {
	// Collapse "Following" animation in offcanvas
	document.getElementById('followingToggle').addEventListener('click', function () {
		document.querySelector('#followingToggle .arrow').classList.toggle('down');
	});

	// Like button interaction
	document.querySelectorAll('.like-button').forEach((button) => {
		button.addEventListener('click', async function () {
			const heartIcon = this.querySelector('.heart-icon');
			const postId = this.dataset.postId;
			const likeCountElement = this.closest('.d-flex').querySelector('.like-count');
			let currentCount = parseInt(likeCountElement.textContent, 10);

			// Toggle UI
			const isNowLiked = !heartIcon.classList.contains('filled');
			heartIcon.classList.toggle('filled');
			likeCountElement.textContent = isNowLiked ? currentCount + 1 : currentCount - 1;

			try {
				const res = await fetch(`/likes/${postId}`, {
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
					},
				});

				if (!res.ok) {
					console.error('Failed to toggle like');
					// Revert the UI if server fails
					heartIcon.classList.toggle('filled');
				}
			} catch (err) {
				console.error('Error sending like request:', err);
				// Revert the UI if there's an error
				heartIcon.classList.toggle('filled');
			}
		});
	});

	// Keep post content break lines
	const postContents = document.querySelectorAll('.post-content');
	postContents.forEach(function (postContent) {
		let text = postContent.textContent.trim();
		const formattedText = text.replace(/\n/g, '<br>');
		postContent.innerHTML = formattedText;
	});

	// Initialize character counter for new post and bio content
	function updateCharCount(textareaId, charCountId, maxChars) {
		const textarea = document.getElementById(textareaId);
		const charCount = document.getElementById(charCountId);

		textarea.addEventListener('input', () => {
			const remaining = maxChars - textarea.value.length;
			charCount.textContent = remaining;
		});
	}
	updateCharCount('postContent', 'postCharCount', 1500);
});
