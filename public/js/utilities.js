document.addEventListener('DOMContentLoaded', function () {
	// Set like button animation
	document.getElementById('like-button').addEventListener('click', function () {
		const heartIcon = this.querySelector('.heart-icon');
		heartIcon.classList.toggle('filled');
	});

	// Keep post content break lines
	const postContents = document.querySelectorAll('.post-content');
	postContents.forEach(function (postContent) {
		let text = postContent.textContent.trim();
		const formattedText = text.replace(/\n/g, '<br>');
		postContent.innerHTML = formattedText;
	});

	// Initialize character counter for content of post and bio
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
