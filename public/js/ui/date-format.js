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

function timeSince(dateIso) {
	const date = new Date(dateIso);
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

function timeSinceShort(ms) {
	if (!ms) return '';
	const seconds = Math.floor((Date.now() - ms) / 1000);

	if (seconds < 60) return `${seconds}s`;
	const minutes = Math.floor(seconds / 60);
	if (minutes < 60) return `${minutes}m`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours}h`;
	const days = Math.floor(hours / 24);
	if (days < 30) return `${days}d`;
	const months = Math.floor(days / 30);
	if (months < 12) return `${months}mo`;
	const years = Math.floor(months / 12);
	return `${years}y`;
}
