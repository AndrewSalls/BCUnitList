//@ts-check
import { createSearchDropdown, initializeDataset } from "./helper/make-searchable.js";
import { encodeLink } from "./helper/encoder.js";
import { createMinimalLoadout } from "./unit-table/creation/create-loadout-table.js";
import { checkPort, REQUEST_TYPES } from "./communication/iframe-link.js";
import SETTINGS from "../assets/settings.js";

let unlockedCannons = [];

/**
 * Initializes page elements once page has loaded.
 */
document.addEventListener("DOMContentLoaded", () => {
    initializeContent();

    window.addEventListener("portLoaded", loadLoadouts);
    if(checkPort()) {
        window.dispatchEvent(new CustomEvent("portLoaded"));
    }
});

/**
 * Initializes static content on the page.
 */
function initializeContent() {
    const addButton = /** @type {HTMLButtonElement} */ (document.querySelector("#add-loadout"));
    const addTo = /** @type {HTMLDivElement} */ (document.querySelector("#loadout-container"));

    addButton.onclick = () => {
        addTo.appendChild(createLoadout(null, SETTINGS));
    };

    const editToggle = /** @type {HTMLButtonElement} */ (document.querySelector("#toggle-display-mode"));
    editToggle.onclick = () => {
        const state = document.body.classList.toggle("disabled-editing-mode");
        /** @type {NodeListOf<HTMLInputElement>} */ (document.querySelectorAll(".loadout-name")).forEach(n => n.disabled = state);
        window.localStorage.setItem("tdm", state ? "1" : "0");
    }
    
    const viewShared = /** @type {HTMLButtonElement} */ (document.querySelector("#query-display-loadout"));
    viewShared.onclick = () => window.location.href = "./loadout-display.html";
}

/**
 * Loads content that relies on connecting to the main window.
 */
async function loadLoadouts() {
    const cannonTypeCount = SETTINGS.ototo.names.length;
    for(let x = 2; x <= cannonTypeCount; x++) {
        const cannonValues = window.localStorage.getItem(`oo_${x}`)?.split("-") ?? ["0", "0", "0"];
        unlockedCannons[x - 1] = { cannon: parseInt(cannonValues[0]) > 0, style: parseInt(cannonValues[1]) > 0, foundation: parseInt(cannonValues[2]) > 0 }
    }
    unlockedCannons[0] = { cannon: true, style: true, foundation: true }; // default base always available

    const datalist = createSearchDropdown();
    document.body.appendChild(datalist);
    await initializeDataset(datalist, await REQUEST_TYPES.GET_OWNED_FORM_NAMES(true));

    const res = await REQUEST_TYPES.GET_ALL_LOADOUT();
    const wrapper = document.querySelector("#loadout-container");
    for(const loadout of res) {
        wrapper?.appendChild(createLoadout(loadout, SETTINGS));
    }
    
    if(window.localStorage.getItem("tdm") === "1") {
        /** @type {HTMLButtonElement} */ (document.querySelector("#toggle-display-mode")).click();
    }
}

/**
 * Creates a loadout element.
 * @param {import("./data/loadout-data.js").LOADOUT|null} loadoutData A prexisting loadout to create, or null if a new loadout is being created.
 * @returns {HTMLDivElement} The created loadout display.
 */
function createLoadout(loadoutData, settings) {
    let minimalLoadout = null;
    const requestSave = () => {
        const loadoutUnits = [...minimalLoadout.querySelectorAll(".chip.set-unit")].map(c => parseInt(c.dataset.id));
        const position = Array.prototype.indexOf.call(document.querySelectorAll(".loadout-wrapper"), minimalLoadout);
        if(loadoutUnits.length > 0) {
            minimalLoadout.classList.add("save");
            REQUEST_TYPES.MODIFY_LOADOUT(position, createLoadoutObject(minimalLoadout));
        } else if(minimalLoadout.classList.contains("save")) {
            REQUEST_TYPES.DELETE_LOADOUT(position);
        }
    };
    minimalLoadout = createMinimalLoadout(loadoutData, unlockedCannons, requestSave, settings);
    
    const options = minimalLoadout.querySelector(".loadout-options");
    minimalLoadout.querySelector(".loadout-name")?.addEventListener("input", requestSave);

    const rightOptionWrapper = document.createElement("div");
    rightOptionWrapper.classList.add("loadout-options-right");

    const deleteOption = document.createElement("button");
    deleteOption.type = "button";
    deleteOption.classList.add("delete-loadout");
    deleteOption.classList.add("active");
    deleteOption.textContent = "Delete Loadout";
    deleteOption.onclick = () => {
        if(minimalLoadout.classList.contains("save")) {
            REQUEST_TYPES.DELETE_LOADOUT(Array.prototype.indexOf.call(document.querySelectorAll(".loadout-wrapper"), minimalLoadout));
        }
        minimalLoadout.remove();
    }

    const shareOption = document.createElement("button");
    shareOption.type = "button";
    shareOption.classList.add("share-loadout-link");
    shareOption.textContent = "Copy Share Code";
    shareOption.onclick = async () => {
        const tableUnits = createLoadoutObject(minimalLoadout);
        encodeLink(tableUnits, await REQUEST_TYPES.GET_MULTIPLE_DATA(tableUnits.units, true)).then(link => {
            navigator.clipboard.writeText(link);
            REQUEST_TYPES.SEND_ALERT("Loadout data copied to clipboard!", false);
        });
    };

    rightOptionWrapper.append(deleteOption, shareOption);
    options?.appendChild(rightOptionWrapper);

    return minimalLoadout;
}

/**
 * Parses a loadout from a loadout container.
 * @param {HTMLDivElement} container A loadout container.
 * @returns {import("./data/loadout-data.js").LOADOUT} A loadout.
 */
function createLoadoutObject(container) {
    return {
        title: /** @type {HTMLInputElement} */ (container.querySelector(".loadout-name")).value.trim(),
        units: /** @type {HTMLDivElement[]} */ ([...container.querySelectorAll(".chip.set-unit")]).map(c => parseInt(c.dataset.id ?? "0")),
        forms: /** @type {HTMLDivElement[]} */ ([...container.querySelectorAll(".chip.set-unit")]).map(c => parseInt(c.dataset.form ?? "0")),
        baseLevels: [parseInt(/** @type {HTMLImageElement} */ (container.querySelector(".base-cannon")).dataset.type ?? "0"),
            parseInt(/** @type {HTMLImageElement} */ (container.querySelector(".base-style")).dataset.type ?? "0"),
            parseInt(/** @type {HTMLImageElement} */ (container.querySelector(".base-foundation")).dataset.type ?? "0")]
    };
}