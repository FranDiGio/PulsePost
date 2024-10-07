const previewBackground = document.getElementById('previewBackground');
const bgInput = document.getElementById('bgPicInput');
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
	} else {
		previewBackground.src = originalBackgroundSource;
	}
});

document.getElementById('submitBgInput').addEventListener('click', function (event) {
	event.preventDefault();

	document.querySelector('#submitBgInput > p').classList.add('d-none');
	document.querySelector('#submitBgInput > span').classList.remove('d-none');

	if (bgFile) {
		const formData = new FormData();
		formData.append('background', bgFile);

		fetch('/upload/background', {
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
			})
			.finally(() => {
				document.querySelector('#submitBgInput > p').classList.remove('d-none');
				document.querySelector('#submitBgInput > span').classList.add('d-none');
			});
	}
});

document.getElementById('deleteBgButton').addEventListener('click', function (event) {
	event.preventDefault();

	fetch('/delete/background', {
		method: 'POST',
	})
		.then((response) => {
			console.log('Background deleted successfully');

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

document.getElementById('backBgButton').addEventListener('click', function () {
	bgInput.value = null;
	bgFile = null;
	previewBackground.src = originalBackgroundSource;
});
