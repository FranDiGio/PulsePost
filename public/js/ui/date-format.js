document.addEventListener('DOMContentLoaded', function () {
	const timestamps = document.querySelectorAll('.timestamp');
	timestamps.forEach((timestamp) => {
		const ms = timestamp.textContent.trim();
		if (ms) {
			timestamp.textContent = timeSinceMs(ms);
		} else {
			timestamp.textContent = 'Invalid date';
		}
	});
});

function timeSinceMs(ms) {
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
