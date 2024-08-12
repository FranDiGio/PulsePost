var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"].is-invalid'))

var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl)
})
