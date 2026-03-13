/* Homepage */
// Refactor: Use a single class for all animated sections
var animatedSections = document.querySelectorAll('.homepage-animate');
animatedSections.forEach(function(el) {
  el.style.opacity = "0";
});

var options = {
  rootMargin: '0px',
  threshold: 0.2
}

function callback(entries, observer) {
  entries.forEach(function(entry) {
    if (entry.intersectionRatio > 0) {
      entry.target.style.opacity = "1";
      // Use data-animate or fallback to slideInUp
      var anim = entry.target.getAttribute('data-animate') || 'slideInUp';
      entry.target.classList.add('animated', anim);
      observer.unobserve(entry.target);
    }
  });
}

var observer = new IntersectionObserver(callback, options);
animatedSections.forEach(function(el) {
  observer.observe(el);
});