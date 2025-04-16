export const isUnreleased=r=>"Y"===r.dataset.is_unobtainable;export const isCollab=r=>"Y"===r.dataset.is_collab;export const isInEN=r=>"N"===r.dataset.in_en;export const isUnobtained=r=>"0"===r.querySelector(".max-level.level-select").value;export const isNotFavorited=r=>"0"===r.querySelector(".fav-wrapper").dataset.favorited;export const isNormalForm=r=>"0"===r.querySelector(".row-image").dataset.form;export const isEvolvedForm=r=>"1"===r.querySelector(".row-image").dataset.form;export const isTrueForm=r=>"2"===r.querySelector(".row-image").dataset.form;export const isUltraForm=r=>"3"===r.querySelector(".row-image").dataset.form;export const isFullyEvolved=r=>{const formIcon=r.querySelector(".row-image");return formIcon.dataset.form===formIcon.dataset.max_form};export const isMaxLevel=r=>{const levelBox=r.querySelector(".max-level.level-select");return levelBox.value===levelBox.max};export const isNotMaxLevel=r=>{const levelBox=r.querySelector(".max-level.level-select");return parseInt(levelBox.value)<parseInt(levelBox.max)};export const isMaxLevel1=r=>"1"===r.querySelector(".max-level.level-select").max;export const isMaxPlusLevel=r=>{const levelBox=r.querySelector(".max-plus-level.level-select");return!levelBox||levelBox.value===levelBox.max};export const isNotMaxPlusLevel=r=>{const levelBox=r.querySelector(".max-plus-level.level-select");return!!levelBox&&parseInt(levelBox.value)<parseInt(levelBox.max)};export const isMaxPlusLevel0=r=>!r.querySelector(".max-plus-level.level-select");export const isTalentsMax=(r,isMax)=>{const talentList=[...r.querySelectorAll(".regular-talent")];return talentList.length>0&&talentList.every((t=>t.querySelector("p")?.textContent===t.dataset.max))===isMax};export const isUltraTalentsMax=(r,isMax)=>{const talentList=[...r.querySelectorAll(".ultra-talent")];return talentList.length>0&&talentList.every((t=>t.querySelector("p")?.textContent===t.dataset.max))===isMax};export const isTalentable=r=>r.querySelectorAll(".regular-talent").length>0;export const isUltraTalentable=r=>r.querySelectorAll(".ultra-talent").length>0;export const isOrbTrait=(r,x)=>r.querySelectorAll(`.orb-color[data-trait='${x}']`).length>0;export const isOrbType=(r,x)=>r.querySelectorAll(`.orb-type[data-type='${x}']`).length>0;export const isOrbRank=(r,x)=>r.querySelectorAll(`.orb-rank[data-rank='${x}']`).length>0;export function isGloballyFiltered(unit){let shouldBeHidden="0"===window.localStorage.getItem("f1")&&unit.unobtainable;return shouldBeHidden||="0"===window.localStorage.getItem("f2")&&unit.collab,shouldBeHidden||="0"===window.localStorage.getItem("f3")&&!unit.in_EN,shouldBeHidden||="0"===window.localStorage.getItem("f4")&&0===unit.level,shouldBeHidden||="0"===window.localStorage.getItem("f5")&&!unit.favorited,shouldBeHidden}