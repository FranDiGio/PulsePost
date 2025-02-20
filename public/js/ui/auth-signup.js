document.addEventListener('DOMContentLoaded', function () {
	const signupForm = document.getElementById('signupForm');
	const signupBtn = document.getElementById('signupBtn');

	signupForm.addEventListener('submit', async function (e) {
		signupBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';
		signupBtn.disabled = true;
	});
});
