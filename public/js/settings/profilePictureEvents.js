const previewPic = document.getElementById('previewPic');
const picInput = document.getElementById('picFileInput');
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
	} else {
		previewPic.src = originalPicSource;
	}
});

document.getElementById('submitPicInput').addEventListener('click', function (event) {
	event.preventDefault();

	document.querySelector('#submitPicInput > p').classList.add('d-none');
	document.querySelector('#submitPicInput > span').classList.remove('d-none');

	if (picFile) {
		const formData = new FormData();
		formData.append('profilePic', picFile);

		fetch('/upload/picture', {
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
			})
			.finally(() => {
				document.querySelector('#submitPicInput > p').classList.remove('d-none');
				document.querySelector('#submitPicInput > span').classList.add('d-none');
			});
	}
});

document.getElementById('deletePicButton').addEventListener('click', function (event) {
	event.preventDefault();

	fetch('/delete/picture', {
		method: 'POST',
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

document.getElementById('backPicButton').addEventListener('click', function () {
	picInput.value = null;
	picFile = null;
	previewPic.src = originalPicSource;
});
