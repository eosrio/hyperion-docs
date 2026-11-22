// Keep the post-build Pagefind import native instead of asking webpack to bundle it.
window.hyperionLoadSearch = () => import('/pagefind/pagefind.js');
