
function set_window_state(x) {
    if (x.matches) { // If media query matches
        var t = document.getElementById('title-banner')
        t.classList.remove('flex-row');
        t.classList.remove('d-flex');
    } else {
        var t = document.getElementById('title-banner')
        t.classList.push('flex-row');
        t.classList.push('d-flex');
    };

    try {
        buying_setup();
    } catch {}
}

window.onload = function() {

    var x = window.matchMedia("(max-width: 480px)")
    set_window_state(x) // Call listener function at run time
    x.addEventListener("change", set_window_state)

}