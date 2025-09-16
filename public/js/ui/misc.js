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
});

function escapeHtml(str) {
	return String(str).replace(
		/[&<>"']/g,
		(ch) =>
			({
				'&': '&amp;',
				'<': '&lt;',
				'>': '&gt;',
				'"': '&quot;',
				"'": '&#39;',
			})[ch],
	);
}
