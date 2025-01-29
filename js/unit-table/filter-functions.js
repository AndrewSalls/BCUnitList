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

export const isRedOrb = r => r.querySelectorAll(".orb-color[data-trait='Red']").length > 0;
export const isFloatingOrb = r => r.querySelectorAll(".orb-color[data-trait='Floating']").length > 0;
export const isBlackOrb = r => r.querySelectorAll(".orb-color[data-trait='Black']").length > 0;
export const isMetalOrb = r => r.querySelectorAll(".orb-color[data-trait='Metal']").length > 0;
export const isAngelOrb = r => r.querySelectorAll(".orb-color[data-trait='Angel']").length > 0;
export const isAlienOrb = r => r.querySelectorAll(".orb-color[data-trait='Alien']").length > 0;
export const isZombieOrb = r => r.querySelectorAll(".orb-color[data-trait='Zombie']").length > 0;
export const isRelicOrb = r => r.querySelectorAll(".orb-color[data-trait='Relic']").length > 0;
export const isAkuOrb = r => r.querySelectorAll(".orb-color[data-trait='Aku']").length > 0;

export const isAttackOrb = r => r.querySelectorAll(".orb-type[data-type='Attack']").length > 0;
export const isDefenseOrb = r => r.querySelectorAll(".orb-type[data-type='Defense']").length > 0;
export const isMassiveDamageOrb = r => r.querySelectorAll(".orb-type[data-type='Massive Damage']").length > 0;
export const isResistantOrb = r => r.querySelectorAll(".orb-type[data-type='Resistant']").length > 0;
export const isToughOrb = r => r.querySelectorAll(".orb-type[data-type='Tough']").length > 0;

export const isDRankOrb = r => r.querySelectorAll(".orb-rank[data-rank='D']").length > 0;
export const isCRankOrb = r => r.querySelectorAll(".orb-rank[data-rank='C']").length > 0;
export const isBRankOrb = r => r.querySelectorAll(".orb-rank[data-rank='B']").length > 0;
export const isARankOrb = r => r.querySelectorAll(".orb-rank[data-rank='A']").length > 0;
export const isSRankOrb = r => r.querySelectorAll(".orb-rank[data-rank='S']").length > 0;