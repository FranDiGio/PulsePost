document.getElementById('changePasswordForm').addEventListener('submit', async function (event) {
	event.preventDefault();

	const form = event.target;
	const formData = new FormData(form);
	const data = Object.fromEntries(formData.entries());

	try {
		const response = await fetch(form.action, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		});

		const result = await response.json();

		clearValidationErrors();

		if (response.ok) {
			alert('Password updated successfully');
			form.reset();
		} else {
			handleValidationErrors(result);
		}
	} catch (error) {
		console.error('Error updating password:', error);
		alert('An error occurred while updating the password.');
	}
});

document.getElementById('backPasswordModalButton').addEventListener('click', function () {
	clearInput();
	clearValidationErrors();
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

	// Initialize tooltips again
	const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
	tooltipTriggerList.forEach(function (tooltipTriggerEl) {
		new bootstrap.Tooltip(tooltipTriggerEl);
	});
}
