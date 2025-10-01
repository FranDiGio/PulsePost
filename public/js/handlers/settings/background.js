document.addEventListener('DOMContentLoaded', function () {
	const previewBackground = document.getElementById('previewBackground');
	const bgInput = document.getElementById('bgPicInput');
	const saveButton = document.getElementById('submitBgInput');
	const confirmDeleteBgButton = document.getElementById('confirmDeleteBgButton');
	const originalBackgroundSource = previewBackground.src;
	let bgFile = null;

	document.getElementById('triggerBgFileInput').addEventListener('click', function (event) {
		event.preventDefault();
		bgInput.value = null;
		bgInput.click();
	});

	document.getElementById('bgPicForm').addEventListener('change', function (e) {
		e.preventDefault();
		bgFile = null;
		bgFile = bgInput.files[0];

		if (bgFile) {
			const reader = new FileReader();
			reader.onload = function () {
				previewBackground.src = reader.result;
			};
			reader.readAsDataURL(bgFile);
			saveButton.disabled = false;
		} else {
			previewBackground.src = originalBackgroundSource;
			saveButton.disabled = true;
		}
	});

	saveButton.addEventListener('click', function (event) {
		event.preventDefault();

		if (bgFile) {
			const formData = new FormData();
			formData.append('background', bgFile);

			saveButton.disabled = true;
			saveButton.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';

			fetch('/users/me/background', {
				method: 'POST',
				body: formData,
			})
				.then((response) => {
					console.log('Background uploaded successfully');

					// Clear input file
					bgInput.value = null;
					bgFile = null;
					previewBackground.src = originalBackgroundSource;

					// Close modal
					const backgroundModal = bootstrap.Modal.getInstance(document.getElementById('backgroundModal'));
					backgroundModal.hide();
					window.location.reload();
				})
				.catch((error) => {
					console.error('Error uploading background:', error);
					saveButton.innerHTML = 'Save';
					saveButton.disabled = false;
				});
		}
	});

	confirmDeleteBgButton.addEventListener('click', function (event) {
		event.preventDefault();

		confirmDeleteBgButton.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';
		confirmDeleteBgButton.disabled = true;

		fetch('/users/me/background', {
			method: 'DELETE',
		})
			.then((response) => {
				bgInput.value = null;
				previewBackground.src = null;

				// Close modal
				const backgroundModal = bootstrap.Modal.getInstance(document.getElementById('backgroundModal'));
				backgroundModal.hide();
				window.location.reload();
			})
			.catch((error) => {
				console.error('Error deleting background:', error);
			});
	});

	document.getElementById('backgroundModal').addEventListener('hidden.bs.modal', function () {
		bgInput.value = null;
		bgFile = null;
		previewBackground.src = originalBackgroundSource;

		// Disable "Save" for next time the modal is opened
		saveButton.innerHTML = 'Save';
		saveButton.disabled = true;

		// Enable "Delete" button and override the spinner
		confirmDeleteBgButton.innerHTML = 'Delete';
		confirmDeleteBgButton.disabled = false;
	});

	saveButton.disabled = true;
});
