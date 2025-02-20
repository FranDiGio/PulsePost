document.addEventListener('DOMContentLoaded', () => {
	const deleteLinks = document.querySelectorAll('.delete-post-link');

	deleteLinks.forEach((link) => {
		link.addEventListener('click', async (event) => {
			event.preventDefault();

			const postId = link.dataset.key;

			if (confirm('Are you sure you want to delete this post?')) {
				try {
					const response = await fetch('/delete/post', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({ postId }),
					});

					const result = await response.json();

					if (response.ok) {
						alert(result.message);
						setTimeout(() => {
							window.location.reload();
						}, 1000);
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
});
