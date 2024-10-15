document.addEventListener('DOMContentLoaded', function () {
	document.getElementById('like-button').addEventListener('click', function () {
		const heartIcon = this.querySelector('.heart-icon');
		heartIcon.classList.toggle('filled');
	});
});
