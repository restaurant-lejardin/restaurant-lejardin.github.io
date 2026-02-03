document.addEventListener("DOMContentLoaded", () => {

    const currentPage = window.location.pathname.split("/").pop();
    const navLinks = document.querySelectorAll("header.page-header .nav-link");

    // Define dropdown groups
    const dropdownGroups = {
      "Menu": ["food.html", "entrees.html", "desserts.html", "drinks.html", "formules.html", "english-menu.html"],
      "Album": ["gallery.html", "gallery-food.html", "gallery-desserts.html", "gallery-location.html"]
    };

    navLinks.forEach((link) => {
      const href = link.getAttribute("href");

      // Check if the current page matches the link or belongs to a dropdown group
      if (href === currentPage || Object.keys(dropdownGroups).some(group => dropdownGroups[group].includes(currentPage) && dropdownGroups[group].includes(href))) {
        link.parentElement.classList.add("active");
      }
    });
});