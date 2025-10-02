document.addEventListener('DOMContentLoaded', function () {
	const commentForm = document.getElementById('commentForm');
	const commentModal = document.getElementById('commentModal');
	const submitBtn = document.getElementById('commentSubmitBtn');

	let currentPostId = null;

	commentModal.addEventListener('show.bs.modal', function (event) {
		const trigger = event.relatedTarget;
		const postId = trigger?.dataset?.postId || null;
		currentPostId = postId;

		if (!postId) {
			console.error('Missing data-post-id for comment trigger');
			commentForm.action = '';
			submitBtn.disabled = true;
			return;
		}

		commentForm.action = `/posts/${encodeURIComponent(postId)}/comments`;
		resetFields();
		submitBtn.disabled = false;
		submitBtn.textContent = 'Submit';
	});

	commentForm.addEventListener('submit', async function (e) {
		e.preventDefault();

		submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';
		submitBtn.disabled = true;

		const formData = new URLSearchParams();
		formData.append('comment', document.getElementById('commentContent').value);

		try {
			const res = await fetch(commentForm.action, {
				method: 'POST',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
				body: formData.toString(),
				credentials: 'same-origin',
			});

			if (res.ok) {
				bootstrap.Modal.getOrCreateInstance(commentModal).hide();

				// Reset UI
				commentForm.reset();
				resetFields();
				submitBtn.innerHTML = 'Submit';
				submitBtn.disabled = false;

				// Refresh post comments
				document.dispatchEvent(
					new CustomEvent('comment:created', {
						detail: { postId: currentPostId },
					}),
				);
				return;
			} else {
				let err;
				try {
					err = await res.json();
				} catch {}
				setInvalid(err || { errorCode: 'server-error', message: 'Something went wrong.' });
			}
		} catch (err) {
			console.error('Error submitting comment:', err);
			setInvalid({ errorCode: 'network', message: 'Network error. Please try again.' });
		}

		submitBtn.innerHTML = 'Submit';
		submitBtn.disabled = false;
	});

	commentModal.addEventListener('hidden.bs.modal', function () {
		commentForm.reset();
		resetFields();
		submitBtn.innerHTML = 'Submit';
		submitBtn.disabled = false;
	});

	function setInvalid(error) {
		resetFields();
		const input = document.getElementById('commentContent');

		if (error?.errorCode === 'empty-fields' || error?.errorCode === 'content-too-long') {
			input.classList.add('is-invalid');
			input.setAttribute('data-bs-title', error.message || 'Invalid input');
			new bootstrap.Tooltip(input);
		} else if (error?.errorCode === 'post-not-found') {
			console.error(error.message);
		} else {
			input.classList.add('is-invalid');
			input.setAttribute('data-bs-title', error?.message || 'Something went wrong.');
			new bootstrap.Tooltip(input);
		}
	}

	function resetFields() {
		const input = document.getElementById('commentContent');
		input.classList.remove('is-invalid');
		const tip = bootstrap.Tooltip.getInstance(input);
		if (tip) tip.dispose();
		input.removeAttribute('data-bs-title');
	}
});
