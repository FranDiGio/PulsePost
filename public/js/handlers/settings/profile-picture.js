document.addEventListener('DOMContentLoaded', function () {
	const previewPic = document.getElementById('previewPic');
	const picInput = document.getElementById('picFileInput');
	const saveButton = document.getElementById('submitPicInput');
	const confirmDeletePicButton = document.getElementById('confirmDeletePicButton');
	const originalPicSource = previewPic.src;
	let picFile = null;

	document.getElementById('triggerPicFileInput').addEventListener('click', function (event) {
		event.preventDefault();
		picInput.value = null;
		picInput.click();
	});

	document.getElementById('picForm').addEventListener('change', function (e) {
		e.preventDefault();
		picFile = null;
		picFile = picInput.files[0];

		if (picFile) {
			const reader = new FileReader();
			reader.onload = function () {
				previewPic.src = reader.result;
			};
			reader.readAsDataURL(picFile);
			saveButton.disabled = false;
		} else {
			previewPic.src = originalPicSource;
			saveButton.disabled = true;
		}
	});

	saveButton.addEventListener('click', function (event) {
		event.preventDefault();

		if (picFile) {
			const formData = new FormData();
			formData.append('profilePic', picFile);

			saveButton.disabled = true;
			saveButton.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';

			fetch('/users/me/picture', {
				method: 'POST',
				body: formData,
			})
				.then((response) => {
					console.log('File uploaded successfully');

					// Clear input file
					picInput.value = null;
					picFile = null;
					previewPic.src = originalPicSource;

					// Close modal
					const picModal = bootstrap.Modal.getInstance(document.getElementById('pictureModal'));
					picModal.hide();
					window.location.reload();
				})
				.catch((error) => {
					console.error('Error uploading file:', error);
					saveButton.innerHTML = 'Save';
					saveButton.disabled = false;
				});
		}
	});

	confirmDeletePicButton.addEventListener('click', function (event) {
		event.preventDefault();

		confirmDeletePicButton.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';
		confirmDeletePicButton.disabled = true;

		fetch('/users/me/picture', {
			method: 'DELETE',
		})
			.then((response) => {
				console.log('Picture deleted successfully');

				picInput.value = null;
				previewPic.src = null;

				// Close modal
				const picModal = bootstrap.Modal.getInstance(document.getElementById('pictureModal'));
				picModal.hide();
				window.location.reload();
			})
			.catch((error) => {
				console.error('Error deleting profile picture:', error);
			});
	});

	document.getElementById('pictureModal').addEventListener('hidden.bs.modal', function () {
		picInput.value = null;
		picFile = null;
		previewPic.src = originalPicSource;

		// Disable "Save" for next time the modal is opened
		saveButton.innerHTML = 'Save';
		saveButton.disabled = true;

		// Enable "Delete" button and override the spinner
		confirmDeletePicButton.innerHTML = 'Delete';
		confirmDeletePicButton.disabled = false;
	});

	saveButton.disabled = true;
});
