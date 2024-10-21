document.addEventListener('DOMContentLoaded', function () {
	const postForm = document.getElementById('postForm');
	const postModal = document.getElementById('postModal');
	const submitBtn = document.getElementById('submitBtn');

	postForm.addEventListener('submit', async function (e) {
		e.preventDefault();

		submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';
		submitBtn.disabled = true;

		const title = document.getElementById('postTitle').value.trim();
		const content = document.getElementById('postContent').value.trim();

		if (!title || !content) {
			alert('Title and content cannot be empty.');
			submitBtn.innerHTML = 'Submit';
			submitBtn.disabled = false;
			return;
		}

		const formData = new URLSearchParams();
		formData.append('title', title);
		formData.append('content', content);

		try {
			const response = await fetch(postForm.action, {
				method: postForm.method,
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				body: formData.toString(),
			});

			if (response.ok) {
				postForm.reset();
				window.location.reload();
			} else {
				const errorMessage = await response.text();
				console.error('Error submitting post:', errorMessage);
			}
		} catch (error) {
			console.error('Error submitting post:', error);
			alert('An error occurred while submitting the post.');
		} finally {
			submitBtn.innerHTML = 'Submit';
			submitBtn.disabled = false;
		}
	});

	postModal.addEventListener('hidden.bs.modal', function () {
		submitBtn.innerHTML = 'Submit';
		submitBtn.disabled = false;
	});
});
