document.addEventListener('click', function (e) {
	const postTab = e.target.closest('.post-tab');
	const commentTab = e.target.closest('.comments-tab');

	if (postTab) {
		const card = postTab.closest('.card');
		const commentTabEl = card.querySelector('.comments-tab');
		const postSection = card.querySelector('.post-section');
		const commentSection = card.querySelector('.comments-section');

		postTab.classList.add('active');
		commentTabEl.classList.remove('active');
		postSection.classList.remove('d-none');
		commentSection.classList.add('d-none');
	}

	if (commentTab) {
		const card = commentTab.closest('.card');
		const postTabEl = card.querySelector('.post-tab');
		const postSection = card.querySelector('.post-section');
		const commentSection = card.querySelector('.comments-section');

		commentTab.classList.add('active');
		postTabEl.classList.remove('active');
		commentSection.classList.remove('d-none');
		postSection.classList.add('d-none');
	}
});
