//@ts-check
import { observeRowChange } from "../helper/link-row.js";
import * as filterFunctions from "./filter-functions.js";
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
    });

    initializeUpdateOptions();
    initializeMiscFilters();
    initializeFormFilters();
    initializeLevelFilters();
    initializeTalentFilters();
    initializeOrbFilters();
}

let targettedTable = null;
/**
 * Creates a button for opening a table modal targetting the provided table.
 * @param {HTMLDivElement} table An element containing the targetted table.
 */
export function attachTableOptionsAndFilters(table) {
    const tableButtonDiv = document.createElement("div");
    tableButtonDiv.classList.add("h-align");

    const openOptionButton = document.createElement("button");
    openOptionButton.classList.add("open-table-option");
    openOptionButton.innerText = "Table Options";
    tableButtonDiv.appendChild(openOptionButton);

    const tableModal = /** @type {HTMLDivElement} */ (document.querySelector("#table-option-modal"));
    const filterOptions = /** @type {HTMLButtonElement[]} */ ([...tableModal.querySelectorAll("#table-filter-options button")]);
    table.dataset.options = "0".repeat(filterOptions.length); // prefill with zeros

    openOptionButton.onclick = () => {
        topPos = document.documentElement.scrollTop;
        document.body.classList.add("unscrollable");
        document.body.style.top = -1 * topPos + "px";
        tableModal.classList.remove("hidden");
        (/** @type {HTMLSpanElement} */ (document.querySelector("#table-option-label"))).textContent = openOptionButton.parentElement?.previousElementSibling?.textContent ?? "MISSING TABLE NAME";
        targettedTable = table;
        filterOptions.forEach((b, i) => b.classList.toggle("active", targettedTable.dataset.options[i] === "1"));
    };

    table.querySelector("tbody")?.querySelectorAll("tr")?.forEach((/** @type {HTMLTableRowElement} */ r) => observeRowChange(r, () => updateRowCallback(table, r, filterOptions)));
    table.parentNode?.insertBefore(tableButtonDiv, table);
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
        document.querySelectorAll(`#unit-search-suggestions div[data-target='${target.textContent}']`).forEach((/** @type {Element} */ o) => o.classList.toggle("global-hidden", row.classList.contains("hidden")));
    } else {
        row.classList.add("filter-hidden");
        document.querySelectorAll(`#unit-search-suggestions div[data-target='${target.textContent}']`).forEach((/** @type {Element} */ o) => o.classList.add("global-hidden"));
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
    const unhideButton = /** @type {HTMLButtonElement} */ (optionWrapper.querySelector("#unhide-all"));
    const resetButton = /** @type {HTMLButtonElement} */ (optionWrapper.querySelector("#reset-all"));
    const ownAllButton = /** @type {HTMLButtonElement} */ (optionWrapper.querySelector("#own-all"));
    const fullyEvolveButton = /** @type {HTMLButtonElement} */ (optionWrapper.querySelector("#fully-evolve-all"));
    const level30Button = /** @type {HTMLButtonElement} */ (optionWrapper.querySelector("#level-30-all"));
    const level50Button = /** @type {HTMLButtonElement} */ (optionWrapper.querySelector("#level-50-all"));
    const maxAllButton = /** @type {HTMLButtonElement} */ (optionWrapper.querySelector("#max-all"));

    unhideButton.onclick = () => applyUpdate((/** @type {{ classList: { remove: (arg0: string) => void; contains: (arg0: string) => any; }; querySelector: (arg0: string) => { (): any; new (): any; textContent: any; }; }} */ r) => {
        r.classList.remove("hidden");
        document.querySelectorAll(`#unit-search-suggestions div[data-target='${r.querySelector(".row-id").textContent}']`).forEach(o => o.classList.toggle("global-hidden", r.classList.contains("filter-hidden")));
    }, applyToOwnedOnly.checked, applyToVisibleOnly.checked);
    resetButton.onclick = () => applyUpdate((/** @type {{ querySelector: (arg0: string) => { (): any; new (): any; click: { (): any; new (): any; }; }; }} */ r) => r.querySelector(".reset-option").click(), applyToOwnedOnly.checked, applyToVisibleOnly.checked);
    ownAllButton.onclick = () => applyUpdate((/** @type {{ querySelector: (arg0: string) => any; }} */ r) => {
        const levelSelector = r.querySelector(".max-level.level-select");
        levelSelector.value = Math.max(parseInt(levelSelector.value), 1);
    }, false, applyToVisibleOnly.checked);
    fullyEvolveButton.onclick = () => applyUpdate((/** @type {{ querySelector: (arg0: string) => any; }} */ r) => {
        const icon = r.querySelector(".row-image");
        icon.dataset.form = parseInt(icon.dataset.max_form) - 1;
        icon.querySelector("img").click();
    }, applyToOwnedOnly.checked, applyToVisibleOnly.checked);
    level30Button.onclick = () => applyUpdate((/** @type {{ querySelector: (arg0: string) => any; }} */ r) => {
        const levelSelector = r.querySelector(".max-level.level-select");
        levelSelector.value = Math.min(Math.max(parseInt(levelSelector.value), 30), parseInt(levelSelector.max));
    }, applyToOwnedOnly.checked, applyToVisibleOnly.checked);
    level50Button.onclick = () => applyUpdate((/** @type {{ querySelector: (arg0: string) => any; }} */ r) => {
        const levelSelector = r.querySelector(".max-level.level-select");
        levelSelector.value = levelSelector.max;
    }, applyToOwnedOnly.checked, applyToVisibleOnly.checked);
    maxAllButton.onclick = () => applyUpdate((/** @type {{ querySelector: (arg0: string) => { (): any; new (): any; click: { (): any; new (): any; }; }; }} */ r) => r.querySelector(".max-option").click(), applyToOwnedOnly.checked, applyToVisibleOnly.checked);
}

/**
 * Initializes buttons for filtering in the modal that do not fit into a common category.
 */
function initializeMiscFilters() {
    const filterWrapper = /** @type {!HTMLDivElement} */ (document.querySelector("#table-filter-options"));

    registerFilter(/** @type {HTMLButtonElement} */ (filterWrapper.querySelector("#fake-filter")), filterFunctions.isUnreleased);
    registerFilter(/** @type {HTMLButtonElement} */ (filterWrapper.querySelector("#collab-filter")), filterFunctions.isCollab);
    registerFilter(/** @type {HTMLButtonElement} */ (filterWrapper.querySelector("#version-filter")), filterFunctions.isInEN);
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

    for(let x = 0; x < ORB_DATA.traits.length; x++) {
        registerFilter(/** @type {HTMLButtonElement} */ (filterWrapper.querySelector(`#trait-${x}-filter`)), (/** @type {HTMLTableRowElement} */ r) => filterFunctions.isOrbTrait(r, x));
    }
}

/**
 * Initializes buttons in the modal for filtering by orb type.
 */
function initializeOrbTypeFilters() {
    const filterWrapper = /** @type {!HTMLDivElement} */ (document.querySelector("#table-filter-options"));

    for(let x = 0; x < ORB_DATA.types.length; x++) {
        registerFilter(/** @type {HTMLButtonElement} */ (filterWrapper.querySelector(`#type-${x}-filter`)), (/** @type {HTMLTableRowElement} */ r) => filterFunctions.isOrbType(r, x));
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