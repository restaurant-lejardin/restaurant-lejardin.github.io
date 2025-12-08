document.addEventListener("DOMContentLoaded", () => {
    fetch("footer.html")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to load footer");
      }
      return response.text();
    })
    .then((footerHTML) => {
      const pageFooter = document.querySelector("footer.page-footer");
      if (pageFooter) {
        pageFooter.innerHTML = footerHTML;
      }
    })
    .catch((error) => console.error("Error loading footer:", error));
});