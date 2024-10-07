document.addEventListener('DOMContentLoaded', function () {
	const bioContent = document.getElementById('bioContent');
	if (bioContent) {
		bioContent.value = bioContent.value.trim();
	}
});

document.getElementById('bioForm').addEventListener('submit', async function (event) {
	event.preventDefault();

	const form = event.target;
	const bioContent = document.getElementById('bioContent');

	if (!bioContent || !bioContent.value.trim()) {
		alert('Bio content cannot be empty.');
		return;
	}

	// Trim the bio content
	const trimmedBioContent = bioContent.value.trim();

	// Manually construct URL-encoded form data
	const formData = new URLSearchParams();
	formData.append('bioContent', trimmedBioContent);

	const response = await fetch(form.action, {
		method: form.method,
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body: formData.toString(),
	});

	if (response.ok) {
		window.location.reload();
	} else {
		const errorMessage = await response.text();
		console.error('Error updating bio:', errorMessage);
	}
});
