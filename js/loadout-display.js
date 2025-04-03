import createArrowNumberBox from "./cat-base/arrow-box.js";
import { getValuesFromRow } from "./helper/link-row.js";
import { createSearchDropdown, initializeDataset } from "./helper/make-searchable.js";
import { decodeLink, encodeDirectLink } from "./helper/encoder.js";
import { createMinimalLoadout } from "./unit-table/creation/create-loadout-table.js";
import createRow from "./unit-table/creation/create-unit-row.js";
import createSearchableTable from "./unit-table/creation/create-unit-table.js";
import createOrbMenu from "./unit-table/orb/create-orb-selector.js";
import { initializeOrbSelection } from "./unit-table/orb/orb-selection.js";

let idFormMap = new Map();

document.addEventListener("DOMContentLoaded", () => {
    initializeContent();

    window.addEventListener("portLoaded", loadLoadouts);
    if(checkPort()) {
        window.dispatchEvent("portLoaded");
    }
});

function initializeContent() {
    document.body.appendChild(createOrbMenu());
    initializeOrbSelection();

    const table = createSearchableTable("Loadout", []);
    table.querySelector("h2").remove();
    document.querySelector("#unit-data-box").appendChild(table);

    const clearButton = document.querySelector("#reset-loadout");
    clearButton.onclick = () => {
        idFormMap.clear();
        document.querySelector("#unit-data-box tbody").replaceChildren();
        document.querySelectorAll("#loadout-box .chip.set-unit").forEach(c => {
            c.classList.remove("set-unit");
            delete c.dataset.form;
            delete c.dataset.maxForm;
            delete c.dataset.id;

            c.querySelector(".unit-icon").src = "./assets/img/empty_unit.png";
            const unitID = c.querySelector(".unit-id");
            unitID.classList.add("hidden");
            unitID.textContent = "";
            c.querySelector(".remove-unit").classList.add("hidden");
            c.querySelector(".unset-search").classList.remove("hidden");
        });
    };
    const codeEnterButton = document.querySelector("#import-loadout");
    const shareCodeInput = document.querySelector("#code-input");
    shareCodeInput.addEventListener("keyup", ev => {
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

            document.querySelector("#loadout-box .loadout-name").value = decoded.title;
            document.querySelector("#loadout-cannon input").value = decoded.baseLevels[0];
            document.querySelector("#loadout-style input").value = decoded.baseLevels[1];
            document.querySelector("#loadout-foundation input").value = decoded.baseLevels[2];
            const cannon = document.querySelector("#loadout-box .base-cannon");
            cannon.dataset.type = decoded.base[0];
            cannon.src = `./assets/img/foundation/base_${decoded.base[0]}.png`;
            const style = document.querySelector("#loadout-box .base-style");
            style.dataset.type = decoded.base[1];
            style.src = `./assets/img/foundation/base_${decoded.base[1]}_style.png`;
            const foundation = document.querySelector("#loadout-box .base-foundation");
            foundation.dataset.type = decoded.base[2];
            foundation.src = `./assets/img/foundation/base_${decoded.base[2]}_foundation.png`;

            const chips = [...document.querySelectorAll("#loadout-box .chip")];
            for(let x = 0; x < decoded.units.length && x < chips.length; x++) {
                makeRequest(REQUEST_TYPES.GET_ID_DATA, decoded.units[x].id, true).then(u => {
                    chips[x].classList.add("set-unit");
                    chips[x].querySelector(".unit-icon").src = `./assets/img/unit_icon/${decoded.units[x].id}_${decoded.forms[x]}.png`;
                    chips[x].dataset.form = decoded.forms[x];
                    chips[x].dataset.id = decoded.units[x].id;
                    chips[x].dataset.maxForm = u.max_form;
    
                    const unitID = chips[x].querySelector(".unit-id");
                    unitID.classList.remove("hidden");
                    unitID.textContent = decoded.units[x].id;
                    chips[x].querySelector(".remove-unit").classList.remove("hidden");
                    chips[x].querySelector(".unset-search").classList.add("hidden");

                    u.current_form = decoded.forms[x];
                    u.level = decoded.units[x].level;
                    u.plus_level = decoded.units[x].plus_level;
                    for(let y = 0; y < u.talents.length; y++) {
                        u.talents[y] = decoded.units[x].talents[y];
                    }
                    for(let y = 0; y < u.ultra_talents.length; y++) {
                        u.ultra_talents[y] = decoded.units[x].ultra_talents[y];
                    }
                    u.orb = decoded.units[x].orb;
                    const newRow = createRow(u);
                    newRow.querySelector(".hide-option").remove();
                    newRow.querySelector(".unit-icon").addEventListener("click", () => {
                        const form = parseInt(newRow.querySelector(".row-image").dataset.form);
                        const chip = document.querySelector(`#loadout-box .chip[data-id='${decoded.units[x].id}']`); // need new selector because chips can be rearranged
                        chip.dataset.form = form;
                        chip.querySelector(".unit-icon").src = `./assets/img/unit_icon/${decoded.units[x].id}_${form}.png`;
                        idFormMap.set(decoded.units[x].id, form);
                    });
                    document.querySelector("#unit-data-box tbody").appendChild(newRow);
                    idFormMap.set(decoded.units[x].id, decoded.forms[x]);
                });
            }
        } catch(e) {
            console.error(e);
            makeRequest(REQUEST_TYPES.SEND_ALERT, { message: "Invalid loadout data!", isError: true });
        }
    };
    
    const container = document.querySelector("#loadout-box");
    document.querySelector("#copy-loadout").onclick = async () => {
        const unitData = [...document.querySelectorAll("#unit-data-box tbody tr")];
        const output = {
            title: container.querySelector(".loadout-name").value.trim(),
            units: [...container.querySelectorAll(".chip.set-unit")].map(c => parseInt(c.dataset.id)),
            forms: [...container.querySelectorAll(".chip.set-unit")].map(c => parseInt(c.dataset.form)),
            base: [parseInt(container.querySelector(".base-cannon").dataset.type),
                parseInt(container.querySelector(".base-style").dataset.type),
                parseInt(container.querySelector(".base-foundation").dataset.type)]
        };
        
        output.baseLevels = [];
        output.baseLevels[0] = document.querySelector("#loadout-cannon input").value;
        output.baseLevels[1] = document.querySelector("#loadout-style input").value;
        output.baseLevels[2] = document.querySelector("#loadout-foundation input").value;

        const lockData = await makeRequest(REQUEST_TYPES.GET_MULTIPLE_DATA, output.units);
        output.units = output.units.map((id, i) => {
            const row = unitData.find(u => u.querySelector(".row-id").textContent === `${id}`);
            const values = getValuesFromRow(row);

            lockData[i].talents.map((t, idx) => {
                t.value = values.talents[idx];
                return t;
            });
            lockData[i].ultra_talents.map((t, idx) => {
                t.value = values.ultra_talents[idx];
                return t;
            });
            return {
                id: id,
                current_form: values.current_form,
                level: values.level,
                plus_level: values.plus_level,
                orb: values.orb,
                talents: lockData[i].talents,
                ultra_talents: lockData[i].ultra_talents
            };
        });
        
        const link = encodeDirectLink(output);
        navigator.clipboard.writeText(link);
        makeRequest(REQUEST_TYPES.SEND_ALERT, { message: "Loadout data copied to clipboard!", isError: false });
    };
}

function createBaseLevelInput(value, cap, type) {
    const valueLabel = document.createElement("label");
    valueLabel.classList.add("h-align");
    valueLabel.dataset.inputType = type;

    const labelText = document.createElement("p");
    switch(type) {
        case 0:
            labelText.textContent = "Cannon";
            break;
        case 1:
            labelText.textContent = "Style";
            break;
        case 2:
            labelText.textContent = "Foundation";
            break;
        default:
            labelText.textContent = "Undefined part of base";
            break;
    }
    
    const [labelInput, inputElm] = createArrowNumberBox(cap, value, () => {});

    valueLabel.append(labelText, labelInput);
    return valueLabel;
}

async function loadLoadouts() {
    const settings = await makeRequest(REQUEST_TYPES.GET_SETTINGS, null).then(r => r);

    const baseLeveling = document.querySelector("#base-box");
    const cannon = createBaseLevelInput(settings.ototo.cannon, settings.ototo.cannon, 0);
    cannon.id = "loadout-cannon";
    const style = createBaseLevelInput(settings.ototo.style, settings.ototo.style, 1);
    style.id = "loadout-style";
    const foundation = createBaseLevelInput(settings.ototo.base, settings.ototo.base, 2);
    foundation.id = "loadout-foundation";
    baseLeveling.append(cannon, style, foundation);

    const unlockedCannons = [];
    for(let x = 0; x < settings.ototo.names.length; x++) {
        unlockedCannons[x] = { cannon: true, style: true, foundation: true };
    }

    const datalist = createSearchDropdown();
    document.body.appendChild(datalist);
    initializeDataset(datalist, true);

    const emptyLoadout = createMinimalLoadout(null, unlockedCannons, syncLoadoutAndTable);
    document.querySelector("#loadout-box").appendChild(emptyLoadout);
}

function syncLoadoutAndTable() {
    const loadoutUnits = [...document.querySelector("#loadout-box").querySelectorAll(".chip.set-unit")].map(c => {
        return { id: parseInt(c.dataset.id), form: parseInt(c.dataset.form) };
    });

    if(loadoutUnits.length < idFormMap.size) {
        // Remove from table
        for(const unit of idFormMap.keys()) {
            if(!loadoutUnits.find(u => u.id === unit)) {
                idFormMap.delete(unit);
                [...document.querySelectorAll("#unit-data-box .row-id")].find(r => r.textContent === `${unit}`).parentElement.remove();
            }
        }
    } else if(loadoutUnits.length > idFormMap.size) {
        // Add to table
        for(const unit of loadoutUnits) {
            if(!idFormMap.has(unit.id)) {
                idFormMap.set(unit.id, unit.form);
                makeRequest(REQUEST_TYPES.GET_ID_DATA, unit.id, true).then(u => {
                    u.current_form = unit.form;
                    const newRow = createRow(u);
                    newRow.querySelector(".hide-option").remove();
                    newRow.querySelector(".unit-icon").addEventListener("click", () => {
                        const form = parseInt(newRow.querySelector(".row-image").dataset.form);
                        const chip = document.querySelector(`#loadout-box .chip[data-id='${unit.id}']`);
                        chip.dataset.form = form;
                        chip.querySelector(".unit-icon").src = `./assets/img/unit_icon/${unit.id}_${form}.png`;
                        idFormMap.set(unit.id, form);
                    });
                    document.querySelector("#unit-data-box tbody").appendChild(newRow);
                });
            }
        }
    } else {
        // Change form of table unit
        for(const unit of loadoutUnits) {
            if(idFormMap.get(unit.id) !== unit.form) {
                const targetID = [...document.querySelectorAll("#unit-data-box .row-id")].find(r => r.textContent === `${unit.id}`);
                const targetRowIcon = targetID.parentElement.querySelector(".row-image");
                const targetRowImage = targetRowIcon.querySelector(".unit-icon");

                const start = parseInt(targetRowIcon.dataset.form); // to prevent infinite loops in case of poorly formatted codes
                do {
                    targetRowImage.click();
                } while(parseInt(targetRowIcon.dataset.form) !== unit.form && parseInt(targetRowIcon.dataset.form) !== start);

                idFormMap.set(unit.id, parseInt(targetRowIcon.dataset.form));
            }
        }
    }
}