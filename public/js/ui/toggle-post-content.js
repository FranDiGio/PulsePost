document.addEventListener('DOMContentLoaded', function () {
	const readMoreButtons = document.querySelectorAll('.read-more-btn');
	const postContents = document.querySelectorAll('.post-content');

	postContents.forEach((content, index) => {
		const fullText = content.innerHTML;
		if (fullText.length > 700) {
			const truncatedText = fullText.slice(0, 700) + '...';
			content.innerHTML = truncatedText;
			content.setAttribute('data-full-text', fullText);
			readMoreButtons[index].style.display = 'inline';
		} else if (content.scrollHeight > 300) {
			content.setAttribute('data-full-text', fullText);
			content.style.maxHeight = `${300}px`;
			readMoreButtons[index].style.display = 'inline';
		} else {
			readMoreButtons[index].style.display = 'none';
		}
	});

	readMoreButtons.forEach((button, index) => {
		button.addEventListener('click', function () {
			const content = postContents[index];
			const fullText = content.getAttribute('data-full-text');

			if (button.textContent.trim() === 'Show more') {
				content.innerHTML = fullText;
				content.style.maxHeight = 'none';
				button.textContent = 'Show less';
			} else {
				const truncatedText = fullText.slice(0, 700) + '...';
				content.innerHTML = truncatedText;
				content.style.maxHeight = `${300}px`;
				button.textContent = 'Show more';
			}
		});
	});
});
