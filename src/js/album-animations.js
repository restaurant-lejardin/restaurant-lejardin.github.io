/* Album page */
var title1 = document.querySelector('#title-1');
var title2 = document.querySelector('#title-2');
var cards = document.querySelectorAll('.gallery-card');
title1.style.opacity = "0";
title2.style.opacity = "0";
cards.forEach(function(card) {
  card.style.opacity = "0";
});

var options = {
  rootMargin: '0px',
  threshold: 0.2
}

function callback(entries, observer) {
  entries.forEach(function(entry) {
    if (entry.target.id === "title-1" && entry.intersectionRatio > 0) {
      title1.style.opacity = "1";
      title1.className += " animated fadeInDown";
      observer.unobserve(entry.target);
    } else if (entry.target.id === "title-2" && entry.intersectionRatio > 0) {
      title2.style.opacity = "1";
      title2.className += " animated fadeInUp";
      observer.unobserve(entry.target);
    } else if (entry.target.classList.contains('gallery-card') && entry.intersectionRatio > 0) {
      entry.target.style.opacity = "1";
      entry.target.className += " animated slideInUp";
      observer.unobserve(entry.target);
    }
  });
}

// Create an intersection observer
var observer = new IntersectionObserver(callback, options);

// Start observing 
observer.observe(title1);
observer.observe(title2);
cards.forEach(function(card) {
  observer.observe(card);
});