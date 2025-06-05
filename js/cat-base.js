//@ts-check
import loadCannonInfo from "./cat-base/base.js";
import loadOtherInfo from "./cat-base/other.js";
import loadTreasureInfo from "./cat-base/treasure.js";
import loadUpgradeInfo from "./cat-base/upgrade.js";
import { checkPort, REQUEST_TYPES } from "./communication/iframe-link.js";
import createLoadingBar from "./helper/loading.js";

/**
 * Initializes page elements once page has loaded.
 */
window.addEventListener("DOMContentLoaded", () => {
    const loadingBar = createLoadingBar(7, () => {});

    const tabQuickButtons = /** @type {Element} */ (document.querySelector("#quick-complete"));

    const defaultTab = /** @type {HTMLButtonElement} */ (document.querySelector("#treasure-tab"));
    initializeNavButton(defaultTab, /** @type {HTMLDivElement} */ (document.querySelector("#treasure-selector")));
    defaultTab.addEventListener("click", () => tabQuickButtons.classList.remove("hidden"));
    const cannonTab = /** @type {HTMLButtonElement} */ (document.querySelector("#cannon-tab"));
    initializeNavButton(cannonTab, /** @type {HTMLDivElement} */ (document.querySelector("#cat-base-selector")));
    cannonTab.addEventListener("click", () => tabQuickButtons.classList.remove("hidden"));
    const upgradeTab = /** @type {HTMLButtonElement} */ (document.querySelector("#upgrades-tab"));
    initializeNavButton(upgradeTab, /** @type {HTMLDivElement} */ (document.querySelector("#upgrade-selector")));
    upgradeTab.addEventListener("click", () => tabQuickButtons.classList.remove("hidden"));
    const otherButton = /** @type {HTMLButtonElement} */ (document.querySelector("#other-tab"));
    initializeNavButton(otherButton, /** @type {HTMLDivElement} */ (document.querySelector("#other-selector")));
    otherButton.addEventListener("click", () => tabQuickButtons.classList.add("hidden"));

    defaultTab.click();
    loadingBar.increment();

    window.addEventListener("portLoaded", () => loadBaseSettings(loadingBar));
    if(checkPort()) {
        window.dispatchEvent(new CustomEvent("portLoaded"));
    }
});

/**
 * Initializes a button for selecting a tab on the page.
 * @param {HTMLButtonElement} button The button being initialized.
 * @param {HTMLDivElement} target The tab the button controls.
 */
function initializeNavButton(button, target) {
    button.addEventListener("click", () => {
        if(!button.classList.contains("current")) {
            document.querySelector("#base-section-nav")?.querySelectorAll("button").forEach(b => b.classList.remove("current"));
            button.classList.add("current");
            document.querySelectorAll("#tab-list > div").forEach(t => t.classList.add("hidden"));
            target.classList.remove("hidden");
        }
    });
}

/**
 * Loads the page data.
 * @param {import("./helper/loading.js").LOADING_BAR} loadingBar A loading bar to hide page content until all data has been inputted.
 */
function loadBaseSettings(loadingBar) {
    /** @type {HTMLSpanElement} */ (document.querySelector("#user-rank")).textContent = window.localStorage.getItem("ur") ?? "11";
    loadingBar.increment();
    loadTreasureInfo();
    loadingBar.increment();
    loadCannonInfo();
    loadingBar.increment();
    (async () => {
        await loadUpgradeInfo({cgs: await REQUEST_TYPES.GET_CGS(), abilities: await REQUEST_TYPES.GET_ALL_ABILITY()}, REQUEST_TYPES.UPDATE_CGS, REQUEST_TYPES.UPDATE_ABILITY);
        loadingBar.increment();
    })();
    loadOtherInfo();
    loadingBar.increment();
    loadTabButtons();
    loadingBar.increment();
}

/**
 * Loads the buttons for resetting and maxing each tab in the page.
 */
function loadTabButtons() {
    /** @type {HTMLButtonElement} */ (document.querySelector("#reset-tab")).onclick = () => {
        const action = document.querySelector("#base-section-nav .current")?.id;
        switch(action) {
            case "treasure-tab":
                /** @type {NodeListOf<HTMLInputElement>} */ (document.querySelectorAll(".slider-bronze")).forEach(s => { s.value = "0"; s.dispatchEvent(new Event("change")); });
                /** @type {NodeListOf<HTMLInputElement>} */ (document.querySelectorAll(".slider-silver")).forEach(s => { s.value = "0"; s.dispatchEvent(new Event("change")); });
                /** @type {NodeListOf<HTMLInputElement>} */ (document.querySelectorAll(".slider-gold")).forEach(s => { s.value = "0"; s.dispatchEvent(new Event("change")); });
                break;
            case "cannon-tab":
                /** @type {NodeListOf<HTMLInputElement>} */ (document.querySelectorAll(".base-values input[type='number']")).forEach(i => { i.value = i.min; i.dispatchEvent(new Event("change")); });
                break;
            case "upgrades-tab":
                const cgs = /** @type {HTMLInputElement} */ (document.querySelector("#the-one-true-cat"));
                cgs.checked = false;
                cgs.dispatchEvent(new Event("change"));
                /** @type {NodeListOf<HTMLInputElement>} */ (document.querySelectorAll("#upgrade-selector input[type='number']")).forEach(i => { i.value = i.min; i.dispatchEvent(new Event("change")); });
                break;
            default:
                // Does nothing
                break;
        }
    };

    /** @type {HTMLButtonElement} */ (document.querySelector("#max-tab")).onclick = () => {
        const action = document.querySelector("#base-section-nav .current")?.id;
        switch(action) {
            case "treasure-tab":
                /** @type {NodeListOf<HTMLInputElement>} */ (document.querySelectorAll(".slider-bronze")).forEach(s => { s.value = "0"; s.dispatchEvent(new Event("change")); });
                /** @type {NodeListOf<HTMLInputElement>} */ (document.querySelectorAll(".slider-silver")).forEach(s => { s.value = "0"; s.dispatchEvent(new Event("change")); });
                /** @type {NodeListOf<HTMLInputElement>} */ (document.querySelectorAll(".slider-gold")).forEach(s => { s.value = s.max; s.dispatchEvent(new Event("change")); });
                break;
            case "cannon-tab":
                /** @type {NodeListOf<HTMLInputElement>} */ (document.querySelectorAll(".base-values input[type='number']")).forEach(i => { i.value = i.max; i.dispatchEvent(new Event("change")); });
                break;
            case "upgrades-tab":
                const cgs = /** @type {HTMLInputElement} */ (document.querySelector("#the-one-true-cat"));
                cgs.checked = true;
                cgs.dispatchEvent(new Event("change"));
                /** @type {NodeListOf<HTMLInputElement>} */ (document.querySelectorAll("#upgrade-selector input[type='number']")).forEach(i => { i.value = i.max; i.dispatchEvent(new Event("change")); });
                break;
            default:
                // Does nothing
                break;
        }
    };
}