document.addEventListener('DOMContentLoaded', function () {
	const timestamps = document.querySelectorAll('.timestamp');
	timestamps.forEach((timestamp) => {
		const isoString = timestamp.textContent.trim();
		if (isoString) {
			timestamp.textContent = timeSince(isoString);
		} else {
			timestamp.textContent = 'Invalid date';
		}
	});
});

function timeSince(dateString) {
	const date = new Date(dateString);
	if (isNaN(date)) {
		return 'Invalid date';
	}
	const seconds = Math.floor((new Date() - date) / 1000);

	let interval = Math.floor(seconds / 31536000);
	if (interval > 1) return interval + ' years ago';

	interval = Math.floor(seconds / 2592000);
	if (interval > 1) return interval + ' months ago';

	interval = Math.floor(seconds / 86400);
	if (interval > 1) return interval + ' days ago';

	interval = Math.floor(seconds / 3600);
	if (interval > 1) return interval + ' hours ago';

	interval = Math.floor(seconds / 60);
	if (interval > 1) return interval + ' minutes ago';

	return Math.floor(seconds) + ' seconds ago';
}
