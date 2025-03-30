import { observeRowChange } from "../helper/link-row.js";
import * as filterFunctions from "./filter-functions.js";

let topPos = 0;
export function initializeTableModal() {
    const tableModal = document.querySelector("#table-option-modal");
    tableModal.querySelector("#table-option-cancel").addEventListener("click", () => {
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
export function attachTableOptionsAndFilters(table) {
    const tableButtonDiv = document.createElement("div");
    tableButtonDiv.classList.add("h-align");

    const openOptionButton = document.createElement("button");
    openOptionButton.classList.add("open-table-option");
    openOptionButton.innerText = "Table Options";
    tableButtonDiv.appendChild(openOptionButton);

    const tableModal = document.querySelector("#table-option-modal");
    const filterOptions = [...tableModal.querySelectorAll("#table-filter-options button")];
    table.dataset.options = "0".repeat(filterOptions.length); // prefill with zeros

    openOptionButton.onclick = () => {
        topPos = document.documentElement.scrollTop;
        document.body.classList.add("unscrollable");
        document.body.style.top = -1 * topPos + "px";
        tableModal.classList.remove("hidden");
        document.querySelector("#table-option-label").textContent = openOptionButton.parentElement.previousElementSibling.textContent;
        targettedTable = table;
        filterOptions.forEach((b, i) => b.classList.toggle("active", targettedTable.dataset.options[i] === "1"));
    };

    table.querySelector("tbody").querySelectorAll("tr").forEach(r => observeRowChange(r, () => updateRowCallback(table, r, filterOptions)));
    table.parentNode.insertBefore(tableButtonDiv, table);
}

function updateRowCallback(table, row, filterOptions) {
    row.dataset.filteredCount = 0;

    for(let x = 0; x < filterOptions.length; x++) {
        if(table.dataset.options[x] === "1") {
            filterOptions[x].dispatchEvent(new CustomEvent("filter-row", { detail: row }));
        }
    }

    if(row.dataset.filteredCount === "0") {
        row.classList.remove("filter-hidden");
    }
};

function checkRowIsOwned(row) {
    return row.querySelector(".max-level.level-select").value !== "0";
}

function applyUpdate(update, checkForOwnership, checkForVisibility) {
    targettedTable.querySelectorAll("tbody tr").forEach(r => {
        if((!checkForVisibility || r.checkVisibility()) && (!checkForOwnership || checkRowIsOwned(r))) {
            update(r);
            r.dispatchEvent(new CustomEvent("generic-update"));
        }
    });
}

function applyFilter(predicate, isUndoing) {
    return [...targettedTable.querySelectorAll("tbody tr")].filter(r => predicate(r)).forEach(r => updateRowFilter(r, isUndoing));
}

function updateRowFilter(row, isUndoing) {
    const target = row.querySelector(".row-id");

    row.dataset.filteredCount = Math.max(0, parseInt(row.dataset.filteredCount ?? 0) + (isUndoing ? -1 : 1));
    if(row.dataset.filteredCount === "0") {
        row.classList.remove("filter-hidden");
        document.querySelectorAll(`#unit-search-suggestions option[data-target='${target.textContent}']`).forEach(o => o.disabled = row.classList.contains("hidden"));
    } else {
        row.classList.add("filter-hidden");
        document.querySelectorAll(`#unit-search-suggestions option[data-target='${target.textContent}']`).forEach(o => o.disabled = true);
    }
}

function registerFilter(button, callback) {
    button.onclick = () => applyFilter(callback, !button.classList.toggle("active"));
    button.addEventListener("filter-row", ev => callback(ev.detail) && updateRowFilter(ev.detail, false));
}

function initializeUpdateOptions() {
    const optionWrapper = document.querySelector("#table-update-options");
    
    const applyToOwnedOnly = optionWrapper.querySelector("#update-owned-only");
    const applyToVisibleOnly = optionWrapper.querySelector("#update-visible-only");
    const unhideButton = optionWrapper.querySelector("#unhide-all");
    const resetButton = optionWrapper.querySelector("#reset-all");
    const ownAllButton = optionWrapper.querySelector("#own-all");
    const fullyEvolveButton = optionWrapper.querySelector("#fully-evolve-all");
    const level30Button = optionWrapper.querySelector("#level-30-all");
    const level50Button = optionWrapper.querySelector("#level-50-all");
    const maxAllButton = optionWrapper.querySelector("#max-all");

    unhideButton.onclick = () => applyUpdate(r => {
        r.classList.remove("hidden");
        document.querySelectorAll(`#unit-search-suggestions option[data-target='${r.querySelector(".row-id").textContent}']`).forEach(o => o.disabled = r.classList.contains("filter-hidden"));
    }, applyToOwnedOnly.checked, applyToVisibleOnly.checked);
    resetButton.onclick = () => applyUpdate(r => r.querySelector(".reset-option").click(), applyToOwnedOnly.checked, applyToVisibleOnly.checked);
    ownAllButton.onclick = () => applyUpdate(r => {
        const levelSelector = r.querySelector(".max-level.level-select");
        levelSelector.value = Math.max(parseInt(levelSelector.value), 1);
    }, false, applyToVisibleOnly.checked);
    fullyEvolveButton.onclick = () => applyUpdate(r => {
        const icon = r.querySelector(".row-image");
        icon.dataset.form = parseInt(icon.dataset.max_form) - 1;
        icon.querySelector("img").click();
    }, applyToOwnedOnly.checked, applyToVisibleOnly.checked);
    level30Button.onclick = () => applyUpdate(r => {
        const levelSelector = r.querySelector(".max-level.level-select");
        levelSelector.value = Math.min(Math.max(parseInt(levelSelector.value), 30), parseInt(levelSelector.max));
    }, applyToOwnedOnly.checked, applyToVisibleOnly.checked);
    level50Button.onclick = () => applyUpdate(r => {
        const levelSelector = r.querySelector(".max-level.level-select");
        levelSelector.value = levelSelector.max;
    }, applyToOwnedOnly.checked, applyToVisibleOnly.checked);
    maxAllButton.onclick = () => applyUpdate(r => r.querySelector(".max-option").click(), applyToOwnedOnly.checked, applyToVisibleOnly.checked);
}

function initializeMiscFilters() {
    const filterWrapper = document.querySelector("#table-filter-options");

    registerFilter(filterWrapper.querySelector("#fake-filter"), filterFunctions.isUnreleased);
    registerFilter(filterWrapper.querySelector("#collab-filter"), filterFunctions.isCollab);
    registerFilter(filterWrapper.querySelector("#version-filter"), filterFunctions.isInEN);
    registerFilter(filterWrapper.querySelector("#unobtained-filter"), filterFunctions.isUnobtained);
    registerFilter(filterWrapper.querySelector("#favorite-filter"), filterFunctions.isNotFavorited);
}

function initializeFormFilters() {
    const filterWrapper = document.querySelector("#table-filter-options");

    registerFilter(filterWrapper.querySelector("#normal-filter"), filterFunctions.isNormalForm);
    registerFilter(filterWrapper.querySelector("#evolved-filter"), filterFunctions.isEvolvedForm);
    registerFilter(filterWrapper.querySelector("#true-filter"), filterFunctions.isTrueForm);
    registerFilter(filterWrapper.querySelector("#ultra-filter"), filterFunctions.isUltraForm);
    registerFilter(filterWrapper.querySelector("#fully-evolved-filter"), filterFunctions.isFullyEvolved);
    registerFilter(filterWrapper.querySelector("#not-fully-evolved-filter"), filterFunctions.isNotFullyEvolved);
}

function initializeLevelFilters() {
    const filterWrapper = document.querySelector("#table-filter-options");

    registerFilter(filterWrapper.querySelector("#max-lvl-filter"), filterFunctions.isMaxLevel);
    registerFilter(filterWrapper.querySelector("#not-max-lvl-filter"), filterFunctions.isNotMaxLevel);
    registerFilter(filterWrapper.querySelector("#lvl-1-filter"), filterFunctions.isMaxLevel1);
    registerFilter(filterWrapper.querySelector("#max-plus-filter"), filterFunctions.isMaxPlusLevel);
    registerFilter(filterWrapper.querySelector("#not-max-plus-filter"), filterFunctions.isNotMaxPlusLevel);
    registerFilter(filterWrapper.querySelector("#plus-0-filter"), filterFunctions.isMaxPlusLevel0);
}

function initializeTalentFilters() {
    const filterWrapper = document.querySelector("#table-filter-options");

    registerFilter(filterWrapper.querySelector("#max-talent-filter"), r => filterFunctions.isTalentsMax(r, true));
    registerFilter(filterWrapper.querySelector("#not-max-talent-filter"), r => filterFunctions.isTalentsMax(r, false));
    registerFilter(filterWrapper.querySelector("#max-ut-filter"), r => filterFunctions.isUltraTalentsMax(r, true));
    registerFilter(filterWrapper.querySelector("#not-max-ut-filter"), r => filterFunctions.isUltraTalentsMax(r, false));
    registerFilter(filterWrapper.querySelector("#has-talent-filter"), filterFunctions.isTalentable);
    registerFilter(filterWrapper.querySelector("#has-ut-filter"), filterFunctions.isUltraTalentable);
    registerFilter(filterWrapper.querySelector("#talentless-filter"), r => !filterFunctions.isTalentable(r));
    registerFilter(filterWrapper.querySelector("#utless-filter"), r => !filterFunctions.isUltraTalentable(r));
}

function initializeOrbFilters() {
    initializeOrbTraitFilters();
    initializeOrbTypeFilters();
    initializeOrbRankFilters();
}

function initializeOrbTraitFilters() {
    const filterWrapper = document.querySelector("#table-filter-options");

    registerFilter(filterWrapper.querySelector("#red-filter"), filterFunctions.isRedOrb);
    registerFilter(filterWrapper.querySelector("#floating-filter"), filterFunctions.isFloatingOrb);
    registerFilter(filterWrapper.querySelector("#black-filter"), filterFunctions.isBlackOrb);
    registerFilter(filterWrapper.querySelector("#metal-filter"), filterFunctions.isMetalOrb);
    registerFilter(filterWrapper.querySelector("#angel-filter"), filterFunctions.isAngelOrb);
    registerFilter(filterWrapper.querySelector("#alien-filter"), filterFunctions.isAlienOrb);
    registerFilter(filterWrapper.querySelector("#zombie-filter"), filterFunctions.isZombieOrb);
    registerFilter(filterWrapper.querySelector("#relic-filter"), filterFunctions.isRelicOrb);
    registerFilter(filterWrapper.querySelector("#aku-filter"), filterFunctions.isAkuOrb);
}

function initializeOrbTypeFilters() {
    const filterWrapper = document.querySelector("#table-filter-options");

    registerFilter(filterWrapper.querySelector("#attack-filter"), filterFunctions.isAttackOrb);
    registerFilter(filterWrapper.querySelector("#defense-filter"), filterFunctions.isDefenseOrb);
    registerFilter(filterWrapper.querySelector("#massive-filter"), filterFunctions.isMassiveDamageOrb);
    registerFilter(filterWrapper.querySelector("#resist-filter"), filterFunctions.isResistantOrb);
    registerFilter(filterWrapper.querySelector("#tough-filter"), filterFunctions.isToughOrb);
}

function initializeOrbRankFilters() {
    const filterWrapper = document.querySelector("#table-filter-options");

    registerFilter(filterWrapper.querySelector("#d-rank-filter"), filterFunctions.isDRankOrb);
    registerFilter(filterWrapper.querySelector("#c-rank-filter"), filterFunctions.isCRankOrb);
    registerFilter(filterWrapper.querySelector("#b-rank-filter"), filterFunctions.isBRankOrb);
    registerFilter(filterWrapper.querySelector("#a-rank-filter"), filterFunctions.isARankOrb);
    registerFilter(filterWrapper.querySelector("#s-rank-filter"), filterFunctions.isSRankOrb);
}