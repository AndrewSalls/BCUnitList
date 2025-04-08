//@ts-check

/**
 * Register delegate to call when a row changes any value.
 * @param {HTMLDivElement} row An element containing a unit row.
 * @param {() => void} observerCallback A function to call when observing a change in the row's values.
 */
export function observeRowChange(row, observerCallback) {
    row.querySelector(".unit-icon")?.addEventListener("click", observerCallback);
    row.querySelectorAll(".level-select").forEach((/** @type {Element} */ l) => l.addEventListener("change", observerCallback));
    row.querySelectorAll(".talent-box .talent-level").forEach((/** @type {Element} */ t) => t.addEventListener("change", observerCallback));
    row.querySelectorAll(".orb-selector").forEach((/** @type {Element} */ o) => o.addEventListener("change", observerCallback));
    row.querySelector(".fav-icon")?.addEventListener("click", observerCallback);
    row.querySelectorAll(".row-option .option-button").forEach((/** @type {Element} */ o) => o.addEventListener("click", observerCallback));
    row.addEventListener("generic-update", observerCallback);
}

/**
 * Obtains a unit's values from that unit's row in a unit table.
 * @param {HTMLDivElement} row The element containing the row to get values from.
 * @returns {import("../data/unit-data").UNIT_RECORD} The unit's data.
 */
export function getValuesFromRow(row) {
    const output = {
        id: parseInt(row.querySelector(".row-id")?.textContent ?? "0"),
        current_form: parseInt(/** @type {HTMLDivElement} */ (row.querySelector(".row-image")).dataset.form ?? "0"),
        level: parseInt(/** @type {HTMLInputElement} */ (row.querySelector(".max-level.level-select")).value),
        plus_level: 0,
        talents: /** @type {number[]} */ ([]),
        ultra_talents: /** @type {number[]} */ ([]),
        orb: /** @type {import("../data/unit-data").ORB[]} */ ([]),
        favorited: /** @type {HTMLDivElement} */ (row.querySelector(".row-favorite .fav-wrapper")).dataset.favorited === "1",
        hidden: row.classList.contains("hidden")
    };

    const plusLevel = /** @type {HTMLInputElement} */ (row.querySelector(".max-plus-level.level-select"));
    if(plusLevel) {
        output.plus_level = parseInt(plusLevel.value);
    }

    const talents = [...row.querySelectorAll(".talent-box.regular-talent")];
    if(talents.length > 0) {
        output.talents = talents.map(t => parseInt(t.querySelector(".talent-level")?.textContent ?? "0"));
    }
    const ultraTalents = [...row.querySelectorAll(".talent-box.ultra-talent")];
    if(ultraTalents.length > 0) {
        output.ultra_talents = ultraTalents.map(t => parseInt(t.querySelector(".talent-level")?.textContent ?? "0"));
    }

    const orbs = [...row.querySelectorAll(".orb-selector")];
    if(orbs.length > 0) {
        output.orb = orbs.map(o => {
            if(!/** @type {HTMLImageElement} */ (o.querySelector(".orb-color")).dataset.trait) {
                return null;
            }

            return {
                trait: parseInt(/** @type {HTMLImageElement} */ (o.querySelector(".orb-color")).dataset.trait ?? "0"),
                type: parseInt(/** @type {HTMLImageElement} */ (o.querySelector(".orb-type")).dataset.type ?? "0"),
                rank: parseInt(/** @type {HTMLImageElement} */ (o.querySelector(".orb-rank")).dataset.rank ?? "0")
            };
        });
    }

    return output;
}