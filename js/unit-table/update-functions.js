//@ts-check
/* -------------------------- Update functions -------------------------- */

import SETTINGS from "../../assets/settings.js";

export const hideUnit = (/** @type {number} */ id, /** @type {HTMLTableRowElement} */ r) => {
    r.classList.add("hidden");
    document.querySelectorAll(`#unit-search-suggestions div[data-target='${id}']`).forEach(o => o.classList.add("global-hidden"));

    const statButton = /** @type {HTMLInputElement} */ (r.querySelector(".stat-display-option"));
    if(statButton.textContent !== "+") {
        statButton.click();
    }
};

export const unhideUnit = (/** @type {number} */ id, /** @type {HTMLTableRowElement} */ r) => {
    r.classList.remove("hidden");
    document.querySelectorAll(`#unit-search-suggestions div[data-target='${id}']`).forEach(o => o.classList.remove("global-hidden"));
};

export const resetUnit = (/** @type {number} */ id, /** @type {HTMLTableRowElement} */ r) => {
    const form = /** @type {HTMLTableRowElement} */ (r.querySelector(".row-image"));
    form.dataset.form = "0";
    if(!SETTINGS.skipImages.includes(id)) {
        /** @type {HTMLImageElement} */ (form.querySelector(".unit-icon")).src = `./assets/img/unit_icon/${id}_0.png`;
    }
    const name = /** @type {HTMLTableRowElement} */ (r.querySelector(".row-name"));
    name.textContent = name.dataset.normal_name ?? "UNDEFINED NAME";

    /** @type {NodeListOf<HTMLInputElement>} */ (r.querySelectorAll(".level-select")).forEach(l => {l.value = l.min});

    /** @type {NodeListOf<HTMLDivElement>} */ (document.querySelectorAll(".talent-box")).forEach(t => /** @type {HTMLParagraphElement} */ (t.querySelector(".talent-level")).textContent = "0");

    document.querySelectorAll(".orb-selector").forEach(o => {
        const color = /** @type {HTMLImageElement} */ (o.querySelector("orb-color"));
        color.dataset.trait = "";
        color.src = "./assets/img/orb/empty-orb.png";
        const type = /** @type {HTMLImageElement} */ (o.querySelector("orb-type"));
        type.dataset.trait = "";
        type.src = "";
        const rank = /** @type {HTMLImageElement} */ (o.querySelector("orb-rank"));
        rank.dataset.trait = "";
        rank.src = "";
    });

    /** @type {HTMLElement} */ (document.querySelector(".fav-icon")).click();

    r.classList.remove("hidden");
    document.querySelectorAll(`#unit-search-suggestions div[data-target='${id}']`).forEach(o => o.classList.remove("global-hidden"));
};

export const ownUnit = (/** @type {number} */ id, /** @type {HTMLTableRowElement} */ r) => {
    const levelBox = /** @type {HTMLInputElement} */ (document.querySelector(".level-select.max-level"));
    if(levelBox.value === "0") {
        levelBox.value = "1";
    }
};

export const evolveUnit = (/** @type {number} */ id, /** @type {HTMLTableRowElement} */ r) => {
    const form = /** @type {HTMLTableRowElement} */ (r.querySelector(".row-image"));
    form.dataset.form = form.dataset.max_form;
    if(!SETTINGS.skipImages.includes(id)) {
        /** @type {HTMLImageElement} */ (form.querySelector(".unit-icon")).src = `./assets/img/unit_icon/${id}_${form.dataset.max_form}.png`;
    }

    const name = /** @type {HTMLTableRowElement} */ (r.querySelector(".row-name"));
    name.textContent = [name.dataset.normal_name, name.dataset.evolved_name, name.dataset.true_name, name.dataset.ultra_name][parseInt(form.dataset.max_form ?? "0")] ?? "UNDEFINED NAME";
};

export const level30Unit = (/** @type {number} */ id, /** @type {HTMLTableRowElement} */ r) => {
    const levelBox = /** @type {HTMLInputElement} */ (document.querySelector(".level-select.max-level"));
    levelBox.value = `${Math.min(30, parseInt(levelBox.max))}`;
};

export const level50Unit = (/** @type {number} */ id, /** @type {HTMLTableRowElement} */ r) => {
    const levelBox = /** @type {HTMLInputElement} */ (document.querySelector(".level-select.max-level"));
    levelBox.value = `${Math.min(50, parseInt(levelBox.max))}`;
};

export const levelMaxUnit = (/** @type {number} */ id, /** @type {HTMLTableRowElement} */ r) => {
    const levelBox = /** @type {HTMLInputElement} */ (document.querySelector(".level-select.max-level"));
    levelBox.value = levelBox.max;
    const plusLevelBox = /** @type {HTMLInputElement} */ (document.querySelector(".level-select.max-plus-level"));
    plusLevelBox.value = plusLevelBox.max;
};

export const talentMaxUnit = (/** @type {number} */ id, /** @type {HTMLTableRowElement} */ r) => {
        /** @type {NodeListOf<HTMLDivElement>} */ (document.querySelectorAll(".talent-box.regular-talent")).forEach(t => /** @type {HTMLParagraphElement} */ (t.querySelector(".talent-level")).textContent = t.dataset.max ?? "0");
};

export const utMaxUnit = (/** @type {number} */ id, /** @type {HTMLTableRowElement} */ r) => {
        /** @type {NodeListOf<HTMLDivElement>} */ (document.querySelectorAll(".talent-box.ultra-talent")).forEach(t => /** @type {HTMLParagraphElement} */ (t.querySelector(".talent-level")).textContent = t.dataset.max ?? "0");
};