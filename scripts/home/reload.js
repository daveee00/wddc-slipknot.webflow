// Script to ensure page starts from the beginning when reloaded
window.onload = function () {
  // Scroll to the top of the page
  window.scrollTo(0, 0);
};
// Alternative method using DOMContentLoaded
document.addEventListener("DOMContentLoaded", function () {
  // Scroll to the top of the page
  window.scrollTo(0, 0);
});
// Also handle the beforeunload event to ensure scroll position is reset
window.onbeforeunload = function () {
  // Scroll to the top before the page unloads
  window.scrollTo(0, 0);
};
