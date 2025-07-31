document.addEventListener('DOMContentLoaded', function () {
	function updateCharCount(textareaId, charCountId, maxChars) {
		const textarea = document.getElementById(textareaId);
		const charCount = document.getElementById(charCountId);
		if (!textarea || !charCount) return;

		const update = () => {
			const remaining = maxChars - textarea.value.length;
			charCount.textContent = remaining;
		};

		textarea.addEventListener('input', update);

		update();
	}

	updateCharCount('postContent', 'postCharCount', 1500);
	updateCharCount('bioContent', 'bioCharCount', 160);
	updateCharCount('commentContent', 'commentCharCount', 300);

	// Recalculate count when modal is shown
	document.getElementById('postModal')?.addEventListener('shown.bs.modal', function () {
		const event = new Event('input', { bubbles: true });
		document.getElementById('postContent')?.dispatchEvent(event);
	});

	document.getElementById('biographyModal')?.addEventListener('shown.bs.modal', function () {
		const event = new Event('input', { bubbles: true });
		document.getElementById('bioContent')?.dispatchEvent(event);
	});

	document.getElementById('biographyModal')?.addEventListener('shown.bs.modal', function () {
		const event = new Event('input', { bubbles: true });
		document.getElementById('commentContent')?.dispatchEvent(event);
	});
});
