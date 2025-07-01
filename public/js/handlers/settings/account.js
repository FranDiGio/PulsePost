document.addEventListener('DOMContentLoaded', function () {
	const confirmButton = document.getElementById('confirmDeleteAccButton');

	confirmButton.addEventListener('click', async function () {
		try {
			confirmButton.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';
			confirmButton.disabled = true;

			const response = await fetch('/account', {
				method: 'DELETE',
			});

			if (response.ok) {
				confirmButton.disabled = true;
				confirmButton.innerHTML = 'Confirm';
				showSuccessMessage();
			} else {
				console.error('Error deleting account:', await response.text());
			}
		} catch (error) {
			console.error('Error deleting account:', error);
		}
	});

	function showSuccessMessage() {
		const deleteAccountModalElement = document.getElementById('deleteAccountModal');
		const deleteAccountModal = bootstrap.Modal.getInstance(deleteAccountModalElement);
		deleteAccountModal.hide();

		const successModal = new bootstrap.Modal(document.getElementById('accountDeleteSuccessModal'));
		successModal.show();

		// Show the modal for 2 seconds and then sign out
		setTimeout(() => {
			successModal.hide();
			signOut();
		}, 2000);
	}
});
