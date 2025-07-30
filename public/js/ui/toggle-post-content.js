document.addEventListener('DOMContentLoaded', function () {
	const readMoreButtons = document.querySelectorAll('.read-more-btn');
	const postContents = document.querySelectorAll('.post-content');

	const charLimit = 700;
	const breaklineLimit = 6;

	postContents.forEach((content, index) => {
		const fullHTML = content.innerHTML;
		const tempDiv = document.createElement('div');
		tempDiv.innerHTML = fullHTML;

		let charCount = 0;
		let breakCount = 0;
		let truncatedHTML = '';

		for (const node of tempDiv.childNodes) {
			const nodeHTML = node.outerHTML || node.textContent;
			const nodeText = node.textContent || '';
			const nodeBreaks = (nodeText.match(/\n/g) || []).length + (nodeHTML.match(/<br\s*\/?>/gi) || []).length;

			if (charCount + nodeText.length > charLimit || breakCount + nodeBreaks > breaklineLimit) break;

			charCount += nodeText.length;
			breakCount += nodeBreaks;
			truncatedHTML += nodeHTML;
		}

		const needsTruncation =
			charCount < content.textContent.length || breakCount < (content.textContent.match(/\n/g) || []).length;

		if (needsTruncation) {
			content.innerHTML = truncatedHTML + '...';
			content.setAttribute('data-full-text', fullHTML);
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
				button.textContent = 'Show less';
			} else {
				const tempDiv = document.createElement('div');
				tempDiv.innerHTML = fullText;

				let charCount = 0;
				let breakCount = 0;
				let truncatedHTML = '';

				for (const node of tempDiv.childNodes) {
					const nodeHTML = node.outerHTML || node.textContent;
					const nodeText = node.textContent || '';
					const nodeBreaks =
						(nodeText.match(/\n/g) || []).length + (nodeHTML.match(/<br\s*\/?>/gi) || []).length;

					if (charCount + nodeText.length > charLimit || breakCount + nodeBreaks > breaklineLimit) break;

					charCount += nodeText.length;
					breakCount += nodeBreaks;
					truncatedHTML += nodeHTML;
				}

				content.innerHTML = truncatedHTML + '...';
				button.textContent = 'Show more';
			}
		});
	});
});
