// Unified animation script for all pages
// Usage: Add class 'animate-on-scroll' and optional 'data-animate' attribute to elements
// Example: <div class="animate-on-scroll" data-animate="fadeInUp"></div>

window.initAnimations = function() {
  console.log('[animations.js] DOMContentLoaded');
  var options = {
    rootMargin: '0px',
    threshold: 0.2
  };

  function animateElement(el, observer) {
    el.style.opacity = "0";
    observer.observe(el);
  }

  function callback(entries, observer) {
    entries.forEach(function(entry) {
      if (entry.intersectionRatio > 0) {
        var anim = entry.target.getAttribute('data-animate') || 'slideInUp';
        // console.log('[animations.js] Animating:', entry.target, 'with:', anim);
        entry.target.style.opacity = "1";
        entry.target.classList.add('animated', anim);
        observer.unobserve(entry.target);
      }
    });
  }

  var observer = new IntersectionObserver(callback, options);

  // Animate existing elements
  var animatedElements = document.querySelectorAll('.animate-on-scroll');
  // console.log('[animations.js] Found', animatedElements.length, 'elements to animate');
  animatedElements.forEach(function(el) {
    animateElement(el, observer);
  });

  // MutationObserver to animate new elements
  var mutationObserver = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      mutation.addedNodes.forEach(function(node) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          if (node.classList && node.classList.contains('animate-on-scroll')) {
            animateElement(node, observer);
          }
          // Animate descendants
          var descendants = node.querySelectorAll ? node.querySelectorAll('.animate-on-scroll') : [];
          descendants.forEach(function(descendant) {
            animateElement(descendant, observer);
          });
        }
      });
    });
  });
  mutationObserver.observe(document.body, { childList: true, subtree: true });
};
window.initAnimations();