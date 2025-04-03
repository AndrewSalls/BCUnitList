/* -------------------------- Misc. Filter Functions -------------------------- */

export const isUnreleased = r => r.dataset.is_unobtainable === "Y";
export const isCollab = r => r.dataset.is_collab === "Y";
export const isInEN = r => r.dataset.in_en === "N";
export const isUnobtained = r => r.querySelector(".max-level.level-select").value === "0";
export const isNotFavorited = r => r.querySelector(".fav-wrapper").dataset.favorited === "0";

/* -------------------------- Form Filter Functions -------------------------- */
export const isNormalForm = r => r.querySelector(".row-image").dataset.form === "0";
export const isEvolvedForm = r => r.querySelector(".row-image").dataset.form === "1";
export const isTrueForm = r => r.querySelector(".row-image").dataset.form === "2";
export const isUltraForm = r => r.querySelector(".row-image").dataset.form === "3";

export const isFullyEvolved = r => {
    const formIcon = r.querySelector(".row-image");
    return formIcon.dataset.form === formIcon.dataset.max_form;
};

/* -------------------------- Level Filter Functions -------------------------- */
export const isMaxLevel = r => {
    const levelBox = r.querySelector(".max-level.level-select");
    return levelBox.value === levelBox.max;
};
export const isNotMaxLevel = r => {
    const levelBox = r.querySelector(".max-level.level-select");
    return parseInt(levelBox.value) < parseInt(levelBox.max);
}
export const isMaxLevel1 = r => r.querySelector(".max-level.level-select").max === "1";
export const isMaxPlusLevel = r => {
    const levelBox = r.querySelector(".max-plus-level.level-select");
    return !levelBox || levelBox.value === levelBox.max;
};
export const isNotMaxPlusLevel = r => {
    const levelBox = r.querySelector(".max-plus-level.level-select");
    return !!levelBox && parseInt(levelBox.value) < parseInt(levelBox.max);
};
export const isMaxPlusLevel0 = r => !r.querySelector(".max-plus-level.level-select");

/* -------------------------- Talent Filter Functions -------------------------- */

export const isTalentsMax = (r, isMax) => {
    const talentList = [...r.querySelectorAll(".regular-talent")];
    return talentList.length > 0 && (talentList.every(t => t.querySelector("p").textContent === t.dataset.max) === isMax);
};
export const isUltraTalentsMax = (r, isMax) => {
    const talentList = [...r.querySelectorAll(".ultra-talent")];
    return talentList.length > 0 && (talentList.every(t => t.querySelector("p").textContent === t.dataset.max) === isMax);
};
export const isTalentable = r => r.querySelectorAll(".regular-talent").length > 0;
export const isUltraTalentable = r => r.querySelectorAll(".ultra-talent").length > 0;
/* -------------------------- Orb Filter Functions -------------------------- */

export const isOrbTrait = (r, x) => r.querySelectorAll(`.orb-color[data-trait='${x}']`).length > 0;
export const isOrbType = (r, x) => r.querySelectorAll(`.orb-type[data-type='${x}']`).length > 0;
export const isOrbRank = (r, x) => r.querySelectorAll(`.orb-rank[data-rank='${x}']`).length > 0;