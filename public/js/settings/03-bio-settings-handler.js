document.addEventListener('DOMContentLoaded', function () {
	const bioContent = document.getElementById('bioContent');
	const saveButton = document.getElementById('submitBioInput');
	let originalBioContent = '';
	if (bioContent) {
		bioContent.value = bioContent.value.trim();
		originalBioContent = bioContent.value;
	}

	document.getElementById('bioForm').addEventListener('submit', async function (event) {
		event.preventDefault();

		saveButton.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';
		saveButton.disabled = true;

		const form = event.target;
		const bioContent = document.getElementById('bioContent');

		if (!bioContent || !bioContent.value.trim()) {
			alert('Bio content cannot be empty.');
			return;
		}

		const trimmedBioContent = bioContent.value.trim();
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

	document.getElementById('biographyModal').addEventListener('hidden.bs.modal', function () {
		bioContent.value = originalBioContent;
		saveButton.disabled = false;
		saveButton.innerHTML = 'Save';
	});
});
