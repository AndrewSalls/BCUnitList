import initializeData from "./communication/link-units.js";

const DEFAULT_SETTINGS = {
    "f1": "0", "f2": "1", "f3": "0", "f4": "1", "f5": "1",
    "s1": "0", "s2": "1", "s3": "0", "s4": "0", "s5": "0", "s6": "0", "s7": "0"
};

document.addEventListener("DOMContentLoaded", () => {
    initializeData().then(({settings, categories, unitData}) => {
        initializeLocalStorage(settings, categories);
        const nav = document.querySelector("#nav-bar");

        nav.querySelector("#version-number").textContent = settings.gameVersion;
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
        const catBase = nav.querySelector("#cat-base-button");
        catBase.onclick = _ => { if(!catBase.classList.contains("current")) { setPage(catBase); loadTo("cat-base"); }};
        const loadout = nav.querySelector("#loadout-button");
        loadout.onclick = _ => {
            if(!loadout.classList.contains("current")) {
                setPage(loadout);
                loadTo("loadout");
            } else if(document.querySelector("#content-page").contentWindow.location.href.includes("loadout-display.html")) { // sub-page returns to main page
                loadTo("loadout");
            }
        };
        const settingsPage = nav.querySelector("#settings-button");
        settingsPage.onclick = _ => { if(!settingsPage.classList.contains("current")) { setPage(settingsPage); loadTo("settings"); }};

        const loadHistory = pageData => {
            switch(pageData) {
                case "unit-list":
                    return viewUnit;
                case "unit-specific":
                    return specific;
                case "unit-category":
                    return category;
                case "unit-costs":
                    return viewcost;
                case "cat-base":
                    return catBase;
                case "loadout":
                    return loadout;
                case "settings":
                    return settingsPage;
                case "home":
                default:
                    return home;
            }
        };

        const pageRef = new URLSearchParams(window.location.search.slice(1)).get("page");
        if(pageRef) {
            loadHistory(pageRef).click();
        } else {
            setPage(home);
            loadTo("home", true);
        }

        window.addEventListener("popstate", e => {
            const targetPage = new URLSearchParams(e.target.location.search.slice(1)).get("page") ?? "home";
            setPage(loadHistory(targetPage));
            loadTo(targetPage, true);
        });
    });
});

function loadTo(src, skipHistory = false) {
    if(!skipHistory && window.localStorage.getItem("s6") === "0") {
        window.history.pushState(src, "", `${window.top.location.pathname}?page=${src}`);
    }

    const frame = document.querySelector("#content-page");
    const loadEvt = frame.onload;
    frame.outerHTML = `<iframe src="./${src}.html" id="content-page" title="Page Content"></iframe>`;
    const newFrame = document.querySelector("#content-page");
    newFrame.onload = loadEvt;
    if(newFrame.contentDocument && newFrame.contentDocument.readyState === "complete") {
        newFrame.onload();
    }
}

function setIfUnset(key, defaultValue) {
    if(window.localStorage.getItem(key) === null) {
        window.localStorage.setItem(key, defaultValue);
    }
}

function initializeLocalStorage(settings, categories) {
    // Site Settings --------------------------------------------
    for(const key of Object.keys(DEFAULT_SETTINGS)) {
        setIfUnset(key, DEFAULT_SETTINGS[key]);
    }

    // Site unit sort settings --------------------------------------------
    setIfUnset("skey", "0");
    setIfUnset("sasc", "Y");
    
    // Categories --------------------------------------------
    for(const superCategory of Object.keys(categories)) {
        const superKey = `gk-${superCategory}`;
        const subLength = Object.keys(categories[superCategory]).length + 1;
        setIfUnset(superKey, "1".repeat(subLength));

        const value = window.localStorage.getItem(superKey);
        if(value.length < subLength) {
            window.localStorage.setItem(superKey, value.padEnd(subLength, "1"));
        }
    }
    setIfUnset("gk-custom", "1");

    // Treasures --------------------------------------------
    for(const chapterAbrv of Object.keys(settings.chapters)) {
        for(let x = 0; x < settings.chapters[chapterAbrv].numberChapters; x++) {
            setIfUnset(`${chapterAbrv}_${x}`, "-0-0-0".repeat(settings.chapters[chapterAbrv].treasurePartCount.length).substring(1));
        }
    }
    
    // Base Development --------------------------------------------
    for(let b = 1; b <= settings.ototo.names.length; b++) {
        setIfUnset(`oo_${b}`, "0-0-0");
    }
    
    // Ability Upgrades --------------------------------------------
    setIfUnset("abo", "1+0-".repeat(settings.abilities.abilityNames.length).substring(0, settings.abilities.abilityNames.length * 4 - 1));
    setIfUnset("cgs", "0");

    // Other Cat Base --------------------------------------------
    setIfUnset("akl", "0");
    setIfUnset("akb", "0");

    // Save Metadata --------------------------------------------
    window.localStorage.setItem("lg", settings.gameVersion);
    window.localStorage.setItem("ls", settings.version);
}