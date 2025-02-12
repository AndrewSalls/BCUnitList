import loadCannonInfo from "./cat-base/base.js";
import loadOtherInfo from "./cat-base/other.js";
import loadTreasureInfo from "./cat-base/treasure.js";
import loadUpgradeInfo from "./cat-base/upgrade.js";
import createLoadingBar from "./helper/loading.js";

window.addEventListener("DOMContentLoaded", () => {
    const loadingBar = createLoadingBar(7, () => {});

    const tabQuickButtons = document.querySelector("#quick-complete");

    const defaultTab = document.querySelector("#treasure-tab");
    initializeNavButton(defaultTab, document.querySelector("#treasure-selector"));
    defaultTab.addEventListener("click", () => tabQuickButtons.classList.remove("hidden"));
    const cannonTab = document.querySelector("#cannon-tab");
    initializeNavButton(cannonTab, document.querySelector("#cat-base-selector"));
    cannonTab.addEventListener("click", () => tabQuickButtons.classList.remove("hidden"));
    const upgradeTab = document.querySelector("#upgrades-tab");
    initializeNavButton(upgradeTab, document.querySelector("#upgrade-selector"));
    upgradeTab.addEventListener("click", () => tabQuickButtons.classList.remove("hidden"));
    const otherButton = document.querySelector("#other-tab");
    initializeNavButton(otherButton, document.querySelector("#other-selector"));
    otherButton.addEventListener("click", () => tabQuickButtons.classList.add("hidden"));

    defaultTab.click();
    loadingBar.increment();

    window.addEventListener("portLoaded", () => loadBaseSettings(loadingBar));
    if(checkPort()) {
        window.dispatchEvent("portLoaded");
    }
});

function initializeNavButton(button, target) {
    button.addEventListener("click", () => {
        if(!button.classList.contains("current")) {
            document.querySelector("#base-section-nav").querySelectorAll("button").forEach(b => b.classList.remove("current"));
            button.classList.add("current");
            document.querySelectorAll("#tab-list > div").forEach(t => t.classList.add("hidden"));
            target.classList.remove("hidden");
        }
    });
}

function loadBaseSettings(loadingBar) {
    makeRequest(REQUEST_TYPES.GET_SETTINGS, null).then(settings => {
        document.querySelector("#user-rank").textContent = settings.userRank;
        loadingBar.increment();
        loadTreasureInfo(settings);
        loadingBar.increment();
        loadCannonInfo(settings);
        loadingBar.increment();
        loadUpgradeInfo(settings).then(_ => loadingBar.increment());
        loadOtherInfo();
        loadingBar.increment();
        loadTabButtons(settings);
        loadingBar.increment();
    });
}

function loadTabButtons(settings) {
    document.querySelector("#reset-tab").onclick = () => {
        const action = document.querySelector("#base-section-nav .current").id;
        switch(action) {
            case "treasure-tab":
                document.querySelectorAll(".slider-bronze").forEach(s => { s.value = 0; s.dispatchEvent(new Event("change")); });
                document.querySelectorAll(".slider-silver").forEach(s => { s.value = 0; s.dispatchEvent(new Event("change")); });
                document.querySelectorAll(".slider-gold").forEach(s => { s.value = 0; s.dispatchEvent(new Event("change")); });
                break;
            case "cannon-tab":
                document.querySelectorAll(".base-values input[type='number']").forEach(i => { i.value = i.min; i.dispatchEvent(new Event("change")); });
                break;
            case "upgrades-tab":
                const cgs = document.querySelector("#the-one-true-cat");
                cgs.checked = false;
                cgs.dispatchEvent(new Event("change"));
                document.querySelectorAll("#upgrade-selector input[type='number']").forEach(i => { i.value = i.min; i.dispatchEvent(new Event("change")); });
                break;
            default:
                // Does nothing
                break;
        }
    };

    document.querySelector("#max-tab").onclick = () => {
        const action = document.querySelector("#base-section-nav .current").id;
        switch(action) {
            case "treasure-tab":
                document.querySelectorAll(".slider-bronze").forEach(s => { s.value = 0; s.dispatchEvent(new Event("change")); });
                document.querySelectorAll(".slider-silver").forEach(s => { s.value = 0; s.dispatchEvent(new Event("change")); });
                document.querySelectorAll(".slider-gold").forEach(s => { s.value = s.max; s.dispatchEvent(new Event("change")); });
                break;
            case "cannon-tab":
                document.querySelectorAll(".base-values input[type='number']").forEach(i => { i.value = i.max; i.dispatchEvent(new Event("change")); });
                break;
            case "upgrades-tab":
                const cgs = document.querySelector("#the-one-true-cat");
                cgs.checked = true;
                cgs.dispatchEvent(new Event("change"));
                document.querySelectorAll("#upgrade-selector input[type='number']").forEach(i => { i.value = i.max; i.dispatchEvent(new Event("change")); });
                break;
            default:
                // Does nothing
                break;
        }
    };
}