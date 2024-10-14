document.addEventListener('DOMContentLoaded', function () {
	var settingsModal = document.getElementById('settingsModal');
	var actionButtons = document.querySelectorAll('.action-button');

	settingsModal.addEventListener('shown.bs.modal', function () {
		actionButtons.forEach(function (button) {
			button.innerHTML = button.dataset.originalHtml || button.innerHTML;
			button.disabled = false;
		});
	});

	actionButtons.forEach(function (button) {
		button.dataset.originalHtml = button.innerHTML;

		button.addEventListener('click', function () {
			button.disabled = true;
			button.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';

			setTimeout(function () {
				button.innerHTML = button.dataset.originalHtml;
				button.disabled = false;
			}, 2000);
		});
	});
});
