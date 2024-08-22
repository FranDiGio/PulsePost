function signOut() {
    fetch('/api/signout', {
        method: 'POST',
    })
        .then((response) => {
            if (response.ok) {
                window.location.href = '/login'
            } else {
                alert('Sign out failed')
            }
        })
        .catch((error) => console.error('Error:', error))
}
