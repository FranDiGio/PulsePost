(() => {
	let postId = null;
	let commentIdToDelete = null;

	const deleteBtn = document.getElementById('confirmDeleteCommentButton');
	const modalEl = document.getElementById('confirmDeleteCommentModal');
	if (!deleteBtn || !modalEl) return;

	modalEl.addEventListener('show.bs.modal', (event) => {
		const trigger = event.relatedTarget;
		postId = trigger?.dataset?.postId || null;
		commentIdToDelete = trigger?.dataset?.commentId || null;

		deleteBtn.disabled = false;
		deleteBtn.innerHTML = '<p class="m-0 p-0">Delete</p>';
	});

	deleteBtn.addEventListener('click', async () => {
		if (!commentIdToDelete || !postId) return;

		try {
			deleteBtn.disabled = true;
			deleteBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';

			const res = await fetch(
				`/posts/${encodeURIComponent(postId)}/comments/${encodeURIComponent(commentIdToDelete)}`,
				{
					method: 'DELETE',
					headers: { Accept: 'application/json' },
					credentials: 'same-origin',
				},
			);

			const payload = await res.json().catch(() => ({}));

			if (!res.ok) {
				console.error('Delete failed:', payload);
				alert(payload?.error || 'Failed to delete the comment.');
				deleteBtn.disabled = false;
				deleteBtn.innerHTML = '<p class="m-0 p-0">Delete</p>';
				return;
			}

			window.location.reload();
		} catch (err) {
			console.error('Error deleting comment:', err);
			alert('Network error. Please try again.');
			deleteBtn.disabled = false;
			deleteBtn.innerHTML = '<p class="m-0 p-0">Delete</p>';
		}
	});
})();
