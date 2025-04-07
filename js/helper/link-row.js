// No ts-check because this whole file relies on the row having elements, and it would be silly to add guards against all of the data in the row not being created.

/**
 * Register delegate to call when a row changes any value.
 * @param {HTMLDivElement} row An element containing a unit row.
 * @param {() => void} observerCallback A function to call when observing a change in the row's values.
 */
export function observeRowChange(row, observerCallback) {
    row.querySelector(".unit-icon").addEventListener("click", observerCallback);
    row.querySelectorAll(".level-select").forEach((/** @type {Element} */ l) => l.addEventListener("change", observerCallback));
    row.querySelectorAll(".talent-box .talent-level").forEach((/** @type {Element} */ t) => t.addEventListener("change", observerCallback));
    row.querySelectorAll(".orb-selector").forEach((/** @type {Element} */ o) => o.addEventListener("change", observerCallback));
    row.querySelector(".fav-icon").addEventListener("click", observerCallback);
    row.querySelectorAll(".row-option .option-button").forEach((/** @type {Element} */ o) => o.addEventListener("click", observerCallback));
    row.addEventListener("generic-update", observerCallback);
}

/**
 * Obtains a unit's values from that unit's row in a unit table.
 * @param {HTMLDivElement} row The element containing the row to get values from.
 * @returns {import("./parse-file").UNIT_RECORD} The unit's data.
 */
export function getValuesFromRow(row) {
    const output = {
        id: parseInt(row.querySelector(".row-id").textContent),
        current_form: parseInt(row.querySelector(".row-image").getAttribute("data-form")),
        level: parseInt(row.querySelector(".max-level.level-select").value),
        plus_level: 0,
        talents: /** @type {number[]} */ ([]),
        ultra_talents: /** @type {number[]} */ ([]),
        orb: /** @type {import("./parse-file").ORB[]} */ ([]),
        favorited: row.querySelector(".row-favorite .fav-wrapper").getAttribute("data-favorited") === "1",
        hidden: row.classList.contains("hidden")
    };

    const plusLevel = row.querySelector(".max-plus-level.level-select");
    if(plusLevel) {
        output.plus_level = parseInt(plusLevel.value);
    }

    const talents = [...row.querySelectorAll(".talent-box.regular-talent")];
    if(talents.length > 0) {
        output.talents = talents.map(t => parseInt(t.querySelector(".talent-level").innerText));
    }
    const ultraTalents = [...row.querySelectorAll(".talent-box.ultra-talent")];
    if(ultraTalents.length > 0) {
        output.ultra_talents = ultraTalents.map(t => parseInt(t.querySelector(".talent-level").innerText));
    }

    const orbs = [...row.querySelectorAll(".orb-selector")];
    if(orbs.length > 0) {
        output.orb = orbs.map(o => {
            if(!o.querySelector(".orb-color").dataset.trait) {
                return null;
            }

            return {
                trait: o.querySelector(".orb-color").dataset.trait,
                type: o.querySelector(".orb-type").dataset.type,
                rank: o.querySelector(".orb-rank").dataset.rank
            };
        });
    }

    return output;
}