//@ts-check

import SETTINGS from "../../../assets/settings.js";
import { dataToRecord } from "../../data/unit-data.js";
import * as StatCalculator from "../../helper/calculate-stats.js";
import { getValuesFromRow, observeRowChange, unobserveRowChange } from "../../helper/link-row.js";

/**
 * Creates a stat display tr that syncs with the unit's modifiable attributes and the user's cat base.
 * @param {import("../../data/unit-data").UNIT_DATA} unitData The unit's data, including their stats.
 * @param {HTMLTableRowElement} mainRow The unit row that this stat row is associated with.
 * @returns {{ row: HTMLTableRowElement, callback: () => void }} A table row that displays the units stats and allows performing calculations on them that update based on the unit's modifiable attributes, as well as a clean up callback that should be called before removing the element.
 */
export default function createStatRow(unitData, mainRow) {
    const statRow = document.createElement("tr");
    statRow.classList.add("stat-mod-row");

    const rowBox = document.createElement("td");
    rowBox.colSpan = 10000;

    const statTable = document.createElement("div");
    statTable.classList.add("unit-stat-table");
    
    const recordClone = dataToRecord(unitData);

    const { statBox: costStat, onUpdate: updateCost } = createSmartStatBox("Cost", StatCalculator.calculateCost(unitData.stats[unitData.current_form].cost, recordClone, unitData), "¢");
    const { statBox: healthStat, onUpdate: updateHealth } = createSmartStatBox("Health", StatCalculator.calculateHealth(unitData.stats[unitData.current_form].health, recordClone, unitData));
    const { statBox: damageStat, onUpdate: updateDamage } = createSmartStatBox("Damage", StatCalculator.calculateDamage(unitData.stats[unitData.current_form].damage, recordClone, unitData));
    const { statBox: knockbackStat, onUpdate: updateKnockbacks } = createSmartStatBox("Knockbacks", StatCalculator.calculateKnockbacks(unitData.stats[unitData.current_form].knockbacks, recordClone, unitData));
    const { statBox: rechargeStat, onUpdate: updateRecharge } = createSmartStatBox("Recharge", StatCalculator.calculateRechargeTime(unitData.stats[unitData.current_form].cooldown, recordClone, unitData), " sec");
    const { statBox: rangeStat, onUpdate: updateRange } = createSmartStatBox("Range", StatCalculator.calculateRange(unitData.stats[unitData.current_form].range, recordClone, unitData));
    const { statBox: speedStat, onUpdate: updateSpeed } = createSmartStatBox("Speed", StatCalculator.calculateSpeed(unitData.stats[unitData.current_form].speed, recordClone, unitData));

    const doubleBox = document.createElement("div");
    doubleBox.classList.add("double-stat-box");
    doubleBox.append(rangeStat, speedStat);

    const { iconBox: traitBox, onUpdate: updateTraits } = createIconMultiBox("Target Traits:", unitData.stats.map(s => s.traits.map(t => { return { imagePath: `./assets/img/ability/Target_${t}.png`, label: t }})), unitData.current_form);
    traitBox.classList.add("unit-stat-traits");

    const { iconBox: abilities, onUpdate: updateAbilities } = createIconMultiBox("Abilities:", unitData.stats.map(s => s.abilities.filter(a => !SETTINGS.targettingAbilities.includes(a)).map(a => { return { imagePath: `./assets/img/ability/${a}.png`, label: a.replaceAll("_", " ") }})), unitData.current_form);
    abilities.classList.add("unit-stat-abilities");

    const { targetBox: targetting, onUpdate: updateTargetting } = createTargetting(unitData.stats.map(s => {
        const output = [];
        output.push({ imagePath: `./assets/img/ability/${s.has_area ? "Area" : "Single"}_Attack.png`, label: `${s.has_area ? "Area" : "Single"} Attack` });

        s.abilities.filter(a => SETTINGS.targettingAbilities.includes(a)).forEach(a => output.push({ imagePath: `./assets/img/ability/${a}.png`, label: a.replaceAll("_", "") }));

        return output;
    }), unitData.current_form);

    const calculator = document.createElement("div");
    calculator.classList.add("unit-stat-options");

    statTable.append(costStat, traitBox, targetting, healthStat, damageStat, abilities, calculator, knockbackStat, rechargeStat, doubleBox);
    rowBox.appendChild(statTable);

    statRow.appendChild(rowBox);

    const updateFuncCombined = async () => {
        const updatedRow = getValuesFromRow(mainRow);

        // TODO: Replace with actual options
        const calculatorOptions = StatCalculator.DEFAULT_CALCULATOR_OPTIONS;

        updateCost(StatCalculator.calculateCost(unitData.stats[updatedRow.current_form].cost, updatedRow, unitData, calculatorOptions));
        updateHealth(StatCalculator.calculateHealth(unitData.stats[updatedRow.current_form].health, updatedRow, unitData, calculatorOptions));
        updateDamage(StatCalculator.calculateDamage(unitData.stats[updatedRow.current_form].damage, updatedRow, unitData, calculatorOptions));
        updateKnockbacks(StatCalculator.calculateKnockbacks(unitData.stats[updatedRow.current_form].knockbacks, updatedRow, unitData, calculatorOptions));
        updateRecharge(StatCalculator.calculateRechargeTime(unitData.stats[updatedRow.current_form].cooldown, updatedRow, unitData, calculatorOptions));
        updateRange(StatCalculator.calculateRange(unitData.stats[updatedRow.current_form].range, updatedRow, unitData, calculatorOptions));
        updateSpeed(StatCalculator.calculateSpeed(unitData.stats[updatedRow.current_form].speed, updatedRow, unitData, calculatorOptions));

        updateTraits(updatedRow.current_form);
        updateAbilities(updatedRow.current_form);
        updateTargetting(updatedRow.current_form);
    };

    observeRowChange(mainRow, updateFuncCombined);
    const callback = () => unobserveRowChange(mainRow, updateFuncCombined);

    return { row: statRow, callback: callback };
}

/**
 * Creates a single simple stat boxes for a calculable stat.
 * @param {string} statName The name of the stat in the box.
 * @param {number} calcValue The calculated initial value for the stat box.
 * @param {string} unit The units to use for the stat.
 * @returns {{ statBox: HTMLElement, onUpdate: (calcValue: number) => void }} Returns both the created stat box and a function to update it's displayed stat.
 */
function createSmartStatBox(statName, calcValue, unit = "") {
    const output = document.createElement("span");
    output.classList.add("unit-stat-calc-cell");

    const cellLabel = document.createElement("h6");
    cellLabel.classList.add("cell-manip-label");
    cellLabel.textContent = statName + ":";

    const cellContent = document.createElement("h6");
    cellContent.classList.add("cell-manip-value");
    cellContent.textContent = formatStatNum(calcValue) + unit;

    output.append(cellLabel, cellContent);

    const onUpdate = (/** @type {number} */ calcValue) => { cellContent.textContent = formatStatNum(calcValue) + unit };
    return { statBox: output, onUpdate: onUpdate };
}

/**
 * Creates a box containing multiple centered and evenly spaced icons.
 * @param {string} label The name of the icon box.
 * @param {{ imagePath: string, label: string }[][]} iconInfo The icons to be added for each form.
 * @param {number} currentForm The initial form to use.
 * @returns {{ iconBox: HTMLElement, onUpdate: (form: number) => void }} Returns both the created icon box and a function to update it's displayed icons.
 */
function createIconMultiBox(label, iconInfo, currentForm) {
    const output = document.createElement("div");
    output.classList.add("unit-stat-multi-icon-wrapper");

    const labelElm = document.createElement("h6");
    labelElm.textContent = label;

    const iconWrapper = document.createElement("div");
    iconWrapper.classList.add("unit-stat-icon-box");
    appendIcons(iconWrapper, iconInfo[currentForm]);

    output.append(labelElm, iconWrapper);
    const onUpdate = (/** @type {number} */ form) => {
        iconWrapper.innerHTML = "";
        appendIcons(iconWrapper, iconInfo[form]);
    };

    return { iconBox: output, onUpdate: onUpdate };
}

/**
 * Helper function that appends icons to a div.
 * @param {HTMLDivElement} wrapper The container that icons are appended to.
 * @param {{ imagePath: string, label: string }[]} iconDataList A list of the icons that should be added to the wrapper.
 */
function appendIcons(wrapper, iconDataList) {
    if(iconDataList.length === 0) {
        const emptyText = document.createElement("p");
        emptyText.textContent = "None";
        wrapper.appendChild(emptyText);
    } else {
        for(const icon of iconDataList) {
            const subIcon = document.createElement("img");
            subIcon.classList.add("unit-stat-power-icon");
            subIcon.src = icon.imagePath;
            subIcon.title = icon.label;
            wrapper.appendChild(subIcon);
        }
    }
}

/**
 * Creates a box containing targetting icons.
 * @param {{ imagePath: string, label: string }[][]} targetTypes the targetting for each form.
 * @param {number} currentForm The initial form to use.
 * @returns {{ targetBox: HTMLElement, onUpdate: (form: number) => void }} Returns both the created targetting types box and a function to update it's displayed icons.
 */
function createTargetting(targetTypes, currentForm) {
    const output = document.createElement("div");
    output.classList.add("unit-stat-targetting");
    output.classList.add("double-stat-box");

    const labelWrapper = document.createElement("div");
    labelWrapper.classList.add("v-align");

    const targetLabel = document.createElement("h6");
    targetLabel.textContent = "Targetting:";
    labelWrapper.appendChild(targetLabel);

    const targetIconBox = document.createElement("div");
    targetIconBox.classList.add("unit-stat-icon-box");

    appendIcons(targetIconBox, targetTypes[currentForm]);
    const onUpdate = (/** @type {number} */ form) => {
        targetIconBox.innerHTML = "";
        appendIcons(targetIconBox, targetTypes[form]);
    };

    output.append(labelWrapper, targetIconBox);
    return { targetBox: output, onUpdate: onUpdate };
}

/**
 * Rounds a number to the nearest 0.01 and converts it to a locale-appropriate string.
 * @param {number} val The value to round.
 * @returns {string} The value rounded to the nearest 0.01 and converted to a string.
 */
function formatStatNum(val) {
  const rounded = Math.round(val * 100) / 100;
  return parseFloat(rounded.toFixed(2)).toLocaleString();
}