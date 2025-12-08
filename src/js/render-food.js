document.addEventListener("DOMContentLoaded", () => {
  const foodContainer = document.getElementById("food-container");

  // Ensure the food container exists
  if (!foodContainer) {
    console.error("Error: #food-container element not found.");
    return;
  }

  // Get the JSON file path from the data-json attribute
  const jsonFilePath = foodContainer.getAttribute("data-json");
  if (!jsonFilePath) {
    console.error("Error: data-json attribute not set on #food-container.");
    return;
  }

  // Fetch the food data
  fetch(jsonFilePath)
    .then((response) => response.json())
    .then((data) => {
      data.categories.forEach((category) => {
        // Add special title if applicable
        if (category.specialTitle) {
          const hr = document.createElement("hr");
          hr.classList.add("food-horizontal-separation");
          foodContainer.appendChild(hr);
          const specialTitle = document.createElement("h2");
          specialTitle.classList.add("special-title-3");
          specialTitle.textContent = category.specialTitle;
          foodContainer.appendChild(specialTitle);
        }


        // Create category section
        const categoryDiv = document.createElement("div");
        categoryDiv.classList.add("food-category");
        categoryDiv.id = category.id;

        // Add category title
        const categoryTitle = document.createElement("h2");
        categoryTitle.classList.add("banner");
        categoryTitle.textContent = category.title;
        categoryDiv.appendChild(categoryTitle);

        // Add description if available
        if (category.description) {
          const categoryDescription = document.createElement("p");
          categoryDescription.classList.add("category-description");
          categoryDescription.innerHTML = category.description; // Render HTML content
          categoryDiv.appendChild(categoryDescription);
        }


        // Add horizontal rule
        const hr = document.createElement("hr");
        hr.classList.add("food-horizontal-rule");
        categoryDiv.appendChild(hr);

        // Add food items
        category.items.forEach((item) => {
          // Add special title if applicable
          if (item.specialTitle) {
          const specialTitle = document.createElement("h3");
          specialTitle.classList.add("special-title-4");
          specialTitle.textContent = item.specialTitle;
          categoryDiv.appendChild(specialTitle);
          }

          const row = document.createElement("div");
          row.classList.add("row", "align-items-center", "menu-item");

          // Food image
          const imgCol = document.createElement("div");
          imgCol.classList.add("col-md-3", "food-image");
          if (item.image) {
            const img = document.createElement("img");
            img.classList.add("rounded-circle", "lazyload");
            img.setAttribute("data-src", item.image);
            imgCol.appendChild(img);
          }
          row.appendChild(imgCol);

          // Food details
          const detailsCol = document.createElement("div");
          detailsCol.classList.add("col-md-9");
          const foodTitle = document.createElement("h3");
          foodTitle.classList.add("food-title");
          foodTitle.innerHTML = `
            <span class="food-name">${item.name}</span>
            <span class="food-price float-right">${item.price}€</span>
          `;
          detailsCol.appendChild(foodTitle);

          // Add description if available
          if (item.description) {
            const description = document.createElement("p");
            description.classList.add("food-ingredients");
            description.textContent = item.description;
            detailsCol.appendChild(description);
          }

          row.appendChild(detailsCol);

          // Append the row to the category
          categoryDiv.appendChild(row);

          // Add <hr> if showHr is true
          if (item.showHr) {
            const hr = document.createElement("hr");
            hr.classList.add("food-horizontal-rule");
            categoryDiv.appendChild(hr);
          }



        });

        foodContainer.appendChild(categoryDiv);
      });
    })
    .catch((error) => console.error("Error loading food data:", error));

  });