function signOut() {
	fetch('/sessions/me', {
		method: 'DELETE',
		credentials: 'same-origin',
	})
		.then((res) => {
			if (res.ok) {
				window.location.href = '/login/';
			} else {
				alert('Sign out failed');
			}
		})
		.catch((error) => console.error('Error:', error));
}
