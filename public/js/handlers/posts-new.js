document.addEventListener('DOMContentLoaded', function () {
	const postForm = document.getElementById('postForm');
	const postModal = document.getElementById('postModal');
	const submitBtn = document.getElementById('submitBtn');
	const titleInput = document.getElementById('postTitle');
	const contentInput = document.getElementById('postContent');

	// ===== Logic for Submitting Post =====
	postForm.addEventListener('submit', async function (e) {
		e.preventDefault();

		submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';
		submitBtn.disabled = true;

		const title = document.getElementById('postTitle').value;
		const content = document.getElementById('postContent').value;

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
				resetFields();
				const error = await response.json();
				setInvalidFields(error);
			}
		} catch (error) {
			console.error('Error submitting post:', error);
		} finally {
			submitBtn.innerHTML = 'Submit';
			submitBtn.disabled = false;
		}
	});

	// ===== UI Handling After Submission =====
	postModal.addEventListener('hidden.bs.modal', function () {
		submitBtn.innerHTML = 'Submit';
		submitBtn.disabled = false;
		titleInput.value = '';
		contentInput.value = '';
		resetFields();
	});

	function setInvalidFields(error) {
		const currentTitle = document.getElementById('postTitle');
		const currentContent = document.getElementById('postContent');

		switch (error.errorCode) {
			case 'empty-fields':
				currentTitle.classList.add('is-invalid');
				currentContent.classList.add('is-invalid');
				titleInput.setAttribute('data-bs-title', error.message);
				break;
			case 'title-too-long':
				currentTitle.classList.add('is-invalid');
				currentTitle.setAttribute('data-bs-title', error.message);
				break;
			case 'content-too-long':
				currentContent.classList.add('is-invalid');
				currentContent.setAttribute('data-bs-title', error.message);
				break;
		}

		// Reset tooltips
		const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
		tooltipTriggerList.forEach(function (tooltipTriggerEl) {
			new bootstrap.Tooltip(tooltipTriggerEl);
		});
	}

	function resetFields() {
		titleInput.classList.remove('is-invalid');
		contentInput.classList.remove('is-invalid');

		// Dispose of existing tooltips
		const titleTooltipInstance = bootstrap.Tooltip.getInstance(titleInput);
		if (titleTooltipInstance) {
			titleTooltipInstance.dispose();
		}
		const contentTooltipInstance = bootstrap.Tooltip.getInstance(contentInput);
		if (contentTooltipInstance) {
			contentTooltipInstance.dispose();
		}

		titleInput.removeAttribute('data-bs-title');
		contentInput.removeAttribute('data-bs-title');
	}
});
