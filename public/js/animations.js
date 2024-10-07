var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"].is-invalid'));

var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
	return new bootstrap.Tooltip(tooltipTriggerEl);
});

gsap.from('.fixed-sidebar-left', {
	duration: 1,
	x: -100,
	opacity: 0,
});
gsap.from('.fixed-sidebar-right', {
	duration: 1,
	x: 100,
	opacity: 0,
});
