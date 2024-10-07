// Character counter for content of post and bio
function updateCharCount(textareaId, charCountId, maxChars) {
	const textarea = document.getElementById(textareaId);
	const charCount = document.getElementById(charCountId);

	textarea.addEventListener('input', () => {
		const remaining = maxChars - textarea.value.length;
		charCount.textContent = remaining;
	});
}

// Initialize character counters
updateCharCount('postContent', 'postCharCount', 1000);
updateCharCount('bioContent', 'bioCharCount', 160);
