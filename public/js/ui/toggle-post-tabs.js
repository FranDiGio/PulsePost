document.addEventListener('DOMContentLoaded', function () {
	document.querySelectorAll('.card').forEach((card) => {
		const postTab = card.querySelector('.post-tab');
		const commentTab = card.querySelector('.comments-tab');
		const postSection = card.querySelector('.post-section');
		const commentSection = card.querySelector('.comments-section');

		postTab.addEventListener('click', function (e) {
			e.preventDefault();
			if (!postTab.classList.contains('active')) {
				postTab.classList.add('active');
				commentTab.classList.remove('active');
				postSection.classList.remove('d-none');
				commentSection.classList.add('d-none');
			}
		});

		commentTab.addEventListener('click', function (e) {
			e.preventDefault();
			if (!commentTab.classList.contains('active')) {
				commentTab.classList.add('active');
				postTab.classList.remove('active');
				commentSection.classList.remove('d-none');
				postSection.classList.add('d-none');
			}
		});
	});
});
