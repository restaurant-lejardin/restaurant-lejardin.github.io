var title1 = document.querySelector("#title-1"),
    title2 = document.querySelector("#title-2"),
    historyDescription = document.querySelector("#history-description"),
    // jobDescription = document.querySelector("#job-description"),
    newsletterForm = document.querySelector("#newsletter-form");
title1.style.opacity = "0", title2.style.opacity = "0", historyDescription.style.opacity = "0", jobDescription.style.opacity = "0", newsletterForm.style.opacity = "0";
var options = {
    rootMargin: "0px",
    threshold: .2
};

function callback(e, t) {
    e.forEach(function (e) {
        switch (e.target.id) {
            case "title-1":
                0 < e.intersectionRatio && (title1.style.opacity = "1", title1.className += " animated fadeInDown", t.unobserve(e.target));
                break;
            case "title-2":
                0 < e.intersectionRatio && (title2.style.opacity = "1", title2.className += " animated fadeInUp", t.unobserve(e.target));
                break;
            case "history-description":
                0 < e.intersectionRatio && (historyDescription.style.opacity = "1", historyDescription.className += " animated slideInRight", t.unobserve(e.target));
                break;
            // case "job-description":
            //     0 < e.intersectionRatio && (jobDescription.style.opacity = "1", jobDescription.className += " animated slideInRight", t.unobserve(e.target));
            //     break;
            case "newsletter-form":
                0 < e.intersectionRatio && (newsletterForm.style.opacity = "1", newsletterForm.className += " animated fadeInUp", t.unobserve(e.target))
        }
    })
}
var observer = new IntersectionObserver(callback, options);
observer.observe(title1), observer.observe(title2), observer.observe(historyDescription), observer.observe(newsletterForm);//, observer.observe(jobDescription)