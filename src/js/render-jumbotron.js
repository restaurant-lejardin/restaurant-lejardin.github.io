document.addEventListener("DOMContentLoaded", () => {
  console.log("DOMContentLoaded event fired.");

  const pageId = document.body.id; // Use the `id` attribute of the body to identify the page
  console.log("Page ID:", pageId);

  const jumbotronPlaceholder = document.getElementById("jumbotron-placeholder");

  console.log("Jumbotron placeholder exists:", !!jumbotronPlaceholder);

  // Define default values
  const defaultBackgroundImage = "https://res.cloudinary.com/lejardin/image/upload/c_scale,f_auto,q_auto,w_2500/v1609326356/Autres/bamboo2_iaabt7.jpg";
  const defaultSrcset = `
            https://res.cloudinary.com/lejardin/image/upload/c_scale,f_auto,q_auto,w_300/v1609326356/Autres/bamboo2_iaabt7.jpg 3 00w,
            https://res.cloudinary.com/lejardin/image/upload/c_scale,f_auto,q_auto,w_400/v1609326356/Autres/bamboo2_iaabt7.jpg 400w,
            https://res.cloudinary.com/lejardin/image/upload/c_scale,f_auto,q_auto,w_600/v1609326356/Autres/bamboo2_iaabt7.jpg 600w,
            https://res.cloudinary.com/lejardin/image/upload/c_scale,f_auto,q_auto,w_700/v1609326356/Autres/bamboo2_iaabt7.jpg 700w,
            https://res.cloudinary.com/lejardin/image/upload/c_scale,f_auto,q_auto,w_800/v1609326356/Autres/bamboo2_iaabt7.jpg 800w,
            https://res.cloudinary.com/lejardin/image/upload/c_scale,f_auto,q_auto,w_900/v1609326356/Autres/bamboo2_iaabt7.jpg 900w,
            https://res.cloudinary.com/lejardin/image/upload/c_scale,f_auto,q_auto,w_1000/v1609326356/Autres/bamboo2_iaabt7.jpg 1000w,
            https://res.cloudinary.com/lejardin/image/upload/c_scale,f_auto,q_auto,w_1100/v1609326356/Autres/bamboo2_iaabt7.jpg 1100w,
            https://res.cloudinary.com/lejardin/image/upload/c_scale,f_auto,q_auto,w_1100/v1609326356/Autres/bamboo2_iaabt7.jpg 1100w,
            https://res.cloudinary.com/lejardin/image/upload/c_scale,f_auto,q_auto,w_1200/v1609326356/Autres/bamboo2_iaabt7.jpg 1200w,
            https://res.cloudinary.com/lejardin/image/upload/c_scale,f_auto,q_auto,w_1300/v1609326356/Autres/bamboo2_iaabt7.jpg 1300w,
            https://res.cloudinary.com/lejardin/image/upload/c_scale,f_auto,q_auto,w_1400/v1609326356/Autres/bamboo2_iaabt7.jpg 1400w,
            https://res.cloudinary.com/lejardin/image/upload/c_scale,f_auto,q_auto,w_1400/v1609326356/Autres/bamboo2_iaabt7.jpg 1400w,
            https://res.cloudinary.com/lejardin/image/upload/c_scale,f_auto,q_auto,w_1500/v1609326356/Autres/bamboo2_iaabt7.jpg 1500w,
            https://res.cloudinary.com/lejardin/image/upload/c_scale,f_auto,q_auto,w_1600/v1609326356/Autres/bamboo2_iaabt7.jpg 1600w,
            https://res.cloudinary.com/lejardin/image/upload/c_scale,f_auto,q_auto,w_1600/v1609326356/Autres/bamboo2_iaabt7.jpg 1600w,
            https://res.cloudinary.com/lejardin/image/upload/c_scale,f_auto,q_auto,w_1700/v1609326356/Autres/bamboo2_iaabt7.jpg 1700w,
            https://res.cloudinary.com/lejardin/image/upload/c_scale,f_auto,q_auto,w_1700/v1609326356/Autres/bamboo2_iaabt7.jpg 1700w,
            https://res.cloudinary.com/lejardin/image/upload/c_scale,f_auto,q_auto,w_1800/v1609326356/Autres/bamboo2_iaabt7.jpg 1800w,
            https://res.cloudinary.com/lejardin/image/upload/c_scale,f_auto,q_auto,w_1900/v1609326356/Autres/bamboo2_iaabt7.jpg 1900w,
            https://res.cloudinary.com/lejardin/image/upload/c_scale,f_auto,q_auto,w_1900/v1609326356/Autres/bamboo2_iaabt7.jpg 1900w,
            https://res.cloudinary.com/lejardin/image/upload/c_scale,f_auto,q_auto,w_2000/v1609326356/Autres/bamboo2_iaabt7.jpg 2000w,
            https://res.cloudinary.com/lejardin/image/upload/c_scale,f_auto,q_auto,w_2000/v1609326356/Autres/bamboo2_iaabt7.jpg 2000w,
            https://res.cloudinary.com/lejardin/image/upload/c_scale,f_auto,q_auto,w_2100/v1609326356/Autres/bamboo2_iaabt7.jpg 2100w,
            https://res.cloudinary.com/lejardin/image/upload/c_scale,f_auto,q_auto,w_2100/v1609326356/Autres/bamboo2_iaabt7.jpg 2100w,
            https://res.cloudinary.com/lejardin/image/upload/c_scale,f_auto,q_auto,w_2200/v1609326356/Autres/bamboo2_iaabt7.jpg 2200w,
            https://res.cloudinary.com/lejardin/image/upload/c_scale,f_auto,q_auto,w_2200/v1609326356/Autres/bamboo2_iaabt7.jpg 2200w,
            https://res.cloudinary.com/lejardin/image/upload/c_scale,f_auto,q_auto,w_2200/v1609326356/Autres/bamboo2_iaabt7.jpg 2200w,
            https://res.cloudinary.com/lejardin/image/upload/c_scale,f_auto,q_auto,w_2300/v1609326356/Autres/bamboo2_iaabt7.jpg 2300w,
            https://res.cloudinary.com/lejardin/image/upload/c_scale,f_auto,q_auto,w_2300/v1609326356/Autres/bamboo2_iaabt7.jpg 2300w,
            https://res.cloudinary.com/lejardin/image/upload/c_scale,f_auto,q_auto,w_2400/v1609326356/Autres/bamboo2_iaabt7.jpg 2400w,
            https://res.cloudinary.com/lejardin/image/upload/c_scale,f_auto,q_auto,w_2400/v1609326356/Autres/bamboo2_iaabt7.jpg 2400w,
            https://res.cloudinary.com/lejardin/image/upload/c_scale,f_auto,q_auto,w_2500/v1609326356/Autres/bamboo2_iaabt7.jpg 2500w,
            https://res.cloudinary.com/lejardin/image/upload/c_scale,f_auto,q_auto,w_2500/v1609326356/Autres/bamboo2_iaabt7.jpg 2500w,
            https://res.cloudinary.com/lejardin/image/upload/c_scale,f_auto,q_auto,w_2500/v1609326356/Autres/bamboo2_iaabt7.jpg 2500w
  `;

  // Fetch the common sections JSON
  fetch("config/jumbotron-sections.json")
    .then((response) => {
      console.log("Fetch response status:", response.status);
      if (!response.ok) {
        throw new Error(`Failed to fetch JSON: ${response.statusText}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log("Data fetched successfully:", data);

      const pageData = data.pages[pageId];
      if (!pageData) {
        console.error(`No data found for page: ${pageId}`);
        console.log("Available pages in JSON:", Object.keys(data.pages));
        return;
      }

      console.log("Page data:", pageData);

      // Render the jumbotron
      if (jumbotronPlaceholder && pageData.jumbotron) {
        const { title, backgroundImage, srcset } = pageData.jumbotron;
        console.log("Rendering jumbotron with title:", title);
        jumbotronPlaceholder.innerHTML = `
          <div class="food-jumbotron dark-overlay text-white">
            <img
              src="${backgroundImage || defaultBackgroundImage}"
              srcset="${srcset || defaultSrcset}"
              alt=""
              class="food-jumbotron-bg"
            >
            <div class="food-jumbotron-caption container">
              <h1 id="title-1" class="special-title-2">${title}</h1>
              <div id="menu-icons"></div>
            </div>
          </div>
        `;

        // Render the menu groups inside the jumbotron caption
        const menuIconsContainer = document.getElementById("menu-icons");
        if (menuIconsContainer && pageData.menuGroups) {
          console.log("Rendering menu groups...");
          const menuGroupsHtml = pageData.menuGroups
            .map((group) => {
              const groupHtml = group.items
          .map(
            (item) => `
              <div class="col">
                <a href="#${item.id}" class="smooth-scroll">
            <img class="menu-icon" src="${item.icon}" alt="${item.text}">
                </a>
                <h6 class="menu-icon-text mt-3 mb-0">${item.text}</h6>
              </div>
            `
          )
          .join("");
              return `
          ${group.subtitle ? `<h2 class="special-title-3">${group.subtitle}</h2>` : ""}
          <div class="row">
            ${groupHtml}
          </div><br>
              `;
            })
            .join("");
          menuIconsContainer.innerHTML = menuGroupsHtml;
        } else {
          console.warn("Menu groups data not found or container missing.");
        }
      } else {
        console.warn("Jumbotron data or placeholder missing.");
      }
    })
    .catch((error) => console.error("Error loading common sections:", error));
});