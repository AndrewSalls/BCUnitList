//@ts-check
import { getValuesFromRow, observeRowChange } from "../helper/link-row.js";
import createRow from "./creation/create-unit-row.js";

const rowRef = {};

/**
 * Registers a row to update when {@link syncRowValues} is called with the same id.
 * @param {HTMLTableRowElement} row The row to update.
 * @param {number} id The id of the row.
 */
export function registerSyncedRow(row, id) {
    if(!rowRef[id]) {
        rowRef[id] = [];
    }

    rowRef[id].push(row);
}

/**
 * Updates all rows representing a unit with the same id as the provided row to have the same values.
 * @param {HTMLTableRowElement} row The row to copy values from.
 * @param {number} id The ID of the unit that is being updated in all referencing rows.
 */
export function syncRowValues(row, id) {
    if(rowRef[id].length > 1) {
        if(row.querySelector(".fav-icon")?.parentElement?.dataset.favorited === "0") {
            const remain = [], removed = [];
            for(const entry of rowRef[id]) {
                if(entry.parentElement.parentElement.parentElement.classList.contains("favorited-table-marker")) {
                    removed.push(entry);
                } else {
                    remain.push(entry);
                }
            }

            for(const favTableElm of removed) {
                favTableElm.parentElement.removeChild(favTableElm);
            }
            rowRef[id] = remain;
        }

        const values = getValuesFromRow(row);
        rowRef[id].forEach((/** @type {any} */ r) => {
            if(r !== row) {
                copyUpdatedValues(values, r);
            }
        });
    } else if(row.querySelector(".fav-icon")?.parentElement?.dataset.favorited === "1") {
        const values = /** @type {import("../data/unit-data.js").UNIT_DATA} */ (/** @type {unknown} */ (getValuesFromRow(row)));
        values.collab = row.dataset.is_collab === "Y";
        values.unobtainable = row.dataset.is_unobtainable === "Y";
        values.in_EN = row.dataset.in_en === "Y";

        const nameBox = /** @type {HTMLTableCellElement} */ (row.querySelector(".row-name"));
        values.normal_form = nameBox.dataset.normal_name ?? null;
        values.evolved_form = nameBox.dataset.evolved_name ?? null;
        values.true_form = nameBox.dataset.true_name ?? null;
        values.ultra_form = nameBox.dataset.ultra_name ?? null;
        values.max_form = parseInt(/** @type {HTMLTableCellElement} */ (row.querySelector(".row-image")).dataset.max_form ?? "0");

        values.level_cap = {
            Type: "INTERNAL",
            MaxLevel: parseInt(/** @type {HTMLInputElement} */ (row.querySelector(".row-level .max-level")).max),
            MaxPlusLevel: parseInt(/** @type {HTMLInputElement} */ (row.querySelector(".row-level .max-plus-level")).max ?? 0)
        };

        values.talents = /** @type {HTMLDivElement[]} */ ([...row.querySelectorAll(".regular-talent")]).map((/** @type {HTMLDivElement} */ t, /** @type {number} */ i) => {
            return {
                name: t.querySelector("img")?.src.replace(/.+\//, "").replace(".png", "") ?? "",
                cap: parseInt(t.dataset.max ?? "0"),
                value: /** @type {number} */ ( /** @type {unknown} */ (values.talents[i]))
            };
        });
        values.ultra_talents = /** @type {HTMLDivElement[]} */ ([...row.querySelectorAll(".ultra-talent")]).map((/** @type {HTMLDivElement} */ t, /** @type {number} */ i) => {
            return {
                name: t.querySelector("img")?.src.replace(/.+\//, "").replace(".png", "") ?? "",
                cap: parseInt(t.dataset.max ?? "0"),
                value: /** @type {number} */ ( /** @type {unknown} */ (values.ultra_talents[i]))
            };
        });
        
        const newRow = createRow(values);
        document.querySelector("#favorited-table tbody")?.appendChild(newRow);
        observeRowChange(newRow, () => syncRowValues(newRow, id));
        rowRef[id].push(newRow);
    }
};

/**
 * Copies values taken from a category's unit table and pastes them into a provided different unit table to sync.
 * @param {import("../data/unit-data.js").UNIT_RECORD} values The values to copy into a table.
 * @param {HTMLDivElement} toUpdate The element containing the table to update with new values.
 */
export function copyUpdatedValues(values, toUpdate) {    
    /** @type {HTMLDivElement} */ (toUpdate.querySelector(".row-image")).dataset.form = `${values.current_form}`;
    const image = /** @type {HTMLImageElement} */ (toUpdate.querySelector(".unit-icon"));
    image.src = image.src.replace(/[0-9]+(?=\.png)/, `${values.current_form}`);
    
    const nameDiv = /** @type {HTMLTableCellElement} */ (toUpdate.querySelector(".row-name"));
    nameDiv.textContent = [nameDiv.dataset.normal_name, nameDiv.dataset.evolved_name, nameDiv.dataset.true_name, nameDiv.dataset.ultra_name][values.current_form] ?? null;

    /** @type {HTMLInputElement} */ (toUpdate.querySelector(".max-level")).value = `${values.level}`;
    const pluslevel = /** @type {HTMLInputElement} */ (toUpdate.querySelector(".max-plus-level"));
    if(pluslevel) {
        pluslevel.value = `${values.plus_level}`;
    }

    const talents = /** @type {NodeListOf<HTMLDivElement>} */ (toUpdate.querySelectorAll(".regular-talent"));
    for(let x = 0; x < talents.length; x++) {
        /** @type {HTMLParagraphElement} */ (talents[x].querySelector(".talent-level")).textContent = `${values.talents[x]}`;
        talents[x].classList.toggle("maxed-talent", `${values.talents[x]}` === talents[x].dataset.max);
    }
    const ultraTalents = /** @type {NodeListOf<HTMLDivElement>} */ (toUpdate.querySelectorAll(".ultra-talent"));
    for(let x = 0; x < ultraTalents.length; x++) {
        /** @type {HTMLParagraphElement} */ (ultraTalents[x].querySelector(".talent-level")).textContent = `${values.ultra_talents[x]}`;
        ultraTalents[x].classList.toggle("maxed-talent", `${values.ultra_talents[x]}` === ultraTalents[x].dataset.max);
    }

    const orbs = toUpdate.querySelectorAll(".orb-selector");
    for(let x = 0; x < orbs.length; x++) {
        const trait = /** @type {HTMLImageElement} */ (orbs[x].querySelector(".orb-color"));
        const type = /** @type {HTMLImageElement} */ (orbs[x].querySelector(".orb-type"));
        const rank = /** @type {HTMLImageElement} */ (orbs[x].querySelector(".orb-rank"));

        if(!values.orb[x]) {
            trait.dataset.trait = "";
            trait.src = "./assets/img/orb/empty-orb.png";

            type.classList.add("invisible");
            type.dataset.type = "";
            type.src = "";

            rank.classList.add("invisible");
            rank.dataset.rank = "";
            rank.src = "";
        } else {
            trait.dataset.trait = `${values.orb[x]?.trait}`;
            trait.src = `./assets/img/orb/${values.orb[x]?.trait}.png`;
    
            type.dataset.type = `${values.orb[x]?.type}`;
            type.src = `./assets/img/orb/${values.orb[x]?.type}.png`;
            type.classList.remove("invisible");
    
            rank.dataset.rank = `${values.orb[x]?.rank}`;
            rank.src = `./assets/img/orb/${values.orb[x]?.rank}.png`;
            rank.classList.remove("invisible");
        }
    }

    /** @type {HTMLDivElement} */ (toUpdate.querySelector(".fav-wrapper")).dataset.favorited = values.favorited ? "1" : "0";
    /** @type {HTMLImageElement} */ (toUpdate.querySelector(".fav-icon")).src = `./assets/img/fav-${values.favorited ? "full" : "empty"}.png`;
}