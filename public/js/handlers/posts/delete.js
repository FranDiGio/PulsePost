document.addEventListener('DOMContentLoaded', () => {
	const deleteLinks = document.querySelectorAll('.delete-post-link');
	let postIdToDelete = null;

	deleteLinks.forEach((link) => {
		link.addEventListener('click', (event) => {
			event.preventDefault();
			postIdToDelete = link.dataset.key;
		});
	});

	const confirmDeleteButton = document.getElementById('confirmDeletePostButton');
	confirmDeleteButton.addEventListener('click', async () => {
		if (postIdToDelete) {
			try {
				confirmDeleteButton.disabled = true;
				confirmDeleteButton.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';

				const response = await fetch('/post', {
					method: 'DELETE',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ postId: postIdToDelete }),
				});

				const result = await response.json();

				if (response.ok) {
					window.location.reload();
				} else {
					alert(result.error);
				}
			} catch (error) {
				console.error('Error deleting post:', error);
				alert('Failed to delete the post. Please try again.');
			}
		}
	});
});
