//@ts-check
import { observeRowChange } from "../helper/link-row.js";
import * as filterFunctions from "./filter-functions.js";
import * as updateFunctions from "./update-functions.js";
import * as orbData from "../../assets/orb-map.js";
const ORB_DATA = orbData.default;

let topPos = 0;
/**
 * Iniitializes the table modal, which displays table options, filters, and sorts.
 */
export function initializeTableModal() {
    const tableModal = /** @type {HTMLDivElement} */ (document.querySelector("#table-option-modal"));
    tableModal.querySelector("#table-option-cancel")?.addEventListener("click", () => {
        targettedTable.dataset.options = [...tableModal.querySelectorAll("#table-filter-options button")].reduce((s, a) => s + (a.classList.contains("active") ? "1" : "0"), "");
        tableModal.classList.add("hidden");
        document.body.classList.remove("unscrollable");
        document.documentElement.scrollTop = topPos;
        document.body.style.top = '';
    });

    initializeUpdateOptions();
    initializeMiscFilters();
    initializeFormFilters();
    initializeLevelFilters();
    initializeTalentFilters();
    initializeOrbFilters();
}

const gearSVGString = 
`<svg version="1.1" viewBox="0 0 33.9 33.9" xmlns="http://www.w3.org/2000/svg">
	<path d="m21.3 0.0553-2.5 4.39a12.7 12.7 60 0 0-3.66-0.0126l-2.52-4.43-4.49 1.86 1.33 4.86a12.7 12.7 60 0 0-2.68 2.62l-4.9-1.34-1.86 4.48 4.36 2.47a12.7 12.7 60 0 0-0.03 3.89l-4.35 2.48 1.85 4.47 4.81-1.33a12.7 12.7 60 0 0 2.7 2.7l-1.32 4.79 4.48 1.85 2.46-4.31a12.7 12.7 60 0 0 3.8-5e-3l2.5 4.39 4.48-1.86-1.34-4.87a12.7 12.7 60 0 0 2.69-2.69l4.9 1.34 1.86-4.48-4.43-2.51a12.7 12.7 60 0 0-0.0076-3.76l4.36-2.48-1.85-4.47-4.85 1.34a12.7 12.7 60 0 0-2.65-2.64l1.34-4.86zm-1.36 9.4a8.09 8.11 60 0 1 0.0695 0.0287 8.09 8.11 60 0 1 4.37 10.6 8.09 8.11 60 0 1-10.6 4.39 8.09 8.11 60 0 1-4.37-10.6 8.09 8.11 60 0 1 10.5-4.42z"/>
</svg>`;
let targettedTable = null;
/**
 * Creates a button for opening a table modal targetting the provided table.
 * @param {HTMLDivElement} table An element containing the targetted table.
 */
export function attachTableOptionsAndFilters(table) {
    const wrapper = document.createElement("td");
    wrapper.classList.add("open-table-option-wrapper");

    const openOptionButton = document.createElement("button");
    openOptionButton.classList.add("open-table-option");
    openOptionButton.innerHTML = gearSVGString;

    const tableModal = /** @type {HTMLDivElement} */ (document.querySelector("#table-option-modal"));
    const filterOptions = /** @type {HTMLButtonElement[]} */ ([...tableModal.querySelectorAll("#table-filter-options button")]);
    table.dataset.options = "0".repeat(filterOptions.length); // prefill with zeros

    openOptionButton.onclick = () => {
        topPos = document.documentElement.scrollTop;
        document.body.classList.add("unscrollable");
        document.body.style.top = -1 * topPos + "px";
        tableModal.classList.remove("hidden");
        (/** @type {HTMLSpanElement} */ (document.querySelector("#table-option-label"))).textContent = table.querySelector(".searchable-table-title")?.textContent ?? "MISSING TABLE NAME";
        targettedTable = table;
        filterOptions.forEach((b, i) => b.classList.toggle("active", targettedTable.dataset.options[i] === "1"));
    };

    //@ts-ignore Can't be bothered to deal with type hint's terrible handling of querySelector
    table.querySelector("tbody")?.querySelectorAll("tr.unit-mod-row")?.forEach(r => observeRowChange(r, () => updateRowCallback(table, r, filterOptions)));

    wrapper.appendChild(openOptionButton);
    table.querySelector(".searchable-table-title")?.parentElement?.appendChild(wrapper);
}

/**
 * Gets the table targetted by the open table modal.
 * @returns {HTMLTableElement} The targetted table.
 */
export function getModalTarget() {
    return targettedTable;
}

/**
 * Updates the visibility of a row based on the filters active on the table.
 * @param {HTMLDivElement} table The element containing the targetted table.
 * @param {HTMLTableRowElement} row The row being updated.
 * @param {HTMLButtonElement[]} filterOptions A list of buttons registered with {@link registerFilter} to handle filtering rows.
 */
function updateRowCallback(table, row, filterOptions) {
    row.dataset.filteredCount = "0";

    for(let x = 0; x < filterOptions.length; x++) {
        if(table.dataset.options?.charAt(x) === "1") {
            filterOptions[x].dispatchEvent(new CustomEvent("filter-row", { detail: row }));
        }
    }

    if(row.dataset.filteredCount === "0") {
        row.classList.remove("filter-hidden");
    }
};

/**
 * Checks if the unit represented by a row is owned.
 * @param {HTMLTableRowElement} row The row to check.
 * @returns {boolean} Whether the unit in the row is owned.
 */
function checkRowIsOwned(row) {
    return (/** @type {HTMLInputElement} */ (row.querySelector(".max-level.level-select"))).value !== "0";
}

/**
 * Updates all table rows with the specified update function.
 * @param {(r: HTMLTableRowElement) => void} update The update function.
 * @param {boolean} checkForOwnership Whether only rows with units owned by the user (level >= 1) should be updated.
 * @param {boolean} checkForVisibility Whether only visible rows should be updated.
 */
function applyUpdate(update, checkForOwnership, checkForVisibility) {
    targettedTable.querySelectorAll("tbody tr").forEach((/** @type {HTMLTableRowElement} */ r) => {
        if((!checkForVisibility || r.checkVisibility()) && (!checkForOwnership || checkRowIsOwned(r))) {
            update(r);
            r.dispatchEvent(new CustomEvent("generic-update"));
        }
    });
}

/**
 * Applies a filter to every row in a table.
 * @param {(r: HTMLTableRowElement) => boolean} predicate The filter function.
 * @param {boolean} isUndoing Whether the filter is being applied or reverted.
 */
function applyFilter(predicate, isUndoing) {
    [...targettedTable.querySelectorAll("tbody tr")].filter(r => predicate(r)).forEach(r => updateRowFilter(r, isUndoing));
}

/**
 * Marks a row as having been filtered out or unfiltered out.
 * @param {HTMLTableRowElement} row The row being filtered/unfiltered.
 * @param {boolean} isUndoing Whether the row is being filtered or unfiltered.
 */
function updateRowFilter(row, isUndoing) {
    const target = /** @type {HTMLTableCellElement} */ (row.querySelector(".row-id"));

    row.dataset.filteredCount = `${Math.max(0, parseInt(row.dataset.filteredCount ?? "0") + (isUndoing ? -1 : 1))}`;
    if(row.dataset.filteredCount === "0") {
        row.classList.remove("filter-hidden");
        document.querySelectorAll(`#unit-search-suggestions div[data-target='${target.textContent}']`).forEach((/** @type {Element} */ o) => {
            o.classList.toggle("global-hidden", row.classList.contains("hidden"));
        });
    } else {
        row.classList.add("filter-hidden");
        document.querySelectorAll(`#unit-search-suggestions div[data-target='${target.textContent}']`).forEach((/** @type {Element} */ o) => {
            o.classList.add("global-hidden");
            o.classList.remove("suggestion-hovered");
        });
    }
}

/**
 * Register a filter button, implementing its click event and causing it to listen for unit updates to see if that unit's changes cause it to be filtered.
 * @param {HTMLButtonElement} button The button being registered.
 * @param {(r: HTMLTableRowElement) => boolean} callback The filter function associated with this button.
 */
function registerFilter(button, callback) {
    button.onclick = () => applyFilter(callback, !button.classList.toggle("active"));
    button.addEventListener("filter-row", (/** @type {Event} */ ev) => {
        const detail = /** @type {CustomEvent} */ (ev).detail;
        if(callback(detail)) {
            updateRowFilter(detail, false);
        }
    });
}

/**
 * Initializes buttons for updating or sorting all units in the table at once.
 */
function initializeUpdateOptions() {
    const optionWrapper = /** @type {!HTMLDivElement} */ (document.querySelector("#table-update-options"));
    
    const applyToOwnedOnly = /** @type {HTMLInputElement} */ (optionWrapper.querySelector("#update-owned-only"));
    const applyToVisibleOnly = /** @type {HTMLInputElement} */ (optionWrapper.querySelector("#update-visible-only"));
    const applyToAllButton = /** @type {HTMLInputElement} */ (optionWrapper.querySelector("#apply-to-all"));

    applyToAllButton.onclick = () => {
        const callbackClass = getActiveCallbacks();
        for(const key of Object.keys(callbackClass)) {
            if(key === "unhide") {
                applyUpdate(callbackClass[key], applyToOwnedOnly.checked, false);
            } else if(key === "own") {
                applyUpdate(callbackClass[key], false, applyToVisibleOnly.checked);
            } else {
                applyUpdate(callbackClass[key], applyToOwnedOnly.checked, applyToVisibleOnly.checked);
            }
        }
    };
}

/**
 * Gets a list of active callbacks.
 * @returns {object} An object containing all active callbacks.
 */
export function getActiveCallbacks() {
    const optionWrapper = /** @type {!HTMLDivElement} */ (document.querySelector("#table-update-options"));

    const hideButton = /** @type {HTMLButtonElement} */ (optionWrapper.querySelector("#hide-all"));
    const unhideButton = /** @type {HTMLButtonElement} */ (optionWrapper.querySelector("#unhide-all"));
    const resetButton = /** @type {HTMLButtonElement} */ (optionWrapper.querySelector("#reset-all"));
    const ownAllButton = /** @type {HTMLButtonElement} */ (optionWrapper.querySelector("#own-all"));
    const fullyEvolveButton = /** @type {HTMLButtonElement} */ (optionWrapper.querySelector("#fully-evolve-all"));
    const level30Button = /** @type {HTMLButtonElement} */ (optionWrapper.querySelector("#level-30-all"));
    const level50Button = /** @type {HTMLButtonElement} */ (optionWrapper.querySelector("#level-50-all"));
    const levelMaxButton = /** @type {HTMLButtonElement} */ (optionWrapper.querySelector("#level-plus-ultra"));
    const talentMaxButton = /** @type {HTMLButtonElement} */ (optionWrapper.querySelector("#level-talents"));
    const utTalentMaxButton = /** @type {HTMLButtonElement} */ (optionWrapper.querySelector("#level-ultra-talents"));

    const output = {};

    if(!hideButton.classList.contains("active")) { output.hide = updateFunctions.hideUnit }
    else if(!unhideButton.classList.contains("active")) { output.unhide = updateFunctions.unhideUnit } // Always want to target hidden units when unhiding
    else if(!resetButton.classList.contains("active")) { output.reset = updateFunctions.resetUnit }
    else {
        if(!ownAllButton.classList.contains("active")) { output.own = updateFunctions.ownUnit }
        if(!fullyEvolveButton.classList.contains("active")) { output.evolve = updateFunctions.evolveUnit }
        if(!level30Button.classList.contains("active")) { output.level30 = updateFunctions.level30Unit }
        if(!level50Button.classList.contains("active")) { output.level50 = updateFunctions.level50Unit }
        if(!levelMaxButton.classList.contains("active")) { output.levelMax = updateFunctions.levelMaxUnit }
        if(!talentMaxButton.classList.contains("active")) { output.talents = updateFunctions.talentMaxUnit }
        if(!utTalentMaxButton.classList.contains("active")) { output.ultraTalents = updateFunctions.utMaxUnit }
    }

    return output;
}

/**
 * Initializes buttons for filtering in the modal that do not fit into a common category.
 */
function initializeMiscFilters() {
    const filterWrapper = /** @type {!HTMLDivElement} */ (document.querySelector("#table-filter-options"));

    registerFilter(/** @type {HTMLButtonElement} */ (filterWrapper.querySelector("#fake-filter")), filterFunctions.isUnreleased);
    registerFilter(/** @type {HTMLButtonElement} */ (filterWrapper.querySelector("#collab-filter")), filterFunctions.isCollab);
    registerFilter(/** @type {HTMLButtonElement} */ (filterWrapper.querySelector("#version-filter")), filterFunctions.isInEN);
    registerFilter(/** @type {HTMLButtonElement} */ (filterWrapper.querySelector("#obtained-filter")), filterFunctions.isObtained);
    registerFilter(/** @type {HTMLButtonElement} */ (filterWrapper.querySelector("#unobtained-filter")), filterFunctions.isUnobtained);
    registerFilter(/** @type {HTMLButtonElement} */ (filterWrapper.querySelector("#favorite-filter")), filterFunctions.isNotFavorited);
}

/**
 * Initializes buttons for filtering in the modal relating to unit forms.
 */
function initializeFormFilters() {
    const filterWrapper = /** @type {!HTMLDivElement} */ (document.querySelector("#table-filter-options"));

    registerFilter(/** @type {HTMLButtonElement} */ (filterWrapper.querySelector("#normal-filter")), filterFunctions.isNormalForm);
    registerFilter(/** @type {HTMLButtonElement} */ (filterWrapper.querySelector("#evolved-filter")), filterFunctions.isEvolvedForm);
    registerFilter(/** @type {HTMLButtonElement} */ (filterWrapper.querySelector("#true-filter")), filterFunctions.isTrueForm);
    registerFilter(/** @type {HTMLButtonElement} */ (filterWrapper.querySelector("#ultra-filter")), filterFunctions.isUltraForm);
    registerFilter(/** @type {HTMLButtonElement} */ (filterWrapper.querySelector("#fully-evolved-filter")), filterFunctions.isFullyEvolved);
    registerFilter(/** @type {HTMLButtonElement} */ (filterWrapper.querySelector("#not-fully-evolved-filter")), (/** @type {HTMLTableRowElement} */ r) => !filterFunctions.isFullyEvolved(r));
}

/**
 * Initializes buttons for filtering in the modal relating to unit levels.
 */
function initializeLevelFilters() {
    const filterWrapper = /** @type {!HTMLDivElement} */ (document.querySelector("#table-filter-options"));

    registerFilter(/** @type {HTMLButtonElement} */ (filterWrapper.querySelector("#max-lvl-filter")), filterFunctions.isMaxLevel);
    registerFilter(/** @type {HTMLButtonElement} */ (filterWrapper.querySelector("#not-max-lvl-filter")), filterFunctions.isNotMaxLevel);
    registerFilter(/** @type {HTMLButtonElement} */ (filterWrapper.querySelector("#lvl-1-filter")), filterFunctions.isMaxLevel1);
    registerFilter(/** @type {HTMLButtonElement} */ (filterWrapper.querySelector("#max-plus-filter")), filterFunctions.isMaxPlusLevel);
    registerFilter(/** @type {HTMLButtonElement} */ (filterWrapper.querySelector("#not-max-plus-filter")), filterFunctions.isNotMaxPlusLevel);
    registerFilter(/** @type {HTMLButtonElement} */ (filterWrapper.querySelector("#plus-0-filter")), filterFunctions.isMaxPlusLevel0);
}

/**
 * Initializes buttons for filtering in the modal relating to talents.
 */
function initializeTalentFilters() {
    const filterWrapper = /** @type {!HTMLDivElement} */ (document.querySelector("#table-filter-options"));

    registerFilter(/** @type {HTMLButtonElement} */ (filterWrapper.querySelector("#max-talent-filter")), (/** @type {HTMLTableRowElement} */ r) => filterFunctions.isTalentsMax(r, true));
    registerFilter(/** @type {HTMLButtonElement} */ (filterWrapper.querySelector("#not-max-talent-filter")), (/** @type {HTMLTableRowElement} */ r) => filterFunctions.isTalentsMax(r, false));
    registerFilter(/** @type {HTMLButtonElement} */ (filterWrapper.querySelector("#max-ut-filter")), (/** @type {HTMLTableRowElement} */ r) => filterFunctions.isUltraTalentsMax(r, true));
    registerFilter(/** @type {HTMLButtonElement} */ (filterWrapper.querySelector("#not-max-ut-filter")), (/** @type {HTMLTableRowElement} */ r) => filterFunctions.isUltraTalentsMax(r, false));
    registerFilter(/** @type {HTMLButtonElement} */ (filterWrapper.querySelector("#has-talent-filter")), filterFunctions.isTalentable);
    registerFilter(/** @type {HTMLButtonElement} */ (filterWrapper.querySelector("#has-ut-filter")), filterFunctions.isUltraTalentable);
    registerFilter(/** @type {HTMLButtonElement} */ (filterWrapper.querySelector("#talentless-filter")), (/** @type {HTMLTableRowElement} */ r) => !filterFunctions.isTalentable(r));
    registerFilter(/** @type {HTMLButtonElement} */ (filterWrapper.querySelector("#utless-filter")), (/** @type {HTMLTableRowElement} */ r) => !filterFunctions.isUltraTalentable(r));
}

/**
 * Initializes all orb filter buttons.
 */
function initializeOrbFilters() {
    initializeOrbTraitFilters();
    initializeOrbTypeFilters();
    initializeOrbRankFilters();
}

/**
 * Initializes buttons in the modal for filtering by orb trait.
 */
function initializeOrbTraitFilters() {
    const filterWrapper = /** @type {!HTMLDivElement} */ (document.querySelector("#table-filter-options"));

    registerFilter(/** @type {HTMLButtonElement} */ (filterWrapper.querySelector("#trait-empty-filter")), filterFunctions.emptyOrbTrait);

    for(let x = 0; x < ORB_DATA.traits.length; x++) {
        registerFilter(/** @type {HTMLButtonElement} */ (filterWrapper.querySelector(`#trait-${x}-filter`)), (/** @type {HTMLTableRowElement} */ r) => filterFunctions.isOrbTrait(r, x));
    }

    registerFilter(/** @type {HTMLButtonElement} */ (filterWrapper.querySelector("#trait-ability-filter")), (/** @type {HTMLTableRowElement} */ r) => filterFunctions.isOrbTrait(r, 99));
}

/**
 * Initializes buttons in the modal for filtering by orb type.
 */
function initializeOrbTypeFilters() {
    const filterWrapper = /** @type {!HTMLDivElement} */ (document.querySelector("#table-filter-options"));

    // effect orb filters
    for(let x = 0; x < ORB_DATA.types.length; x++) {
        registerFilter(/** @type {HTMLButtonElement} */ (filterWrapper.querySelector(`#type-effect-${x}-filter`)), (/** @type {HTMLTableRowElement} */ r) => filterFunctions.isEffectOrbType(r, x));
    }

    for(let x = 0; x < ORB_DATA.abilities.length; x++) {
        registerFilter(/** @type {HTMLButtonElement} */ (filterWrapper.querySelector(`#type-ability-${x}-filter`)), (/** @type {HTMLTableRowElement} */ r) => filterFunctions.isAbilityOrbType(r, x));
    }
}

/**
 * Initializes buttons in the modal for filtering by orb rank.
 */
function initializeOrbRankFilters() {
    const filterWrapper = /** @type {!HTMLDivElement} */ (document.querySelector("#table-filter-options"));

    for(let x = 0; x < ORB_DATA.ranks.length; x++) {
        registerFilter(/** @type {HTMLButtonElement} */ (filterWrapper.querySelector(`#rank-${x}-filter`)), (/** @type {HTMLTableRowElement} */ r) => filterFunctions.isOrbRank(r, x));
    }
}
