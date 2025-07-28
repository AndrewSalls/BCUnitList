//@ts-check
/* -------------------------- Update functions -------------------------- */

import SETTINGS from "../../assets/settings.js";

export const hideUnit = (/** @type {HTMLTableRowElement} */ r) => {
    const id = parseInt(r.querySelector(".row-id")?.textContent ?? "0");
    r.classList.add("hidden");
    document.querySelectorAll(`#unit-search-suggestions div[data-target='${id}']`).forEach(o => o.classList.add("global-hidden"));
};

export const unhideUnit = (/** @type {HTMLTableRowElement} */ r) => {
    const id = parseInt(r.querySelector(".row-id")?.textContent ?? "0");
    r.classList.remove("hidden");
    document.querySelectorAll(`#unit-search-suggestions div[data-target='${id}']`).forEach(o => o.classList.remove("global-hidden"));
};

export const resetUnit = (/** @type {HTMLTableRowElement} */ r) => {
    const id = parseInt(r.querySelector(".row-id")?.textContent ?? "0");
    const form = /** @type {HTMLTableRowElement} */ (r.querySelector(".row-image"));
    form.dataset.form = "0";
    if(!SETTINGS.skipImages.includes(id)) {
        /** @type {HTMLImageElement} */ (form.querySelector(".unit-icon")).src = `./assets/img/unit_icon/${id}_0.png`;
    }
    const name = /** @type {HTMLTableRowElement} */ (r.querySelector(".row-name"));
    name.textContent = name.dataset.normal_name ?? "UNDEFINED NAME";

    /** @type {NodeListOf<HTMLInputElement>} */ (r.querySelectorAll(".level-select")).forEach(l => {l.value = l.min});

    /** @type {NodeListOf<HTMLDivElement>} */ (r.querySelectorAll(".talent-box"))
        .forEach(t => {
            /** @type {HTMLParagraphElement} */ (t.querySelector(".talent-level")).textContent = "0";
            t.classList.remove("maxed-talent");
        });

    r.querySelectorAll(".orb-selector").forEach(o => {
        const color = /** @type {HTMLImageElement} */ (o.querySelector(".orb-color"));
        color.dataset.trait = "";
        color.src = "./assets/img/orb/empty-orb.png";
        const type = /** @type {HTMLImageElement} */ (o.querySelector(".orb-type"));
        type.dataset.trait = "";
        type.src = "";
        const rank = /** @type {HTMLImageElement} */ (o.querySelector(".orb-rank"));
        rank.dataset.trait = "";
        rank.src = "";
    });

    /** @type {HTMLElement} */ (r.querySelector(".fav-wrapper")).dataset.favorited = "0";
    /** @type {HTMLImageElement} */ (r.querySelector(".fav-icon")).src = "./assets/img/fav-empty.png";

    r.classList.remove("hidden");
    document.querySelectorAll(`#unit-search-suggestions div[data-target='${id}']`).forEach(o => o.classList.remove("global-hidden"));
};

export const ownUnit = (/** @type {HTMLTableRowElement} */ r) => {
    const levelBox = /** @type {HTMLInputElement} */ (r.querySelector(".level-select.max-level"));
    if(levelBox.value === "0") {
        levelBox.value = "1";
    }
};

export const evolveUnit = (/** @type {HTMLTableRowElement} */ r) => {
    const id = parseInt(r.querySelector(".row-id")?.textContent ?? "0");
    const form = /** @type {HTMLTableRowElement} */ (r.querySelector(".row-image"));
    form.dataset.form = form.dataset.max_form;
    if(!SETTINGS.skipImages.includes(id)) {
        /** @type {HTMLImageElement} */ (form.querySelector(".unit-icon")).src = `./assets/img/unit_icon/${id}_${form.dataset.max_form}.png`;
    }

    const name = /** @type {HTMLTableRowElement} */ (r.querySelector(".row-name"));
    name.textContent = [name.dataset.normal_name, name.dataset.evolved_name, name.dataset.true_name, name.dataset.ultra_name][parseInt(form.dataset.max_form ?? "0")] ?? "UNDEFINED NAME";
};

export const level30Unit = (/** @type {HTMLTableRowElement} */ r) => {
    const levelBox = /** @type {HTMLInputElement} */ (r.querySelector(".level-select.max-level"));
    levelBox.value = `${Math.min(30, parseInt(levelBox.max))}`;
};

export const level50Unit = (/** @type {HTMLTableRowElement} */ r) => {
    const levelBox = /** @type {HTMLInputElement} */ (r.querySelector(".level-select.max-level"));
    levelBox.value = `${Math.min(50, parseInt(levelBox.max))}`;
};

export const levelMaxUnit = (/** @type {HTMLTableRowElement} */ r) => {
    const plusLevelBox = /** @type {HTMLInputElement} */ (r.querySelector(".level-select.max-plus-level"));
    if(plusLevelBox) {
        plusLevelBox.value = plusLevelBox.max;
    }
};

export const talentMaxUnit = (/** @type {HTMLTableRowElement} */ r) => {
        /** @type {NodeListOf<HTMLDivElement>} */ (r.querySelectorAll(".talent-box.regular-talent"))
        .forEach(t => {
            /** @type {HTMLParagraphElement} */ (t.querySelector(".talent-level")).textContent = t.dataset.max ?? "0";
            t.classList.add("maxed-talent");
        });
};

export const utMaxUnit = (/** @type {HTMLTableRowElement} */ r) => {
        /** @type {NodeListOf<HTMLDivElement>} */ (r.querySelectorAll(".talent-box.ultra-talent"))
        .forEach(t => {
            /** @type {HTMLParagraphElement} */ (t.querySelector(".talent-level")).textContent = t.dataset.max ?? "0";
            t.classList.add("maxed-talent");
        });
};