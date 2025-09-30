document.addEventListener('DOMContentLoaded', function () {
	const postForm = document.getElementById('postForm');
	const postModal = document.getElementById('postModal');
	const submitBtn = document.getElementById('postSubmitBtn');
	const titleInput = document.getElementById('postTitle');
	const contentInput = document.getElementById('postContent');

	postForm.addEventListener('submit', async function (e) {
		e.preventDefault();

		submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';
		submitBtn.disabled = true;

		const title = titleInput.value;
		const content = contentInput.value;

		const formData = new URLSearchParams();
		formData.append('title', title);
		formData.append('content', content);

		try {
			const res = await fetch('/posts', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				body: formData.toString(),
			});

			if (res.ok) {
				window.location.reload();
				return;
			} else {
				const err = await res.json();
				setInvalidFields(err);
			}
		} catch (err) {
			console.error('Error submitting post:', err);
		}

		submitBtn.innerHTML = 'Submit';
		submitBtn.disabled = false;
	});

	postModal.addEventListener('hidden.bs.modal', function () {
		postForm.reset();
		resetFields();
		submitBtn.innerHTML = 'Submit';
		submitBtn.disabled = false;
	});

	function setInvalidFields(error) {
		resetFields();

		if (error.errorCode === 'empty-fields') {
			titleInput.classList.add('is-invalid');
			contentInput.classList.add('is-invalid');
			titleInput.setAttribute('data-bs-title', error.message);
		}
		if (error.errorCode === 'title-too-long') {
			titleInput.classList.add('is-invalid');
			titleInput.setAttribute('data-bs-title', error.message);
		}
		if (error.errorCode === 'content-too-long') {
			contentInput.classList.add('is-invalid');
			contentInput.setAttribute('data-bs-title', error.message);
		}

		// Refresh tooltips
		[titleInput, contentInput].forEach((el) => {
			new bootstrap.Tooltip(el);
		});
	}

	function resetFields() {
		[titleInput, contentInput].forEach((el) => {
			el.classList.remove('is-invalid');
			const instance = bootstrap.Tooltip.getInstance(el);
			if (instance) instance.dispose();
			el.removeAttribute('data-bs-title');
		});
	}
});
