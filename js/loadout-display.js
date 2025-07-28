//@ts-check
import createArrowNumberBox from "./cat-base/arrow-box.js";
import { createSearchDropdown, initializeDataset } from "./helper/make-searchable.js";
import { decodeLink, encodeDirectLink } from "./helper/encoder.js";
import { createMinimalLoadout } from "./unit-table/creation/create-loadout-table.js";
import createRow from "./unit-table/creation/create-unit-row.js";
import createSearchableTable from "./unit-table/creation/create-unit-table.js";
import createOrbMenu from "./unit-table/orb/create-orb-selector.js";
import { initializeOrbSelection } from "./unit-table/orb/orb-selection.js";
import { getValuesFromRow } from "./helper/link-row.js";
import { checkPort, REQUEST_TYPES } from "./communication/iframe-link.js";
import SETTINGS from "../assets/settings.js";

let idFormMap = new Map();

/**
 * Initializes page elements once page has loaded.
 */
document.addEventListener("DOMContentLoaded", () => {
    initializeContent();

    window.addEventListener("portLoaded", loadLoadouts);
    if(checkPort()) {
        window.dispatchEvent(new CustomEvent("portLoaded"));
    }
});

/**
 * Initializes static content on the page.
 */
function initializeContent() {
    document.body.appendChild(createOrbMenu());
    initializeOrbSelection();

    const table = createSearchableTable("Loadout", []);
    table.querySelector(".searchable-table-title")?.parentElement?.remove();
    table.querySelector("thead tr.hidden")?.classList.remove("hidden");
    table.querySelector("tbody.hidden")?.classList.remove("hidden");
    document.querySelector("#unit-data-box")?.appendChild(table);

    const clearButton = /** @type {HTMLButtonElement} */ (document.querySelector("#reset-loadout"));
    clearButton.onclick = () => {
        idFormMap.clear();
        document.querySelector("#unit-data-box tbody")?.replaceChildren();

        /** @type {NodeListOf<HTMLDivElement>} */ (document.querySelectorAll("#loadout-box .chip.set-unit")).forEach(c => {
            c.classList.remove("set-unit");
            delete c.dataset.form;
            delete c.dataset.maxForm;
            delete c.dataset.id;

            /** @type {HTMLImageElement} */ (c.querySelector(".unit-icon")).src = "./assets/img/unit_icon/unknown.png";
            c.querySelector(".remove-unit")?.classList.add("hidden");
            c.querySelector(".unset-search")?.classList.remove("hidden");
        });

        /** @type {HTMLInputElement} */ (document.querySelector("#loadout-cannon input")).value = "1";
        /** @type {HTMLInputElement} */ (document.querySelector("#loadout-style input")).value = "0";
        /** @type {HTMLInputElement} */ (document.querySelector("#loadout-foundation input")).value = "0";
    };
    const codeEnterButton = /** @type {HTMLButtonElement} */ (document.querySelector("#import-loadout"));
    const shareCodeInput = /** @type {HTMLInputElement} */ (document.querySelector("#code-input"));
    shareCodeInput?.addEventListener("keyup", ev => {
        if(ev.key === "Enter") {
            codeEnterButton.click();
        }
    })
    codeEnterButton.onclick = () => {
        const loadoutCode = shareCodeInput.value;
        shareCodeInput.value = "";

        try {
            const decoded = decodeLink(loadoutCode);
            clearButton.click();

            /** @type {HTMLInputElement} */ (document.querySelector("#loadout-box .loadout-name")).value = decoded.title;
            /** @type {HTMLInputElement} */ (document.querySelector("#loadout-cannon input")).value = `${decoded.baseLevels[0]}`;
            /** @type {HTMLInputElement} */ (document.querySelector("#loadout-style input")).value = `${decoded.baseLevels[1]}`;
            /** @type {HTMLInputElement} */ (document.querySelector("#loadout-foundation input")).value = `${decoded.baseLevels[2]}`;
            const cannon = /** @type {HTMLImageElement} */ (document.querySelector("#loadout-box .base-cannon"));
            cannon.dataset.type = `${decoded.baseLevels[0]}`;
            cannon.src = `./assets/img/foundation/base_${decoded.baseLevels[0]}.png`;
            const style = /** @type {HTMLImageElement} */ (document.querySelector("#loadout-box .base-style"));
            style.dataset.type = `${decoded.baseLevels[1]}`;
            style.src = `./assets/img/foundation/base_${decoded.baseLevels[1]}_style.png`;
            const foundation = /** @type {HTMLImageElement} */ (document.querySelector("#loadout-box .base-foundation"));
            foundation.dataset.type = `${decoded.baseLevels[2]}`;
            foundation.src = `./assets/img/foundation/base_${decoded.baseLevels[2]}_foundation.png`;

            const chips = /** @type {HTMLDivElement[]} */ ([...document.querySelectorAll("#loadout-box .chip")]);
            for(let x = 0; x < decoded.units.length && x < chips.length; x++) {
                REQUEST_TYPES.GET_ID_DATA(decoded.units[x].id, true).then((/** @type {import("./data/unit-data.js").UNIT_DATA|null} */ u) => {
                    if(!u) {
                        console.error(`Missing unit data: ${decoded.units[x].id}`);
                        return;
                    }

                    chips[x].classList.add("set-unit");
                    /** @type {HTMLImageElement} */ (chips[x].querySelector(".unit-icon")).src = `./assets/img/unit_icon/${decoded.units[x].id}_${decoded.forms[x]}.png`;
                    chips[x].dataset.form = `${decoded.forms[x]}`;
                    chips[x].dataset.id = `${decoded.units[x].id}`;
                    chips[x].dataset.maxForm = `${u.max_form}`;
    
                    chips[x].querySelector(".remove-unit")?.classList.remove("hidden");
                    chips[x].querySelector(".unset-search")?.classList.add("hidden");

                    u.current_form = decoded.forms[x];
                    u.level = decoded.units[x].level;
                    u.plus_level = decoded.units[x].plus_level;
                    for(let y = 0; y < u.talents.length; y++) {
                        u.talents[y].value = decoded.units[x].talents[y] ?? 0;
                    }
                    for(let y = 0; y < u.ultra_talents.length; y++) {
                        u.ultra_talents[y].value = decoded.units[x].ultra_talents[y] ?? 0;
                    }
                    for(let y = 0; y < u.orb.length; y++) {
                        u.orb[y] = decoded.units[x].orb[y] ?? null;
                    }

                    const newRow = createRow(u);
                    newRow.querySelector(".hide-option")?.remove();
                    newRow.querySelector(".unit-icon")?.addEventListener("click", () => {
                        const form = parseInt(/** @type {HTMLDivElement} */ (newRow.querySelector(".row-image")).dataset.form ?? "0");
                        const chip = /** @type {HTMLDivElement} */ (document.querySelector(`#loadout-box .chip[data-id='${decoded.units[x].id}']`)); // need new selector because chips can be rearranged
                        chip.dataset.form = `${form}`;
                        /** @type {HTMLImageElement} */ (chip.querySelector(".unit-icon")).src = `./assets/img/unit_icon/${decoded.units[x].id}_${form}.png`;
                        idFormMap.set(decoded.units[x].id, form);
                    });
                    document.querySelector("#unit-data-box tbody")?.appendChild(newRow);
                    idFormMap.set(decoded.units[x].id, decoded.forms[x]);
                });
            }
        } catch(e) {
            console.error(e);
            REQUEST_TYPES.SEND_ALERT("Invalid loadout data!", true);
        }
    };
    
    const container = /** @type {HTMLDivElement} */ (document.querySelector("#loadout-box"));
    /** @type {HTMLButtonElement} */ (document.querySelector("#copy-loadout")).onclick = async () => {
        const unitRows = /** @type {HTMLTableRowElement[]} */ ([...document.querySelectorAll("#unit-data-box tbody tr")]);
        const output = {
            title: /** @type {HTMLInputElement} */ (container.querySelector(".loadout-name")).value.trim(),
            forms: /** @type {HTMLDivElement[]} */ ([...container.querySelectorAll(".chip.set-unit")]).map(c => parseInt(c.dataset.form ?? "0")),
            units: /** @type {import("./data/unit-data.js").UNIT_RECORD[]} */ ([]),
            baseLevels: /** @type {[number, number, number]} */ ([0, 0, 0])
        };
        
        output.baseLevels[0] = parseInt(/** @type {HTMLInputElement} */ (document.querySelector("#loadout-cannon input")).value);
        output.baseLevels[1] = parseInt(/** @type {HTMLInputElement} */ (document.querySelector("#loadout-style input")).value);
        output.baseLevels[2] = parseInt(/** @type {HTMLInputElement} */ (document.querySelector("#loadout-foundation input")).value);

        const unitData = unitRows.map(r => getValuesFromRow(r));
        unitData.forEach((d, i) => d.current_form = output.forms[i]);
        output.units = unitData;

        if(output.units.length > 0) {
            const link = encodeDirectLink(output);
            navigator.clipboard.writeText(link);
            REQUEST_TYPES.SEND_ALERT("Loadout data copied to clipboard!", false);
        } else {
            REQUEST_TYPES.SEND_ALERT("Loadout has no units!", true);
        }
    };
}

/**
 * Creates an input for a base part as part of a loadout.
 * @param {number} value The initial value of the base part. 
 * @param {number} cap The maximum value of the base part.
 * @param {number} type The index of the base part in settings.ototo
 * @returns {HTMLLabelElement} A label containing the input. 
 */
function createBaseLevelInput(value, cap, type) {
    const valueLabel = document.createElement("label");
    valueLabel.classList.add("h-align");
    valueLabel.dataset.inputType = `${type}`;

    const labelText = document.createElement("p");
    switch(type) {
        case 0:
            labelText.textContent = "Cannon Level:";
            break;
        case 1:
            labelText.textContent = "Style Level:";
            break;
        case 2:
            labelText.textContent = "Foundation Level:";
            break;
        default:
            labelText.textContent = "Undefined part of base";
            break;
    }
    
    const [labelInput, _inputElm] = createArrowNumberBox(cap, value, () => {});

    valueLabel.append(labelText, labelInput);
    return valueLabel;
}

/**
 * Loads loadouts onto the page.
 */
async function loadLoadouts() {
    const baseLeveling = document.querySelector("#base-box");
    const cannon = createBaseLevelInput(1, SETTINGS.ototo.cannon, 0);
    cannon.id = "loadout-cannon";
    const style = createBaseLevelInput(0, SETTINGS.ototo.style, 1);
    style.id = "loadout-style";
    const foundation = createBaseLevelInput(0, SETTINGS.ototo.base, 2);
    foundation.id = "loadout-foundation";
    baseLeveling?.append(cannon, style, foundation);

    const unlockedCannons = [];
    for(let x = 0; x < SETTINGS.ototo.names.length; x++) {
        unlockedCannons[x] = { cannon: true, style: true, foundation: true };
    }

    const datalist = createSearchDropdown();
    document.body.appendChild(datalist);
    initializeDataset(datalist, await REQUEST_TYPES.GET_NAMES(true));

    const emptyLoadout = createMinimalLoadout(null, unlockedCannons, syncLoadoutAndTable);
    document.querySelector("#loadout-box")?.appendChild(emptyLoadout);
}

/**
 * Configures the loadout to sync its values with the unit table also on the page, and vice versa.
 */
function syncLoadoutAndTable() {
    const loadoutUnits = /** @type {HTMLDivElement[]} */ ([...document.querySelectorAll("#loadout-box .chip.set-unit")]).map(c => {
        return { id: parseInt(c.dataset.id ?? "0"), form: parseInt(c.dataset.form ?? "0") };
    });

    if(loadoutUnits.length < idFormMap.size) {
        // Remove from table
        for(const unit of idFormMap.keys()) {
            if(!loadoutUnits.find(u => u.id === unit)) {
                idFormMap.delete(unit);
                /** @type {HTMLTableRowElement[]} */ ([...document.querySelectorAll("#unit-data-box .row-id")]).find(r => r.textContent === `${unit}`)?.parentElement?.remove();
            }
        }
    } else if(loadoutUnits.length > idFormMap.size) {
        // Add to table
        for(const unit of loadoutUnits) {
            if(!idFormMap.has(unit.id)) {
                idFormMap.set(unit.id, unit.form);
                
                REQUEST_TYPES.GET_ID_DATA(unit.id, true).then((/** @type {import("./data/unit-data.js").UNIT_DATA|null} */ u) => {
                    if(!u) {
                        console.error(`Missing unit data: ${unit.id}`);
                        return;
                    }

                    u.current_form = unit.form;
                    const newRow = createRow(u);
                    newRow.querySelector(".hide-option")?.remove();
                    newRow.querySelector(".unit-icon")?.addEventListener("click", () => {
                        const form = parseInt(/** @type {HTMLDivElement} */ (newRow.querySelector(".row-image")).dataset.form  ?? "0");
                        const chip = /** @type {HTMLDivElement} */ (document.querySelector(`#loadout-box .chip[data-id='${unit.id}']`));
                        chip.dataset.form = `${form}`;
                        /** @type {HTMLImageElement} */ (chip.querySelector(".unit-icon")).src = `./assets/img/unit_icon/${unit.id}_${form}.png`;
                        idFormMap.set(unit.id, form);
                    });
                    document.querySelector("#unit-data-box tbody")?.appendChild(newRow);
                });
            }
        }
    } else {
        // Change form of table unit
        for(const unit of loadoutUnits) {
            if(idFormMap.get(unit.id) !== unit.form) {
                const targetID = [...document.querySelectorAll("#unit-data-box .row-id")].find(r => r.textContent === `${unit.id}`);
                const targetRowIcon = /** @type {HTMLDivElement} */ (targetID?.parentElement?.querySelector(".row-image"));
                const targetRowImage = /** @type {HTMLImageElement} */ (targetRowIcon.querySelector(".unit-icon"));

                const start = parseInt(targetRowIcon.dataset.form ?? "0"); // to prevent infinite loops in case of poorly formatted codes
                do {
                    targetRowImage.click();
                } while(parseInt(targetRowIcon.dataset.form ?? "0") !== unit.form && parseInt(targetRowIcon.dataset.form ?? "0") !== start);

                idFormMap.set(unit.id, parseInt(targetRowIcon.dataset.form ?? "0"));
            }
        }
    }
}