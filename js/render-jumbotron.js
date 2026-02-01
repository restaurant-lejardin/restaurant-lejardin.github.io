document.addEventListener("DOMContentLoaded",()=>{console.log("DOMContentLoaded event fired.");let u=document.body.id,l=(console.log("Page ID:",u),document.getElementById("jumbotron-placeholder"));console.log("Jumbotron placeholder exists:",!!l);fetch("data/jumbotron-sections.json").then(a=>{if(console.log("Fetch response status:",a.status),a.ok)return a.json();throw new Error("Failed to fetch JSON: "+a.statusText)}).then(a=>{console.log("Data fetched successfully:",a);var o,t,e,s=a.pages[u];s?(console.log("Page data:",s),l&&s.jumbotron?({title:o,backgroundImage:t,srcset:e}=s.jumbotron,console.log("Rendering jumbotron with title:",o),l.innerHTML=`
          <div class="food-jumbotron dark-overlay text-white">
            <img
              src="${t||"https://res.cloudinary.com/lejardin/image/upload/c_scale,f_auto,q_auto,w_2500/v1609326356/Autres/bamboo2_iaabt7.jpg"}"
              srcset="${e||`
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
  `}"
              alt=""
              class="food-jumbotron-bg"
            >
            <div class="food-jumbotron-caption container">
              <h1 id="title-1" class="special-title-2">${o}</h1>
              <div id="menu-icons"></div>
            </div>
          </div>
        `,(t=document.getElementById("menu-icons"))&&s.menuGroups?(console.log("Rendering menu groups..."),e=s.menuGroups.map(a=>{var o=a.items.map(a=>`
              <div class="col">
                <a href="#${a.id}" class="smooth-scroll">
            <img class="menu-icon" src="${a.icon}" alt="${a.text}">
                </a>
                <h6 class="menu-icon-text mt-3 mb-0">${a.text}</h6>
              </div>
            `).join("");return`
          ${a.subtitle?`<h2 class="special-title-3">${a.subtitle}</h2>`:""}
          <div class="row">
            ${o}
          </div><br>
              `}).join(""),t.innerHTML=e):console.warn("Menu groups data not found or container missing.")):console.warn("Jumbotron data or placeholder missing.")):(console.error("No data found for page: "+u),console.log("Available pages in JSON:",Object.keys(a.pages)))}).catch(a=>console.error("Error loading common sections:",a))});