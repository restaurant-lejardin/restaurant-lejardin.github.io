var title1=document.querySelector("#title-1"),menuIcons=document.querySelector("#menu-icons"),options1=(title1.style.opacity="0",menuIcons.style.opacity="0",{rootMargin:"0px",threshold:.2});function callback1(e,t){e.forEach(function(e){switch(e.target.id){case"title-1":0<e.intersectionRatio&&(title1.style.opacity="1",title1.className+=" animated fadeInDown",t.unobserve(e.target));break;case"menu-icons":0<e.intersectionRatio&&(menuIcons.style.opacity="1",menuIcons.className+=" animated fadeInUp",t.unobserve(e.target))}})}var observer1=new IntersectionObserver(callback1,options1),menuItems=(observer1.observe(title1),observer1.observe(menuIcons),document.querySelectorAll(".menu-item")),options2=(menuItems.forEach(function(e){e.style.opacity="0"}),{rootMargin:"0px",threshold:.2});function callback2(e,t){e.forEach(function(e){0<e.intersectionRatio&&(e.target.style.opacity="1",e.target.className+=" animated fadeInUp",t.unobserve(e.target))})}var observer2=new IntersectionObserver(callback2,options2);menuItems.forEach(function(e){observer2.observe(e)});