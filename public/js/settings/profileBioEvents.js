document.getElementById('bioForm').addEventListener('submit', async function (event) {
	event.preventDefault();

	const form = event.target;
	const bioContent = document.getElementById('bioContent').value.trim();

	if (!bioContent) {
		alert('Bio content cannot be empty.');
		return;
	}

	// Manually construct URL-encoded form data
	const formData = new URLSearchParams();
	formData.append('bioContent', bioContent);

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
