document.addEventListener('DOMContentLoaded', function () {
	// Collapse "Following" animation in offcanvas
	document.getElementById('followingToggle').addEventListener('click', function () {
		document.querySelector('#followingToggle .arrow').classList.toggle('down');
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
