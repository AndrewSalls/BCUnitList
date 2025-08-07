//@ts-check
import makeSearchable from "../../helper/make-searchable.js";
import makeDraggable, { sortIcons } from "../../helper/make-draggable.js";
import { FORM } from "../../data/unit-data.js";
import SETTINGS from "../../../assets/settings.js";
import { openSearchModal } from "./create-search-modal.js";

/**
 * Creates an element used to create a loadout.
 * @param {import("../../data/loadout-data.js").LOADOUT|null} loadoutData Loadout data to initialize the loadout to, or null if the loadout should start blank.
 * @param {{ cannon: boolean, style: boolean, foundation: boolean }[]} unlockedCannons Whether each cannon part for each cannon type has been unlocked.
 * @param {(() => void)|null} saveCallback A function used to tell the page to save the updated loadout, or null if the loadout should not be saved.
 * @param {boolean|null} ownedOnly Whether searching for units via the chip should only allow owned units to appear.
 * @returns {HTMLDivElement} The created element.
 */
export function createMinimalLoadout(loadoutData, unlockedCannons, saveCallback, ownedOnly) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("loadout-wrapper");
    wrapper.classList.add("v-align");
    if(loadoutData) {
        wrapper.classList.add("save");
    }

    const options = document.createElement("div");
    options.classList.add("loadout-options");

    const nameOption = document.createElement("input");
    nameOption.classList.add("loadout-name");
    nameOption.type = "text";
    nameOption.placeholder = "Enter loadout name...";
    nameOption.value = loadoutData?.title ?? "";
    nameOption.maxLength = SETTINGS.maxLoadoutNameLength;

    options.appendChild(nameOption);

    const contentWrapper = document.createElement("div");
    contentWrapper.classList.add("loadout-contents");
    contentWrapper.classList.add("h-align");

    contentWrapper.append(
        createUnitInput(loadoutData && loadoutData.units, loadoutData && loadoutData.forms, saveCallback, ownedOnly),
        createCannonInput(loadoutData && loadoutData.baseLevels, unlockedCannons, saveCallback)
    );
    wrapper.append(options, contentWrapper);

    return wrapper;
}

/**
 * Creates a set of 10 slots to select units in a loadout.
 * @param {number[]|null} units A list of up to 10 unique unit IDs, or null if all slots are empty.
 * @param {FORM[]|null} forms A list of up to 10 unit forms, the same length as {@link units}, or null if all slots are empty.
 * @param {(() => void)|null} saveCallback A function used to tell the page to save the updated loadout, or null if the loadout should not be saved.
 * @returns {HTMLDivElement} The created loadout unit selector.
 * @param {boolean|null} ownedOnly Whether searching for units via the chip should only allow owned units to appear.
 */
export function createUnitInput(units, forms, saveCallback, ownedOnly) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("loadout-unit-wrapper");

    let x = 0;
    if(units && forms) {
        for(x = 0; x < 10 && x < units.length; x++) {
            appendChip(units[x], forms[x], wrapper, saveCallback, ownedOnly);
        }
    }
    while(x < 10) {
        appendChip(null, null, wrapper, saveCallback, ownedOnly);
        x++
    }

    makeDraggable(wrapper, saveCallback);

    return wrapper;
}

/**
 * Appends a unit chip to the provided parent loadout element.
 * @param {number|null} id The ID of the unit to append, or null if the slot is empty.
 * @param {FORM|null} form The form of the unit to append to be used, or null if the slot is empty.
 * @param {HTMLDivElement} parent The parent element to append the chip to.
 * @param {(() => void)|null} saveCallback A function used to tell the page to save the updated loadout, or null if the loadout should not be saved.
 * @param {boolean|null} ownedOnly Whether searching for units via the chip should only allow owned units to appear.
 */
export function appendChip(id, form, parent, saveCallback, ownedOnly) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("chip");

    const img = document.createElement("img");
    img.classList.add("unit-icon");
    img.src = "./assets/img/unit_icon/unknown.png";
    img.onclick = () => {
        if(window.document.body.classList.contains("disabled-editing-mode")) {
            return;
        }
        if(wrapper.classList.contains("set-unit")) {
            let form = parseInt(wrapper.dataset.form ?? "0") + 1;
            if(form > parseInt(wrapper.dataset.maxForm ?? "0")) {
                form = 0;
            }

            wrapper.dataset.form = `${form}`;
            img.src = `./assets/img/unit_icon/${wrapper.dataset.id}_${form}.png`;
            saveCallback && saveCallback();
        }
    };

    const removeButton = document.createElement("div");
    removeButton.classList.add("remove-unit");
    removeButton.textContent = "X";
    removeButton.classList.add("hidden");

    removeButton.onclick = () => {
        const formNameOptions = document.querySelectorAll(`#search-suggestion-dropdown div[data-target="${wrapper.dataset.id}"]`);
        formNameOptions.forEach(o => o.classList.remove("global-hidden"));

        wrapper.classList.remove("set-unit");
        delete wrapper.dataset.id;
        delete wrapper.dataset.maxForm;

        img.src = "./assets/img/unit_icon/unknown.png";
        removeButton.classList.add("hidden");
        searchWrapper.classList.remove("hidden");
        sortIcons(parent);
        saveCallback && saveCallback();
    }

    const searchWrapper = document.createElement("div");
    searchWrapper.classList.add("unset-search-wrapper");

    const unitSearchInput = document.createElement("input");
    unitSearchInput.classList.add("unset-search");
    unitSearchInput.type = "text";
    unitSearchInput.placeholder = "Search...";

    unitSearchInput.addEventListener("focus", () => {
        for(const chipID of parent.querySelectorAll(".chip.set-unit")) {
            //@ts-ignore VSCode fix your type hints
            const formNameOptions = document.querySelectorAll(`#search-suggestion-dropdown div[data-target="${chipID.dataset.id ?? "0"}"]`);
            formNameOptions.forEach(o => {
                o.classList.add("global-hidden");
                o.classList.remove("suggestion-hovered");
            });
        }
    });
    unitSearchInput.addEventListener("blur", () => {
        document.querySelectorAll(`#search-suggestion-dropdown div.global-hidden`).forEach(d => d.classList.remove("global-hidden"));
    });

    const advancedSearchBtn = document.createElement("button");
    advancedSearchBtn.classList.add("advanced-search-open");
    advancedSearchBtn.innerHTML = `
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <rect x="10.5" y="0" width="3" height="24" />
            <rect x="0" y="10.5" width="24" height="3" />
        </svg>`;

    const resolveSearch = (searchID, searchForm) => {
        const formNameOptions = document.querySelectorAll(`#search-suggestion-dropdown div[data-target="${searchID}"]`);
        formNameOptions.forEach(o => {
            o.classList.add("global-hidden");
            o.classList.remove("suggestion-hovered");
        });

        wrapper.classList.add("set-unit");
        wrapper.dataset.form = `${searchForm}`;
        wrapper.dataset.id = `${searchID}`;
        wrapper.dataset.maxForm = `${formNameOptions.length - 1}`;
        if(!SETTINGS.skipImages.includes(searchID)) {
            img.src = `./assets/img/unit_icon/${searchID}_${searchForm}.png`;
        }
        removeButton.classList.remove("hidden");
        searchWrapper.classList.add("hidden");
        sortIcons(parent);
        saveCallback && saveCallback();
    }

    makeSearchable(unitSearchInput, resolveSearch);
    advancedSearchBtn.onclick = () => openSearchModal((u, f) => resolveSearch(u.id, f), ownedOnly);
    searchWrapper.append(unitSearchInput, advancedSearchBtn);

    if(id !== null && form !== null) {
        wrapper.classList.add("set-unit");
        wrapper.dataset.form = `${form}`;
        wrapper.dataset.id = `${id}`;
        wrapper.dataset.maxForm = `${document.querySelectorAll(`#search-suggestion-dropdown div[data-target="${id}"]`).length - 1}`;
        img.src = `./assets/img/unit_icon/${id}_${form}.png`;
        removeButton.classList.remove("hidden");
        searchWrapper.classList.add("hidden");
    }

    wrapper.append(img, removeButton, searchWrapper);
    parent.appendChild(wrapper);
}

/**
 * Creates a base part input.
 * @param {[number, number, number]|null} cannonData The IDs for each part to initialize with, or null if there is no pre-existing cannon data.
 * @param {{ cannon: boolean, style: boolean, foundation: boolean }[]} unlockedCannons Whether each cannon part for each cannon type has been unlocked.
 * @param {(() => void)|null} [saveCallback = null] A function used to tell the page to save the updated loadout, or null if the loadout should not be saved.
 * @returns {HTMLDivElement} An element containing the inputs for all parts of a cat base.
 */
export function createCannonInput(cannonData, unlockedCannons, saveCallback = null) {
    cannonData = cannonData ?? [1, 1, 1];
    const wrapper = document.createElement("div");
    wrapper.classList.add("loadout-base-wrapper");
    wrapper.classList.add("h-align");

    const baseImage = document.createElement("div");
    baseImage.classList.add("loadout-base-image");

    const cannonImage = document.createElement("img");
    cannonImage.classList.add("base-cannon");
    cannonImage.dataset.type = `${cannonData[0]}`;
    cannonImage.src = `./assets/img/foundation/base_${cannonData[0] ?? 1}.png`;

    const styleImage = document.createElement("img");
    styleImage.classList.add("base-style");
    styleImage.dataset.type = `${cannonData[1]}`;
    styleImage.src = `./assets/img/foundation/base_${cannonData[1] ?? 1}_style.png`;

    const foundationImage = document.createElement("img");
    foundationImage.classList.add("base-foundation");
    foundationImage.dataset.type = `${cannonData[2]}`;
    foundationImage.src = `./assets/img/foundation/base_${cannonData[2] ?? 1}_foundation.png`;

    const leftArrowWrapper = document.createElement("div");
    leftArrowWrapper.classList.add("left-base-arrows");

    baseImage.append(cannonImage, styleImage, foundationImage);

    leftArrowWrapper.append(
        createBaseArrow(true, "cannon", cannonImage, unlockedCannons, saveCallback),
        createBaseArrow(true, "style", styleImage, unlockedCannons, saveCallback),
        createBaseArrow(true, "foundation", foundationImage, unlockedCannons, saveCallback)
    );

    const rightArrowWrapper = document.createElement("div");
    rightArrowWrapper.classList.add("right-base-arrows");

    rightArrowWrapper.append(
        createBaseArrow(false, "cannon", cannonImage, unlockedCannons, saveCallback),
        createBaseArrow(false, "style", styleImage, unlockedCannons, saveCallback),
        createBaseArrow(false, "foundation", foundationImage, unlockedCannons, saveCallback)
    );

    wrapper.append(leftArrowWrapper, baseImage, rightArrowWrapper);
    return wrapper;
}

/**
 * Creates an arrow control for part of a base.
 * @param {boolean} isLeft Whether the arrow points left or right.
 * @param {string} arrowFor Which part type the control is for, also doubling as the file name extension to distinguish the part from other parts of the same base type.
 * @param {HTMLImageElement} target The element controlling and displaying what base type is active for this part type.
 * @param {{ cannon: boolean, style: boolean, foundation: boolean }[]} unlockedCannons Whether each cannon part for each cannon type has been unlocked.
 * @param {(() => void)|null} [saveCallback = null] A function used to tell the page to save the updated loadout, or null if the loadout should not be saved.
 * @returns {HTMLDivElement} An arrow control.
 */
export function createBaseArrow(isLeft, arrowFor, target, unlockedCannons, saveCallback = null) {
    const wrapper = document.createElement("div");
    wrapper.classList.add(`${arrowFor}-arrow`)
    wrapper.classList.add(isLeft ? "left-arrow" : "right-arrow");

    if(isLeft) {
        wrapper.innerHTML = "<svg viewBox='0 0 16 32'><path d='M0 16 L16 0 L16 32'></path></svg>";
    } else {
        wrapper.innerHTML = "<svg viewBox='0 0 16 32'><path d='M16 16 L0 0 L0 32'></path></svg>";
    }

    const changeAmt = isLeft ? -1 : 1;
    /** @type {SVGElement} */ (wrapper.querySelector("svg")).onclick = () => {
        const currIndex = parseInt(target.dataset.type ?? "1") - 1;
        
        let inc = currIndex;
        do {
            inc = (inc + changeAmt + unlockedCannons.length) % unlockedCannons.length;
        } while(!unlockedCannons[inc][arrowFor] && inc !== currIndex);

        inc = inc + 1;
        target.dataset.type = `${inc}`;

        let extra = "";
        if(arrowFor === "style" || arrowFor === "foundation"){
            extra = `_${arrowFor}`;
        }
        target.src = `./assets/img/foundation/base_${inc}${extra}.png`;
        saveCallback && saveCallback();
    };

    return wrapper;
}