//@ts-check
import initializeData, { registerFrame } from "./communication/link-units.js";
import initializeLocalStorage from "./initialize-localstorage.js";
import SETTINGS from "../assets/settings.js";

/**
 * Initializes page elements once page has loaded.
 */
document.addEventListener("DOMContentLoaded", () => {
    initializeData(/** @type {HTMLIFrameElement} */ (document.querySelector("#content-page")), displayMessage).then(({categories, _unitData}) => {
        initializeLocalStorage(categories);
        const nav = /** @type {HTMLElement} */ (document.querySelector("#nav-bar"));

        /** @type {HTMLHeadingElement} */ (nav.querySelector("#version-number")).textContent = SETTINGS.gameVersion;
        /** @type {HTMLDivElement} */ (nav.querySelector("#version-info")).classList.remove("hidden");

        const setPage = (/** @type {HTMLButtonElement} */ target) => {
            nav.querySelectorAll("button").forEach(b => b.classList.remove("current"));
            target.classList.add("current");
        };

        const home = /** @type {HTMLButtonElement} */ (nav.querySelector("#home-button"));
        home.onclick = _ => { if(!home.classList.contains("current")) { setPage(home); loadTo("home"); }};
        const viewUnit = /** @type {HTMLButtonElement} */ (nav.querySelector("#view-unit-button"));
        viewUnit.onclick = _ => { if(!viewUnit.classList.contains("current")) { setPage(viewUnit); loadTo("unit-list"); }};
        const specific = /** @type {HTMLButtonElement} */ (nav.querySelector("#view-singular-button"));
        specific.onclick = _ => { if(!specific.classList.contains("current")) { setPage(specific); loadTo("unit-specific"); }};
        const category = /** @type {HTMLButtonElement} */ (nav.querySelector("#category-button"));
        category.onclick = _ => { if(!category.classList.contains("current")) { setPage(category); loadTo("unit-category"); }};
        const viewcost = /** @type {HTMLButtonElement} */ (nav.querySelector("#view-costs-button"));
        viewcost.onclick = _ => { if(!viewcost.classList.contains("current")) { setPage(viewcost); loadTo("unit-costs"); }};
        const catBase = /** @type {HTMLButtonElement} */ (nav.querySelector("#cat-base-button"));
        catBase.onclick = _ => { if(!catBase.classList.contains("current")) { setPage(catBase); loadTo("cat-base"); }};
        const loadout = /** @type {HTMLButtonElement} */ (nav.querySelector("#loadout-button"));
        loadout.onclick = _ => {
            if(!loadout.classList.contains("current")) {
                setPage(loadout);
                loadTo("loadout");
            } else if(/** @type {HTMLIFrameElement} */ (document.querySelector("#content-page")).contentWindow?.location.href.includes("loadout-display.html")) { // sub-page returns to main page
                loadTo("loadout");
            }
        };
        const settingsPage = /** @type {HTMLButtonElement} */ (nav.querySelector("#settings-button"));
        settingsPage.onclick = _ => { if(!settingsPage.classList.contains("current")) { setPage(settingsPage); loadTo("settings"); }};

        const loadHistory = (/** @type {string} */ pageData) => {
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

        window.addEventListener("popstate", (/** @type {PopStateEvent} */ e) => {
            const targetPage = new URLSearchParams(/** @type {Window} */ (e.target).location.search.slice(1)).get("page") ?? "home";
            setPage(loadHistory(targetPage));
            loadTo(targetPage, true);
        });
    });
});

/**
 * Loads the content iframe to the specified page.
 * @param {string} src An HTMl file path to load.
 * @param {boolean} skipHistory Whether the change of page should create a new element in the user's browsing history. 
 */
function loadTo(src, skipHistory = false) {
    if(!skipHistory && window.localStorage.getItem("s6") === "0") {
        window.history.pushState(src, "", `${window.top?.location.pathname}?page=${src}`);
    }

    const frame = /** @type {HTMLIFrameElement} */ (document.querySelector("#content-page"));
    frame.outerHTML = `<iframe src="./${src}.html" id="content-page" title="Page Content"></iframe>`;
    const newFrame = /** @type {HTMLIFrameElement} */ (document.querySelector("#content-page"));
    registerFrame(newFrame);
}

/**
 * Displays a notice message or error message on screen, overlaid over iframe contents.
 * @param {string} message The message to display.
 * @param {boolean} isError Whether the message is an error message or a notice message.
 */
function displayMessage(message, isError) {
    const saveText = /** @type {HTMLParagraphElement} */ (document.querySelector("#save-change-text"));
    saveText.classList.add("hidden");
    saveText.textContent = message;
    saveText.classList.toggle("error-msg", isError);
    saveText.clientHeight; // forces redraw
    saveText.classList.remove("hidden");
}