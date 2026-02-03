/**
 * Gallery Lightbox Handler
 * Initializes carousel and handles thumbnail clicks for lightbox display
 */
document.addEventListener("DOMContentLoaded", () => {
  // Prevent carousel from automatically cycling
  $('#galleryCarousel').carousel({
    interval: false
  });

  let lightbox = false;

  // Thumbnail click handler
  $("#gallery-items").on("click", "a", function(event) {
    event.preventDefault();
    if (lightbox === false) {
      lightbox = true;
      var slideNumber = $(this).attr("data-slide-number");
      $('#galleryCarousel').carousel(Number(slideNumber));
      $("#lightbox").show();
    }
  });

  // Close button handler
  $("#close").click(function() {
    if (lightbox === true) {
      lightbox = false;
      $("#lightbox").hide();
    }
  });

  console.log('Gallery lightbox initialized');
});
