window.addEventListener("load", () => {
  const welcome = document.getElementById("welcome-screen");
  const main = document.getElementById("main-content");

  setTimeout(() => {
    welcome.style.opacity = "0";
    setTimeout(() => {
      welcome.style.display = "none";
      main.style.display = "block";
      main.style.opacity = "0";
      setTimeout(() => main.style.opacity = "1", 100);
    }, 800);
  }, 2500); // show welcome for 2.5 seconds
});
