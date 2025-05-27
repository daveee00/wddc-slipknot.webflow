see_credits();
function see_credits() {
  const credits = document.getElementById("footer_credits");
  credits.addEventListener("click", (event) => {
    window.alert("progetto realizzato da gruppo 2");
  });
  credits.addEventListener("mouseover", (event) => {
    credits.style.cursor = "pointer";
  });
}


