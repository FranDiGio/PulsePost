function toggleShadow() {
	const myDiv = document.querySelector('.info-structure');
	if (window.innerWidth >= 768) {
		myDiv.classList.add('shadow');
		myDiv.classList.add('mb-5');
	} else {
		myDiv.classList.remove('shadow');
		myDiv.classList.remove('mb-5');
	}
}

window.addEventListener('resize', toggleShadow);
window.addEventListener('load', toggleShadow);
