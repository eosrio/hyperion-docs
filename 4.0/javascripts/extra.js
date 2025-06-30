const url = window.location.pathname;

if (url !== '/') {
    const elements = document.getElementsByClassName('md-sidebar--primary');
    console.log(elements);
    if (elements.length > 0) {
        // elements[0].style.display = 'block';
        elements[0].style.opacity = '1';
        elements[0].style.transform = 'translateX(0)';
        elements[0].style.transition = 'all 400ms ease-in-out';
    }
}
