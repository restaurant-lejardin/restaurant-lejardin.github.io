/* Food, Desserts and Drinks pages */

/* ======= Observer #1 logic ======= */
var title1 = document.querySelector('#title-1');
var menuIcons = document.querySelector('#menu-icons');
title1.style.opacity = "0";
menuIcons.style.opacity = "0";

var options1 = {
  rootMargin: '0px',
  threshold: 0.2
}

function callback1(entries, observer1) {
  entries.forEach(function(entry) {
    switch (entry.target.id) {
      case "title-1":
        if (entry.intersectionRatio > 0) {
          title1.style.opacity = "1";
          title1.className += " animated fadeInDown";
          // Stop observing target
          observer1.unobserve(entry.target);
        }
        break;
      case "menu-icons":
        if (entry.intersectionRatio > 0) {
          menuIcons.style.opacity = "1";
          menuIcons.className += " animated fadeInUp";
          // Stop observing target
          observer1.unobserve(entry.target);
        }
        break;
    }
  });
}

// Create an intersection observer
var observer1 = new IntersectionObserver(callback1, options1);

// Start observing
observer1.observe(title1);
observer1.observe(menuIcons);

/* ======= Observer #2 logic ======= */
var menuItems = document.querySelectorAll('.menu-item');

menuItems.forEach(function(foodItem) {
  foodItem.style.opacity = "0";
});

var options2 = {
  rootMargin: '0px',
  threshold: 0.2
}

function callback2(entries, observer2) {
  entries.forEach(function(entry) {
    if (entry.intersectionRatio > 0) {
      console.log('Animating:', entry.target);
      entry.target.style.opacity = "1";
      entry.target.className += " animated fadeInUp";
      observer2.unobserve(entry.target);
    }
  });
}

// Function to observe and animate menu items
function observeMenuItems(items) {
  items.forEach(function(foodItem) {
    console.log('Observing menu item:', foodItem);
    foodItem.style.opacity = "0";
    observer2.observe(foodItem);
  });
}

// Create an intersection observer for menu items
var observer2 = new IntersectionObserver(callback2, options2);

// Observe existing menu items
observeMenuItems(menuItems);

// Updated MutationObserver logic to handle three levels: food div, category, and menu items
const mutationObserver = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === "childList") {
      mutation.addedNodes.forEach((node) => {
        console.log('New node detected:', node);
        if (node.nodeType === Node.ELEMENT_NODE) {
          // Check if the node is a category or food div
          if (node.classList.contains("food-category")) {
            console.log('New food category detected:', node);
            // Check for menu items within the category
            const menuItems = node.querySelectorAll('.menu-item');
            menuItems.forEach((menuItem) => {
              console.log('New .menu-item detected in category:', menuItem);
              observeMenuItems([menuItem]);
            });
          }

          // Check if the node itself is a menu item
          if (node.classList.contains("menu-item")) {
            console.log('New .menu-item detected:', node);
            observeMenuItems([node]);
          }

          // Check for menu items in descendants of the food div
          const menuItemsInDescendants = node.querySelectorAll('.menu-item');
          menuItemsInDescendants.forEach((menuItem) => {
            console.log('New .menu-item detected in descendants:', menuItem);
            observeMenuItems([menuItem]);
          });
        }
      });
    }
  });
});

// Start observing the food container for changes
mutationObserver.observe(document.getElementById("food-container"), {
  childList: true,
  subtree: true,
});

const item = document.querySelector('.menu-item');
console.log('Adding animation to item:', item);
item.classList.add('animated', 'fadeInUp');
item.style.opacity = "1";

