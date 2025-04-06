//@ts-check
import { FORM } from "../../helper/parse-file.js";
import { createLevelInteractable, createOrbInteractable, createTalentInteractable } from "./create-row-interactable.js";

/**
 * Creates a row in a unit table.
 * @param {import("../../helper/parse-file.js").UNIT_DATA} entry The unit to take values from to initialize the row with.
 * @returns {HTMLTableRowElement} The created row.
 */
export default function createRow(entry) {
    const row = document.createElement("tr");
    row.dataset.is_collab = entry.collab ? "Y" : "N";
    row.dataset.in_en = entry.in_EN ? "Y" : "N";
    row.dataset.is_unobtainable = entry.unobtainable ? "Y" : "N";
    row.dataset.rarity = entry.rarity;
    row.classList.toggle("hidden", entry.hidden);

    const idBox = createIDBox(entry.id);
    const [nameBox, nameUpdate] = createNameBox([entry.normal_form, entry.evolved_form, entry.true_form, entry.ultra_form], entry.current_form);
    const [iconBox, iconReset, iconMax] = createIconBox(entry.id, entry.current_form, entry.max_form, entry.disable_icon, nameUpdate);
    const [levelBox, levelReset, levelMax, plusLevelReset, plusLevelMax] = createLevelBox(entry.level_cap, entry.level, entry.plus_level);
    const [talentBox, talentReset, talentMax, ultraTalentReset, ultraTalentMax] = createTalentBox(entry.talents, entry.ultra_talents);
    const [orbBox, orbReset] = createOrbBox(entry.orb);
    const [favoriteBox, favoriteReset] = createFavoriteBox(entry.favorited);
    const optionsBox = createOptionsBox({
        reset: {
            icon: iconReset, level: levelReset, plusLevel: plusLevelReset, talent: talentReset, ultraTalent: ultraTalentReset, orb: orbReset, favorite: favoriteReset
        },
        max: {
            icon: iconMax, level: levelMax, plusLevel: plusLevelMax, talent: talentMax, ultraTalent: ultraTalentMax
        },
        hide: () => {
            row.classList.add("hidden");
            document.querySelectorAll(`#unit-search-suggestions div[data-target='${entry.id}']`).forEach(o => o.classList.add("global-hidden"));
        }
    });

    row.append(idBox, iconBox, nameBox, levelBox, talentBox, orbBox, favoriteBox, optionsBox);
    return row;
}

/**
 * Creates a unit ID column entry.
 * @param {number} id The unit ID.
 * @returns {HTMLTableCellElement} The ID column entry.
 */
export function createIDBox(id) {
    const rowID = document.createElement("td");
    rowID.classList.add("row-id");
    rowID.textContent = `${id}`;

    return rowID;
}

/**
 * Creates a unit icon column entry.
 * @param {number} id The unit's id.
 * @param {FORM} currentForm The current form of the unit.
 * @param {FORM} maxForm The maximum allowed form of the unit.
 * @param {boolean} iconDisabled Whether the unit should display an icon.
 * @param {(form: FORM) => void} nameCallback A function to update the unit name column entry.
 * @returns {[HTMLTableCellElement, () => void, () => void]} The icon column entry, and a function to reset the unit form, and to max the unit form.
 */
export function createIconBox(id, currentForm, maxForm, iconDisabled, nameCallback) {
    const rowImage = document.createElement("td");
    rowImage.classList.add("row-image");
    rowImage.dataset.form = `${currentForm}`;
    rowImage.dataset.max_form = `${maxForm}`;

    const rowIMG = document.createElement("img");
    rowIMG.classList.add("unit-icon");
    if(iconDisabled) {
        rowIMG.src = "./assets/img/unit_icon/unknown.png";
    } else {
        rowIMG.src = `./assets/img/unit_icon/${id}_${currentForm}.png`;
    }
    rowIMG.onerror = () => { rowIMG.onerror = null; rowIMG.src = "./assets/img/unit_icon/unknown.png"; }
    rowImage.appendChild(rowIMG);

    rowIMG.addEventListener("click", () => {
        if(rowImage.dataset.form === `${maxForm}`) {
            rowImage.dataset.form = "0";
        } else {
            //@ts-ignore
            rowImage.dataset.form = `${parseInt(rowImage.dataset.form) + 1}`;
        }

        if(!rowIMG.classList.contains("hidden")) {
            rowIMG.src = `./assets/img/unit_icon/${id}_${rowImage.dataset.form}.png`;
        }
        nameCallback(parseInt(rowImage.dataset.form));
    });

    return [rowImage,
        () => { rowImage.dataset.form = `${maxForm}`; rowIMG.click(); },
        () => { rowImage.dataset.form = `${maxForm - 1}`; rowIMG.click(); }];
}

/**
 * Creates a name column entry.
 * @param {[string|null, string|null, string|null, string|null]} names Names for all possible forms. If the unit does not have a specific form, the value should be null instead.
 * @param {FORM} currentForm The current form of the unit.
 * @returns {[HTMLTableCellElement, () => void]} The name column entry, and a function to set the unit to a specific form.
 */
export function createNameBox(names, currentForm) {
    const rowName = document.createElement("td");
    rowName.classList.add("row-name");
    rowName.dataset.normal_name = names[0] ?? "";
    rowName.dataset.evolved_name = names[1] ?? "";
    rowName.dataset.true_name = names[2] ?? "";
    rowName.dataset.ultra_name = names[3] ?? "";
    rowName.textContent = names[currentForm];

    return [rowName, (/** @type {number} */ form) => rowName.textContent = names[form]];
}

/**
 * Creates a level column entry.
 * @param {import("../../helper/parse-file.js").LEVEL_CAP} levelCapInfo The level caps to apply to the level and plus level inputs.
 * @param {number} currentLevel The initial value of the level input.
 * @param {number} currentPlusLevel  The initial value of the plus level input.
 * @returns {[HTMLTableCellElement, () => void, () => void, (() => void)|null, (() => void)|null]} The level column entry, and functions that (in order) reset level, max level, reset plus level, max plus level. If the unit does not have plus levels, those functions are instead null.
 */
export function createLevelBox(levelCapInfo, currentLevel, currentPlusLevel) {
    const rowLevel = document.createElement("td");
    rowLevel.classList.add("row-level");
    const horizontalAlign = document.createElement("span");
    horizontalAlign.classList.add("h-align");

    const maxLevel = createLevelInteractable(levelCapInfo.MaxLevel, currentLevel);
    horizontalAlign.appendChild(maxLevel);
    const maxLevelInput = /** @type {HTMLInputElement} */ (maxLevel.querySelector(".level-select") ?? maxLevel);
    maxLevelInput.classList.add("max-level");

    let setPlusMin = null, setPlusMax = null;
    if(levelCapInfo.MaxPlusLevel > 0) {
        const plusText = document.createElement("p");
        plusText.classList.add("level-text");
        plusText.innerText = "+";
        horizontalAlign.appendChild(plusText);

        const maxPlusLevel = createLevelInteractable(levelCapInfo.MaxPlusLevel, currentPlusLevel);
        horizontalAlign.appendChild(maxPlusLevel);
        const maxPlusLevelInput = /** @type {HTMLInputElement} */ (maxPlusLevel.querySelector(".level-select") ?? maxPlusLevel);
        maxPlusLevelInput.classList.add("max-plus-level");

        setPlusMin = () => maxPlusLevelInput.value = maxPlusLevelInput.min;
        setPlusMax = () => maxPlusLevelInput.value = maxPlusLevelInput.max;
    }

    rowLevel.appendChild(horizontalAlign);
    return [rowLevel,
        () => maxLevelInput.value = maxLevelInput.min,
        () => maxLevelInput.value = maxLevelInput.max,
        setPlusMin,
        setPlusMax];
}

/**
 * Creates a talent and ultra talent column entrty.
 * @param {import("../../helper/parse-file.js").TALENT[]} normalTalents The normal talents of the unit.
 * @param {import("../../helper/parse-file.js").TALENT[]} ultraTalents The ultra talents of the unit.
 * @returns {[HTMLTableCellElement, (() => void)|null, (() => void)|null, (() => void)|null, (() => void)|null]} The column entry, and then functions to (in order) reset normal talents, max normal talents, reset ultra talents, max ultra talents. If the unit lacks talents and/or ultra talents, the respective functions are instead null.
 */
export function createTalentBox(normalTalents, ultraTalents) {
    const rowTalents = document.createElement("td");
    rowTalents.classList.add("row-talent");
    const horizontalAlign = document.createElement("div");
    horizontalAlign.classList.add("h-align");

    if(normalTalents.length !== 0) {
        for(const talent of normalTalents) {
            horizontalAlign.appendChild(createTalentInteractable(talent.name, talent.cap, talent.value, false));
        }
    }

    if(ultraTalents.length !== 0) {
        for(const talent of ultraTalents) {
            horizontalAlign.appendChild(createTalentInteractable(talent.name, talent.cap, talent.value, true));
        }
    }

    rowTalents.appendChild(horizontalAlign);
    return [rowTalents,
        //@ts-ignore
        normalTalents.length !== 0 ? () => /** @type {NodeListOf<HTMLParagraphElement>} */ (horizontalAlign.querySelectorAll(".regular-talent p")).forEach(p => { p.innerText = "0"; p.onchange(); }) : null,
        //@ts-ignore
        normalTalents.length !== 0 ? () => /** @type {NodeListOf<HTMLParagraphElement>} */ (horizontalAlign.querySelectorAll(".regular-talent p")).forEach(p => { p.innerText = `${p.parentElement?.dataset.max}`; p.onchange(); }) : null,
        //@ts-ignore
        ultraTalents.length !== 0 ? () => /** @type {NodeListOf<HTMLParagraphElement>} */ (horizontalAlign.querySelectorAll(".ultra-talent p")).forEach(p => { p.innerText = "0"; p.onchange(); }) : null,
        //@ts-ignore
        ultraTalents.length !== 0 ? () => /** @type {NodeListOf<HTMLParagraphElement>} */ (horizontalAlign.querySelectorAll(".ultra-talent p")).forEach(p => { p.innerText = `${p.parentElement?.dataset.max}`; p.onchange(); }) : null];
}

/**
 * Creates an orb selection column entry.
 * @param {import("../../helper/parse-file.js").ORB[]} existingOrbs Any existing orbs for the unit, being null if the unit does not have an orb in that slot.
 * @returns {[HTMLTableCellElement, (() => void)|null]} The column entry and a function to reset the orb(s), or null if the unit does not have any orb slots.
 */
export function createOrbBox(existingOrbs) {
    const rowOrb = document.createElement("td");
    rowOrb.classList.add("row-orb");
    let horizontalAlign = null;

    if(existingOrbs.length > 0) {
        horizontalAlign = document.createElement("div");
        horizontalAlign.classList.add("h-align");
        for(let x = 0; x < existingOrbs.length; x++) {
            horizontalAlign.appendChild(createOrbInteractable(existingOrbs[x]));
        }

        rowOrb.appendChild(horizontalAlign);
    }

    return [rowOrb, existingOrbs.length > 0 ? () => {
        /** @type {NodeListOf<HTMLImageElement>} */ (horizontalAlign?.querySelectorAll(".orb-color")).forEach(oc => { oc.dataset.trait = ""; oc.src = "./assets/img/orb/empty-orb.png"; });
        /** @type {NodeListOf<HTMLImageElement>} */ (horizontalAlign?.querySelectorAll(".orb-type")).forEach(ot => { ot.dataset.type = ""; ot.src = ""; ot.classList.add("invisible"); });
        /** @type {NodeListOf<HTMLImageElement>} */ (horizontalAlign?.querySelectorAll(".orb-rank")).forEach(or => { or.dataset.rank = ""; or.src = ""; or.classList.add("invisible"); });
    } : null];
}

/**
 * Creates a favorite selection column entry.
 * @param {boolean} isFavorited Whether the unit should start off favorited.
 * @returns {[HTMLTableCellElement, () => void]} The created entry, and a function to reset the favorited state of the row (there is no "max" function that sets the favorited state since that is intended to only be done manually).
 */
export function createFavoriteBox(isFavorited) {
    const rowFavorite = document.createElement("td");
    rowFavorite.classList.add("row-favorite");
    const favWrapper = document.createElement("div");
    favWrapper.classList.add("fav-wrapper");

    const favIcon = document.createElement("img");
    favIcon.classList.add("fav-icon");
    favIcon.src = "./assets/img/fav-empty.png";
    favWrapper.dataset.favorited = `${isFavorited ? 0 : 1}`; // Inverted since a click event gets called to update image

    favIcon.onclick = () => {
        if(favWrapper.dataset.favorited === "0") {
            favIcon.src = "./assets/img/fav-full.png";
            favWrapper.dataset.favorited = "1";
        } else {
            favIcon.src = "./assets/img/fav-empty.png";
            favWrapper.dataset.favorited = "0";
        }
    };
    favIcon.click();

    favWrapper.appendChild(favIcon);
    rowFavorite.appendChild(favWrapper);

    return [rowFavorite, () => { favWrapper.dataset.favorited = "1"; favIcon.click(); }];
}

/**
 * Creates the options column entry for the row.
 * @param {{ reset: Object; max: Object; hide: Object; }} optionCallbacks Functions that describe what actions can be performed to the row, based on what columns are filled in.
 * @returns {HTMLTableCellElement} The created options entry.
 */
export function createOptionsBox(optionCallbacks) {
    const rowOptions = document.createElement("td");
    rowOptions.classList.add("row-option");
    const rowOptionAlign = document.createElement("div");
    rowOptionAlign.classList.add("row-option-wrapper");

    const includedInMax = [];

    const reset = createOptionButton("R", "Reset Unit", "reset-option", () => Object.values(optionCallbacks.reset).forEach(f => f !== null && f()));
    rowOptionAlign.appendChild(reset);

    const maxLevel = createOptionButton("L", "Max Regular Level", "level-option", optionCallbacks.max.level);
    rowOptionAlign.appendChild(maxLevel);
    includedInMax.push(maxLevel);

    if(optionCallbacks.max.plusLevel) {
        const maxPlusLevel = createOptionButton("+", "Max + Level", "plus-level-option", optionCallbacks.max.plusLevel);
        rowOptionAlign.appendChild(maxPlusLevel);
        includedInMax.push(maxPlusLevel);
    }
    if(optionCallbacks.max.talent) {
        const maxTalents = createOptionButton("T", "Max Regular Talents", "talent-option", optionCallbacks.max.talent);
        rowOptionAlign.appendChild(maxTalents);
        includedInMax.push(maxTalents);
    }
    if(optionCallbacks.max.ultraTalent) {
        const maxUltraTalents = createOptionButton("U", "Max Ultra Talents", "ultra-talent-option", optionCallbacks.max.ultraTalent);
        rowOptionAlign.appendChild(maxUltraTalents);
        includedInMax.push(maxUltraTalents);
    }

    const maxAll = createOptionButton("M", "Max Everything", "max-option", () => Object.values(optionCallbacks.max).forEach(f => f !== null && f()));
    rowOptionAlign.appendChild(maxAll);

    const hideUnit = createOptionButton("H", "Hide Unit", "hide-option", optionCallbacks.hide);
    rowOptionAlign.appendChild(hideUnit);

    rowOptions.appendChild(rowOptionAlign);

    return rowOptions;
}

/**
 * Creates an option button.
 * @param {string} text The button text.
 * @param {string} description The button description.
 * @param {string} className A class for the button.
 * @param {() => void} effect The effect of clicking on the button.
 * @returns {HTMLButtonElement} The created button.
 */
function createOptionButton(text, description, className, effect) {
    const button = document.createElement("button");
    button.textContent = text;
    button.title = description;
    button.classList.add(className);
    button.classList.add("option-button");
    button.onclick = effect;

    return button;
}