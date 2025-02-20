document.addEventListener('DOMContentLoaded', function () {
	const loginForm = document.getElementById('loginForm');
	const loginBtn = document.getElementById('loginBtn');

	loginForm.addEventListener('submit', async function (e) {
		loginBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';
		loginBtn.disabled = true;
	});
});
