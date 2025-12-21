// Search Bar Toggle Start
let navbar = document.querySelector(".navbar");
let searchBar = document.querySelector(".search-bar .fa-magnifying-glass");

if (searchBar) {
  searchBar.addEventListener("click", () => {
    navbar.classList.toggle("showInput");

    if (navbar.classList.contains("showInput")) {
      searchBar.classList.replace("fa-magnifying-glass", "fa-x");
    } else {
      searchBar.classList.replace("fa-x", "fa-magnifying-glass");
    }
  });
}
// Search Bar Toggle End

// Menu Toggle Start
let menuIcon = document.querySelector("#menu-icon");
let menu = document.querySelector(".menu");

if (menuIcon) {
  menuIcon.addEventListener("click", () => {
    menu.classList.toggle("active");

    // Toggle icon between bars and x
    if (menu.classList.contains("active")) {
      menuIcon.classList.replace("fa-bars", "fa-x");
    } else {
      menuIcon.classList.replace("fa-x", "fa-bars");
    }
  });
}
// Menu Toggle End

// Authentication Check Start
document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.querySelector(".btn-login");
  const isLoggedIn = localStorage.getItem("isLoggedIn");

  if (loginBtn && isLoggedIn === "true") {
    loginBtn.textContent = "Logout";
    loginBtn.href = "#"; // Prevent immediate redirect
    
    loginBtn.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("isLoggedIn");
      window.location.href = "./login.html";
    });
  }
});
// Authentication Check End