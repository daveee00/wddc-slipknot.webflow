document.addEventListener("DOMContentLoaded", () => {
  const scrollIndicator = document.querySelector(".scroll-indicator");
  if (!scrollIndicator) return;
  // Fade out the indicator when user starts scrolling
  window.addEventListener("scroll", () => {
    if (window.scrollY > 100) {
      scrollIndicator.classList.add("fade-out");
    } else {
      scrollIndicator.classList.remove("fade-out");
    }
  });
});
