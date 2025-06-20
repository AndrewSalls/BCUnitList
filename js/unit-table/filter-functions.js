//@ts-check
/* -------------------------- Misc. Filter Functions -------------------------- */

export const isUnreleased = (/** @type {HTMLTableRowElement} */ r) => r.dataset.is_unobtainable === "Y";
export const isCollab = (/** @type {HTMLTableRowElement} */ r) => r.dataset.is_collab === "Y";
export const isInEN = (/** @type {HTMLTableRowElement} */ r) => r.dataset.in_en === "N";
export const isUnobtained = (/** @type {HTMLTableRowElement} */ r) => (/** @type {!HTMLInputElement} */ (r.querySelector(".max-level.level-select"))).value === "0";
export const isObtained = (/** @type {HTMLTableRowElement} */ r) => (/** @type {!HTMLInputElement} */ (r.querySelector(".max-level.level-select"))).value !== "0";
export const isNotFavorited = (/** @type {HTMLTableRowElement} */ r) => (/** @type {!HTMLDivElement} */ (r.querySelector(".fav-wrapper"))).dataset.favorited === "0";

/* -------------------------- Form Filter Functions -------------------------- */
export const isNormalForm = (/** @type {HTMLTableRowElement} */ r) => (/** @type {!HTMLTableCellElement} */ (r.querySelector(".row-image"))).dataset.form === "0";
export const isEvolvedForm = (/** @type {HTMLTableRowElement} */ r) => (/** @type {!HTMLTableCellElement} */ (r.querySelector(".row-image"))).dataset.form === "1";
export const isTrueForm = (/** @type {HTMLTableRowElement} */ r) => (/** @type {!HTMLTableCellElement} */ (r.querySelector(".row-image"))).dataset.form === "2";
export const isUltraForm = (/** @type {HTMLTableRowElement} */ r) => (/** @type {!HTMLTableCellElement} */ (r.querySelector(".row-image"))).dataset.form === "3";

export const isFullyEvolved = (/** @type {HTMLTableRowElement} */ r) => {
    const formIcon = (/** @type {!HTMLTableRowElement} */ (r.querySelector(".row-image")));
    return formIcon.dataset.form === formIcon.dataset.max_form;
};

/* -------------------------- Level Filter Functions -------------------------- */
export const isMaxLevel = (/** @type {HTMLTableRowElement} */ r) => {
    const levelBox = /** @type {!HTMLInputElement} */ (r.querySelector(".max-level.level-select"));
    return levelBox.value === levelBox.max;
};
export const isNotMaxLevel = (/** @type {HTMLTableRowElement} */ r) => {
    const levelBox = /** @type {!HTMLInputElement} */ (r.querySelector(".max-level.level-select"));
    return parseInt(levelBox.value) < parseInt(levelBox.max);
}
export const isMaxLevel1 = (/** @type {HTMLTableRowElement} */ r) => (/** @type {!HTMLInputElement} */ (r.querySelector(".max-level.level-select"))).max === "1";
export const isMaxPlusLevel = (/** @type {HTMLTableRowElement} */ r) => {
    const levelBox = /** @type {!HTMLInputElement} */ (r.querySelector(".max-plus-level.level-select"));
    return !levelBox || levelBox.value === levelBox.max;
};
export const isNotMaxPlusLevel = (/** @type {HTMLTableRowElement} */ r) => {
    const levelBox = /** @type {!HTMLInputElement} */ (r.querySelector(".max-plus-level.level-select"));
    return !!levelBox && parseInt(levelBox.value) < parseInt(levelBox.max);
};
export const isMaxPlusLevel0 = (/** @type {HTMLTableRowElement} */ r) => !r.querySelector(".max-plus-level.level-select");

/* -------------------------- Talent Filter Functions -------------------------- */

export const isTalentsMax = (/** @type {HTMLTableRowElement} */ r, /** @type {boolean} */ isMax) => {
    const talentList = /** @type {HTMLTableRowElement[]} */ ([...r.querySelectorAll(".regular-talent")]);
    return talentList.length > 0 && (talentList.every(t => t.querySelector("p")?.textContent === t.dataset.max) === isMax);
};
export const isUltraTalentsMax = (/** @type {HTMLTableRowElement} */ r, /** @type {boolean} */ isMax) => {
    const talentList = /** @type {HTMLTableRowElement[]} */ ([...r.querySelectorAll(".ultra-talent")]);
    return talentList.length > 0 && (talentList.every(t => t.querySelector("p")?.textContent === t.dataset.max) === isMax);
};
export const isTalentable = (/** @type {HTMLTableRowElement} */ r) => r.querySelectorAll(".regular-talent").length > 0;
export const isUltraTalentable = (/** @type {HTMLTableRowElement} */ r) => r.querySelectorAll(".ultra-talent").length > 0;
/* -------------------------- Orb Filter Functions -------------------------- */

export const emptyOrbTrait = (/** @type {HTMLTableRowElement} */ r) => r.querySelectorAll(`.orb-color[data-trait='']`).length > 0;

export const isOrbTrait = (/** @type {HTMLTableRowElement} */ r, /** @type {number} */ x) => r.querySelectorAll(`.orb-color[data-trait='${x}']`).length > 0;
export const isEffectOrbType = (/** @type {HTMLTableRowElement} */ r, /** @type {number} */ x) => !isOrbTrait(r, 99) && r.querySelectorAll(`.orb-type[data-type='${x}']`).length > 0;
export const isAbilityOrbType = (/** @type {HTMLTableRowElement} */ r, /** @type {number} */ x) => isOrbTrait(r, 99) && r.querySelectorAll(`.orb-type[data-type='${x}']`).length > 0;
export const isOrbRank = (/** @type {HTMLTableRowElement} */ r, /** @type {number} */ x) => r.querySelectorAll(`.orb-rank[data-rank='${x}']`).length > 0;

/* -------------------------- Global Filter Checking Function -------------------------- */
/**
 * Checks if a unit should be visible based on global filters.
 * @param {import("../data/unit-data").UNIT_DATA} unit The unit to check.
 * @returns {boolean} Whether the unit should be hidden.
 */
export function isGloballyFiltered(unit) {
    let shouldBeHidden = (window.localStorage.getItem("f1") === "0") && unit.unobtainable;
    shouldBeHidden ||= (window.localStorage.getItem("f2") === "0") && unit.collab;
    shouldBeHidden ||= (window.localStorage.getItem("f3") === "0") && !unit.in_EN;
    shouldBeHidden ||= (window.localStorage.getItem("f4") === "0") && unit.level === 0;
    shouldBeHidden ||= (window.localStorage.getItem("f5") === "0") && !unit.favorited;
    shouldBeHidden ||= (window.localStorage.getItem("f6") === "0") && unit.level !== 0;

    return shouldBeHidden;
}