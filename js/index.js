import initializeData, { getSettings } from "./communication/link-units.js";

document.addEventListener("DOMContentLoaded", () => {
    initializeLocalStorage();
    initializeData().then(() => {
        const nav = document.querySelector("#nav-bar");

        nav.querySelector("#version-number").textContent = getSettings().gameVersion;
        nav.querySelector("#version-info").classList.remove("hidden");

        const setPage = target => {
            nav.querySelectorAll("button").forEach(b => b.classList.remove("current"));
            target.classList.add("current");
        };

        const home = nav.querySelector("#home-button");
        home.onclick = _ => { if(!home.classList.contains("current")) { setPage(home); loadTo("home"); }};
        const viewUnit = nav.querySelector("#view-unit-button");
        viewUnit.onclick = _ => { if(!viewUnit.classList.contains("current")) { setPage(viewUnit); loadTo("unit-list"); }};
        const specific = nav.querySelector("#view-singular-button");
        specific.onclick = _ => { if(!specific.classList.contains("current")) { setPage(specific); loadTo("unit-specific"); }};
        const category = nav.querySelector("#category-button");
        category.onclick = _ => { if(!category.classList.contains("current")) { setPage(category); loadTo("unit-category"); }};
        const viewcost = nav.querySelector("#view-costs-button");
        viewcost.onclick = _ => { if(!viewcost.classList.contains("current")) { setPage(viewcost); loadTo("unit-costs"); }};
        const settings = nav.querySelector("#settings-button");
        settings.onclick = _ => { if(!settings.classList.contains("current")) { setPage(settings); loadTo("settings"); }};

        const loadHistory = pageData => {
            switch(pageData) {
                case "unit-list":
                    return viewUnit;
                case "unit-specific":
                    return category;
                case "unit-costs":
                    return viewcost;
                case "settings":
                    return settings;
                case "home":
                default:
                    return home;
            }
        };

        loadHistory(new URLSearchParams(window.location.search.slice(1)).get("page")).click();
        window.addEventListener("popstate", e => {
            const targetPage = new URLSearchParams(e.target.location.search.slice(1)).get("page");
            console.log(targetPage);
            setPage(loadHistory(targetPage));
            loadTo(targetPage, true);
        });
    });
});

function loadTo(src, skipHistory = false) {
    if(!skipHistory) {
        window.history.pushState(src, "", `/?page=${src}`);
    }
    const frame = document.querySelector("#content-page");
    const loadEvt = frame.onload;
    frame.outerHTML = `<iframe src="./${src}.html" id="content-page"></iframe>`;
    const newFrame = document.querySelector("#content-page");
    newFrame.onload = loadEvt;
    if(newFrame.contentDocument && newFrame.contentDocument.readyState === "complete") {
        newFrame.onload();
    }
}

function initializeLocalStorage() {
    if(window.localStorage.getItem("f1") === null) {
        window.localStorage.setItem("f1", "0");
    }
    if(window.localStorage.getItem("f2") === null) {
        window.localStorage.setItem("f2", "1");
    }
    if(window.localStorage.getItem("f3") === null) {
        window.localStorage.setItem("f3", "0");
    }
    if(window.localStorage.getItem("f4") === null) {
        window.localStorage.setItem("f4", "1");
    }
    if(window.localStorage.getItem("f5") === null) {
        window.localStorage.setItem("f5", "1");
    }
    if(window.localStorage.getItem("s1") === null) {
        window.localStorage.setItem("s1", "0");
    }
    if(window.localStorage.getItem("s2") === null) {
        window.localStorage.setItem("s2", "1");
    }
    if(window.localStorage.getItem("s3") === null) {
        window.localStorage.setItem("s3", "0");
    }
    if(window.localStorage.getItem("s4") === null) {
        window.localStorage.setItem("s4", "0");
    }
    if(window.localStorage.getItem("s5") === null) {
        window.localStorage.setItem("s5", "0");
    }
}