document.addEventListener('DOMContentLoaded', function () {
	var rightPanel = document.getElementById('fixed-sidebar-right');
	var leftPanel = document.getElementById('fixed-sidebar-left');
	var postsTitle = document.getElementById('posts-title');
	var creatorsTitle = document.getElementById('creators-title');
	var trendButton = document.getElementById('trending-btn');
	var isTrending = false;

	function ShowTrending() {
		postsTitle.innerText = 'Trending';
		creatorsTitle.innerText = 'Top Creators';
	}

	function ShowLocal() {
		postsTitle.innerText = 'My Posts';
		creatorsTitle.innerText = 'Following';
	}

	function toggleTrending() {
		if (isTrending) {
			ShowLocal();
			isTrending = false;
		} else {
			ShowTrending();
			isTrending = true;
		}
	}

	trendButton.addEventListener('click', toggleTrending);
});
