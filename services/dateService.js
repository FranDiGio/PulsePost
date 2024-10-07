export function getFormattedDateTime() {
	const today = new Date();
	const dd = String(today.getDate()).padStart(2, '0');
	const mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
	const yyyy = today.getFullYear();
	const hours = String(today.getHours()).padStart(2, '0');
	const minutes = String(today.getMinutes()).padStart(2, '0');

	return `${dd}-${mm}-${yyyy} ${hours}:${minutes}`;
}
