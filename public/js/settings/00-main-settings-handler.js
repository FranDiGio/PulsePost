document.addEventListener('DOMContentLoaded', function () {
	var settingsModal = document.getElementById('settingsModal');
	var actionButtons = document.querySelectorAll('.action-button');

	settingsModal.addEventListener('shown.bs.modal', function () {
		actionButtons.forEach(function (button) {
			button.innerHTML = 'Save';
			button.disabled = false;
		});
	});

	actionButtons.forEach(function (button) {
		button.addEventListener('click', function () {
			button.disabled = true;
			button.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';
		});
	});
});
