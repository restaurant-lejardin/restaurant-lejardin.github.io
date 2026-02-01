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

  // Check if the data-json attribute corresponds to drinks
  const isDrinksPage = jsonFilePath === "data/drinks-data.json";

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

          // Add <hr> if showHr is true before the item
          if (item.showHr) {
            const hr = document.createElement("hr");
            hr.classList.add("food-horizontal-rule");
            categoryDiv.appendChild(hr);
          }
          // Add special title if applicable
          if (item.specialTitle) {
          const specialTitle = document.createElement("h3");
          specialTitle.classList.add("special-title-4");
          specialTitle.textContent = item.specialTitle;
          categoryDiv.appendChild(specialTitle);
          }

          const row = document.createElement("div");
          row.classList.add("row", "align-items-center", "menu-item");

            // Replace food-image with menu-OU-text for formules page
            if (jsonFilePath === "data/formules-data.json" && item["ou-highlight"]) {
              const ouTextDiv = document.createElement("div");
              ouTextDiv.classList.add("col-md-2", "menu-OU-text");
              ouTextDiv.innerHTML = "<u>OU</u>";
              row.appendChild(ouTextDiv);
            } else if (!isDrinksPage) {
              // Add eventual food image for non-drinks pages
              const imgCol = document.createElement("div");
              imgCol.classList.add("col-md-2", "food-image");
              if (item.image) {
                const img = document.createElement("img");
                img.classList.add("rounded-circle", "lazyload");
                img.setAttribute("data-src", item.image);
                imgCol.appendChild(img);
              }
              row.appendChild(imgCol);
            }


            // Add vegan indicator column
            const veganIndicatorCol = document.createElement("div");
            veganIndicatorCol.classList.add("col-md-1", "vegan-indicator","text-right");
            veganIndicatorCol.style.flex = "0 0 auto"; // Reduce space allocation
            if (item.veganType) {
              const veganLogo = document.createElement("img");
              veganLogo.classList.add("vegan-logo");
              veganLogo.src = item.veganType === "vege"
                ? "media/vg.png"
                : "media/vg_pos.png";
              veganLogo.alt = item.veganType === "vege" ? "Végétarien" : "Végétarien Possible";
              veganIndicatorCol.appendChild(veganLogo);
            }
            row.appendChild(veganIndicatorCol);

            // Food details
            const detailsCol = document.createElement("div");
            detailsCol.classList.add(isDrinksPage ? "col-md-12" : "col-md-9");

            // Add a column for vegan/vegetarian indicator before food details
            const foodTitle = document.createElement("h3");
            // Use the correct class for formules
            const foodTitleClass = jsonFilePath === "data/formules-data.json" ? "formule-title" : "food-title";
            foodTitle.classList.add(foodTitleClass);

            foodTitle.innerHTML = `
              <span class="food-name">${item.name}</span>
              ${item.price ? `<span class="food-price">${item.price}€</span>` : ""}
            `;
            detailsCol.appendChild(foodTitle);

          // Add description if available
          if (item.description) {
            const description = document.createElement("p");
            description.classList.add("food-ingredients");
            description.innerHTML = item.description;
            detailsCol.appendChild(description);
          }

          row.appendChild(detailsCol);

          // Append the row to the category
          categoryDiv.appendChild(row);

        });

        foodContainer.appendChild(categoryDiv);
      });
    })
    .catch((error) => console.error("Error loading food data:", error));

  });