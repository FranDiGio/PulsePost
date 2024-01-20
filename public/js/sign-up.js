
document.addEventListener('DOMContentLoaded', function() {
    function toggleId() {
        var breakpoint = 992;
        var panel = document.getElementById('right-panel') || document.getElementById('full-panel');

        if (window.innerWidth < breakpoint) {
            if (panel.id !== 'full-panel') {
                panel.id = 'full-panel';
            }
        } else {
            if (panel.id !== 'right-panel') {
                panel.id = 'right-panel';
            }
        }
    }

    // Run on load
    toggleId();

    // Bind the resize event
    window.addEventListener('resize', toggleId);
});


