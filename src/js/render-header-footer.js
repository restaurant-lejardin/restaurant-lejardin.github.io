document.addEventListener("DOMContentLoaded", () => {
    fetch("footer.html")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to load footer");
      }
      return response.text();
    })
    .then((footerHTML) => {
      document.querySelector("footer").outerHTML = footerHTML;
    })
    .catch((error) => console.error("Error loading footer:", error));

  });