document.addEventListener('DOMContentLoaded', function () {
	const saveButton = document.getElementById('submitPasswordInput');
	const inputs = document.querySelectorAll('#changePasswordForm .form-control');

	function checkInputs() {
		let allFilled = true;
		inputs.forEach((input) => {
			if (!input.value.trim()) {
				allFilled = false;
			}
		});
		saveButton.disabled = !allFilled;
	}

	inputs.forEach((input) => {
		input.addEventListener('input', checkInputs);
	});

	document.getElementById('changePasswordForm').addEventListener('submit', async function (event) {
		event.preventDefault();

		const form = event.target;
		const formData = new FormData(form);
		const data = Object.fromEntries(formData.entries());

		saveButton.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';
		saveButton.disabled = true;

		try {
			const response = await fetch('/users/me/password', {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
			});

			const result = await response.json();

			clearValidationErrors();

			if (response.ok) {
				showSuccessMessage();
				form.reset();
			} else {
				handleValidationErrors(result);
			}
		} catch (error) {
			console.error('Error updating password:', error);
		}
	});

	document.getElementById('changePasswordModal').addEventListener('hidden.bs.modal', function () {
		clearInput();
		clearValidationErrors();
		saveButton.disabled = true;
		saveButton.innerHTML = 'Save';
	});

	function clearValidationErrors() {
		const inputs = document.querySelectorAll('.form-control');
		inputs.forEach((input) => {
			input.classList.remove('is-invalid');
			input.removeAttribute('data-bs-original-title');
		});
	}

	function clearInput() {
		const inputs = document.querySelectorAll('.form-control');
		inputs.forEach((input) => {
			input.value = '';
		});
	}

	function handleValidationErrors(errors) {
		if (errors.currentPassword) {
			const currentPasswordInput = document.getElementById('floatingCurrentPassword');
			currentPasswordInput.classList.add('is-invalid');
			currentPasswordInput.setAttribute('data-bs-original-title', errors.currentPassword);
		}

		if (errors.newPassword) {
			const newPasswordInput = document.getElementById('floatingNewPassword');
			const confirmPasswordInput = document.getElementById('floatingConfirmPassword');

			newPasswordInput.classList.add('is-invalid');
			newPasswordInput.setAttribute('data-bs-original-title', errors.newPassword);
			confirmPasswordInput.classList.add('is-invalid');
		}

		saveButton.disabled = false;
		saveButton.innerHTML = 'Save';
	}

	function showSuccessMessage() {
		const changePasswordModalElement = document.getElementById('changePasswordModal');
		const changePasswordModal = bootstrap.Modal.getInstance(changePasswordModalElement);
		changePasswordModal.hide();

		const successModal = new bootstrap.Modal(document.getElementById('passwordChangeSuccessModal'));
		successModal.show();
	}

	saveButton.disabled = true;
});
