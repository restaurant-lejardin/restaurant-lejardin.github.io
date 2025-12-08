/* About page */
document.addEventListener("DOMContentLoaded", () => {
  const footerObserver = new MutationObserver((mutations, observer) => {
    const footer = document.querySelector("footer");
    if (footer && footer.innerHTML.trim() !== "") {
      // Footer is loaded, initialize animations
      observer.disconnect(); // Stop observing

      var title1 = document.querySelector('#title-1');
      var title2 = document.querySelector('#title-2');
      var historyDescription = document.querySelector('#history-description');
      var newsletterForm = document.querySelector('#newsletter-form');

      if (!title1 || !title2 || !historyDescription || !newsletterForm) {
        console.error("One or more elements not found. Check your selectors.");
        return;
      }

      title1.style.opacity = "0";
      title2.style.opacity = "0";
      historyDescription.style.opacity = "0";
      newsletterForm.style.opacity = "0";

      var options = {
        rootMargin: '10px', // Adjusted margin
        threshold: 0.6       // Adjusted threshold
      };

      function callback(entries, observer) {
        entries.forEach(function(entry) {
          console.log("Intersection observed for:", entry.target.id, "with ratio:", entry.intersectionRatio); // Debugging
          switch (entry.target.id) {
            case "title-1":
              if (entry.intersectionRatio > 0) {
                title1.style.opacity = "1";
                title1.className += " animated fadeInDown";
                observer.unobserve(entry.target);
              }
              break;
            case "title-2":
              if (entry.intersectionRatio > 0) {
                title2.style.opacity = "1";
                title2.className += " animated fadeInUp";
                observer.unobserve(entry.target);
              }
              break;
            case "history-description":
              if (entry.intersectionRatio > 0) {
                console.log("Animating #history-description");
                historyDescription.style.opacity = "1";
                historyDescription.className += " animated slideInRight";
                observer.unobserve(entry.target);
              }
              break;
            case "newsletter-form":
              if (entry.intersectionRatio > 0) {
                newsletterForm.style.opacity = "1";
                newsletterForm.className += " animated fadeInUp";
                observer.unobserve(entry.target);
              }
              break;
          }
        });
      }

      // Create an intersection observer
      var observer = new IntersectionObserver(callback, options);

      // Start observing 
      observer.observe(title1);
      observer.observe(title2);
      observer.observe(historyDescription);
      observer.observe(newsletterForm);

      // Fallback: Force visibility after 10 seconds if not triggered
      setTimeout(() => {
        if (historyDescription.style.opacity === "0") {
          console.warn("Fallback triggered for #history-description");
          historyDescription.style.opacity = "1";
          historyDescription.className += " animated slideInRight";
        }
      }, 10000);
    }
  });

  // Observe changes to the footer
  footerObserver.observe(document.body, { childList: true, subtree: true });
});