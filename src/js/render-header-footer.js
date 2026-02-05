document.addEventListener("DOMContentLoaded", () => {
    const currentPage = window.location.pathname.split("/").pop();
    const navLinks = document.querySelectorAll("header.page-header .nav-link");

    // Build dropdown groups from menu navigation data
    const menuNavigation = window.menuNavigationData || [];
    const dropdownGroups = {};
    
    // Safety check for menu navigation data
    if (Array.isArray(menuNavigation)) {
        menuNavigation.forEach(item => {
            if (item && item.group && item.page) {
                if (!dropdownGroups[item.group]) {
                    dropdownGroups[item.group] = [];
                }
                // Add .html extension to match actual URLs
                dropdownGroups[item.group].push(item.page + '.html');
            }
        });
    }

    navLinks.forEach((link) => {
        const href = link.getAttribute("href");
        const hrefBasename = href ? href.split("/").pop() : "";

        // Check if the current page matches the link or belongs to a dropdown group
        if (hrefBasename === currentPage || Object.keys(dropdownGroups).some(group => 
            dropdownGroups[group].includes(currentPage) && dropdownGroups[group].includes(hrefBasename))) {
            link.parentElement.classList.add("active");
        }
    });
});