// @ts-check

import SETTINGS from "../../../assets/settings.js";
import { REQUEST_TYPES } from "../../communication/iframe-link.js";
import UnitData from "../../data/unit-data.js";
import { calculateCost, calculateDamage, calculateHealth, calculateKnockbacks, calculateRange, calculateRechargeTime, calculateSpeed, CALCULATOR_LEVEL_OPTIONS } from "../../helper/calculate-stats.js";

const rarityMap = { N: "Normal", EX: "Special", RR: "Rare", SR: "Super Rare", UR: "Uber Rare", LR: "Legend Rare" };
/**
 * Creates a modal that allows for more precise unit searching.
 * @returns {HTMLDivElement} The search modal.
 */
export default function createSearchModal() {
    const output = document.createElement("div");
    output.id = "advanced-search-modal-wrapper";

    const content = document.createElement("div");
    content.id = "advanced-search-modal";

    const searchOptions = document.createElement("div");
    searchOptions.id = "advanced-search-options";

    const optionLabel = document.createElement("h2");
    optionLabel.id = "advanced-search-label";
    optionLabel.textContent = "Advanced Search";

    const { obj: nameInput, filterCallback: filterName } = createNameFilterInput();
    const { obj: ownedCheckbox, filterCallback: filterOwnedOnly } = createOwnedFilterInput();
    const {obj: raritySelection, filterCallback: filterRarity } = createRarityFilterInput();
    const { obj: traitSelection, filterCallback: filterTargetTraits } = createTargetTraitFilterInput();
    const { obj: abilityMultibox, filterCallback: filterAbilities } = createAbilityFilterInput();
    // @ts-ignore
    const { obj: statMultiRange, filterCallback: filterStatRange } = createStatFilterInput(ownedCheckbox.querySelector("input"));
    const { obj: randomToggle, filterCallback: filterRandom10 } = createRandom10FilterInput();

    const searchButton = document.createElement("button");
    searchButton.id = "advanced-search-enter";
    searchButton.innerHTML = `
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 2a8 8 0 105.29 14.29l5.21 5.21 1.5-1.5-5.21-5.21A8 8 0 0010 2zm0 2a6 6 0 110 12 6 6 0 010-12z"/>
    </svg>`;
    searchButton.onclick = () => applySearch((/** @type {import("../../data/unit-data.js").UNIT_DATA} */ u) => {
        const isOwned = filterOwnedOnly(u);
        const isRarity = filterRarity(u);
        const formNames = filterName(u);
        const formTraits = filterTargetTraits(u);
        const formAbilities = filterAbilities(u);
        const formStats = filterStatRange(u);

        return [...new Array(u.max_form + 1).keys()].filter(i => isOwned && isRarity && formNames.includes(i) && formTraits.includes(i) && formAbilities.includes(i) && formStats.includes(i));
    }, filterRandom10);

    const searchButtonText = document.createElement("p");
    searchButtonText.textContent = "Search";
    searchButton.prepend(searchButtonText);

    const nameSearchAlign = document.createElement("div");
    nameSearchAlign.id = "advanced-search-name-align";

    nameSearchAlign.append(nameInput, ownedCheckbox, searchButton);

    const otherWrapper = document.createElement("div");
    otherWrapper.classList.add("advanced-wrapper");

    const wrapperLabel = document.createElement("h4");
    wrapperLabel.textContent = "Other";

    const wrapperContents = document.createElement("div");
    wrapperContents.id = "advanced-other-spacer";

    wrapperContents.appendChild(randomToggle);
    otherWrapper.append(wrapperLabel, wrapperContents);
    searchOptions.append(optionLabel, nameSearchAlign, raritySelection, traitSelection, abilityMultibox, statMultiRange, otherWrapper);

    const results = createResults();

    content.append(searchOptions, results);
    output.appendChild(content);
    return output;
}

/**
 * Creates a search filter element.
 * @returns {{obj: HTMLElement, filterCallback: (u: import("../../data/unit-data.js").UNIT_DATA) => number[] }} An object containing the created input, and a function which determines which forms of a unit meet the filter.
*/
function createNameFilterInput() {
    const output = {};

    output.obj = document.createElement("input");
    output.obj.id = "advanced-name-filter";
    output.obj.type = "text";
    output.obj.maxLength = 60;
    output.obj.placeholder = "Search for ID/Name...";

    output.filterCallback = (/** @type {import("../../data/unit-data.js").UNIT_DATA} */ u) => {
        const unitNames = [u.normal_form, u.evolved_form, u.true_form, u.ultra_form];
        return [...new Array(u.max_form + 1).keys()].filter(i => unitNames[i]?.toLowerCase().includes(output.obj.value.trim().toLowerCase()) ?? false);
    }

    return output;
}

/**
 * Creates a search filter element.
 * @returns {{obj: HTMLElement, filterCallback: (u: import("../../data/unit-data.js").UNIT_DATA) => boolean }} An object containing the created input, and a function which determines if the unit is owned.
 */
function createOwnedFilterInput() {
    const output = {};

    const input = document.createElement("input");
    input.id = "advanced-owned-filter";
    input.type = "checkbox";
    input.checked = true;

    const label = document.createElement("label");
    label.textContent = "Only Show Owned";
    label.title = "Search results will only include units and upgrades currently unlocked"
    label.htmlFor = "advanced-owned-filter";

    output.obj = document.createElement("div");
    output.obj.id = "advanced-owned-wrapper";
    output.obj.classList.add("advaced-label-spacer");
    output.obj.append(label, input);

    output.filterCallback = (/** @type {import("../../data/unit-data.js").UNIT_DATA} */ u) => !input.checked || u.level > 0;

    return output;
}

/**
 * Creates a search filter element.
 * @returns {{obj: HTMLElement, filterCallback: (u: import("../../data/unit-data.js").UNIT_DATA) => boolean }} An object containing the created input, and a function which determines if the unit is one of the selected rarities.
 */
function createRarityFilterInput() {
    const output = {};

    const wrapper = document.createElement("div");
    wrapper.classList.add("advanced-wrapper");

    const wrapperLabel = document.createElement("h4");
    wrapperLabel.textContent = "Rarity";

    const wrapperContent = document.createElement("div");
    wrapperContent.id = "advanced-rarity-spacer";

    for(const rarity of ["Normal", "Special", "Rare", "Super Rare", "Uber Rare", "Legend Rare"]) {
        const btn = document.createElement("button");
        btn.classList.add("advanced-rarity-selector", "inactive");
        btn.classList.add(`${rarity.toLowerCase().replaceAll(" ", "-")}-color`);
        if(rarity === "Legend Rare") {
            btn.classList.add("legend-rare-animation");
        }
        btn.textContent = rarity;

        btn.onclick = () => btn.classList.toggle("inactive");
        wrapperContent.appendChild(btn);
    }

    wrapper.append(wrapperLabel, wrapperContent);
    output.obj = wrapper;

    output.filterCallback = (/** @type {import("../../data/unit-data.js").UNIT_DATA} */ u) => {
        const rarities = [...wrapperContent.querySelectorAll(".advanced-rarity-selector")];
        return rarities.every(r => r.classList.contains("inactive")) ||
            rarities.some(b => b.textContent === rarityMap[u.rarity]);
    };

    return output;
}

/**
 * Creates a search filter element.
 * @returns {{obj: HTMLElement, filterCallback: (u: import("../../data/unit-data.js").UNIT_DATA) => number[] }} An object containing the created input, and a function which determines which forms of a unit meet the filter.
 */
function createTargetTraitFilterInput() {
    const output = {};

    const wrapper = document.createElement("div");
    wrapper.classList.add("advanced-wrapper");

    const wrapperLabel = document.createElement("h4");
    wrapperLabel.textContent = "Target Traits";

    const wrapperContent = document.createElement("div");
    wrapperContent.id = "advanced-trait-spacer";

    for(const trait of SETTINGS.traits) {
        const btnWrapper = document.createElement("div");
        btnWrapper.classList.add("advanced-trait-selector-wrapper", "inactive");
        btnWrapper.dataset.trait = trait;

        const btn = document.createElement("img");
        btn.classList.add("advanced-trait-selector");
        btn.src = `./assets/img/ability/Target_${trait}.png`;
        btn.title = trait;

        const btnSlash = document.createElement("span");
        btnSlash.innerHTML = `
        <svg viewBox="0 0 100 100">
            <line x1="0" y1="100" x2="100" y2="0" />
        </svg>`;

        btnWrapper.onclick = () => btnWrapper.classList.toggle("inactive");
        btnWrapper.append(btn, btnSlash);
        wrapperContent.appendChild(btnWrapper);
    }

    wrapper.append(wrapperLabel, wrapperContent);
    output.obj = wrapper;

    output.filterCallback = (/** @type {import("../../data/unit-data.js").UNIT_DATA} */ u) => [...new Array(u.max_form + 1).keys()].filter(form => 
        /** @type {HTMLDivElement[]} */ ([...wrapperContent.querySelectorAll(".advanced-trait-selector-wrapper")])
                .every(w => w.classList.contains("inactive") || u.stats[form].traits.includes(w.dataset.trait ?? "")));

    return output;
}

/**
 * Creates a search filter element.
 * @returns {{obj: HTMLElement, filterCallback: (u: import("../../data/unit-data.js").UNIT_DATA) => number[] }} An object containing the created input, and a function which determines which forms of a unit meet the filter.
 */
function createAbilityFilterInput() {
    const output = {};

    const wrapper = document.createElement("div");
    wrapper.classList.add("advanced-wrapper");

    const wrapperLabel = document.createElement("h4");
    wrapperLabel.textContent = "Abilities";

    const wrapperContent = document.createElement("div");
    wrapperContent.id = "advanced-ability-spacer";

    for(const group of SETTINGS.abilityGroupings) {
        const groupWrapper = document.createElement("div");
        groupWrapper.classList.add("advanced-ability-group");

        for(const ability of group) {
            const btn = document.createElement("img");
            btn.src = `./assets/img/ability/${ability}.png`;
            btn.dataset.ability = ability;
            btn.classList.add("advanced-ability-selector", "inactive");
            btn.title = ability.replaceAll("_", " ");

            btn.onclick = () => btn.classList.toggle("inactive");
            groupWrapper.appendChild(btn);
        }

        wrapperContent.appendChild(groupWrapper);
    }

    wrapper.append(wrapperLabel, wrapperContent);
    output.obj = wrapper;

    output.filterCallback = (/** @type {import("../../data/unit-data.js").UNIT_DATA} */ u) => [...new Array(u.max_form + 1).keys()].filter(form =>
        /** @type {HTMLDivElement[]} */ ([...wrapperContent.querySelectorAll(".advanced-ability-selector")])
            .every(w => w.classList.contains("inactive") || UnitData.hasAbility(u, w.dataset.ability ?? "", form)));
        
    return output;
}

/**
 * Creates a search filter element.
 * @param {HTMLInputElement} ownedCheckbox The checkbox that determines if all unit upgrades should be considered.
 * @returns {{obj: HTMLElement, filterCallback: (u: import("../../data/unit-data.js").UNIT_DATA) => number[] }} An object containing the created input, and a function which determines which forms of a unit meet the filter.
 */
function createStatFilterInput(ownedCheckbox) {
    const output = {};

    const wrapper = document.createElement("div");
    wrapper.classList.add("advanced-wrapper");

    const wrapperLabel = document.createElement("h4");
    wrapperLabel.textContent = "Stats";

    const useTraitsWrapper = document.createElement("div");
    useTraitsWrapper.classList.add("advaced-label-spacer");
    useTraitsWrapper.title = "Calculate damage as if unit is hitting their target traits";

    const useTraits = document.createElement("input");
    useTraits.type = "checkbox";
    useTraits.checked = true;
    useTraits.id = "advanced-use-traits";

    const useTraitsLabel = document.createElement("label");
    useTraitsLabel.textContent = "Traited Damage";

    useTraitsWrapper.append(useTraitsLabel, useTraits);

    const unitLevelSimWrapper = document.createElement("div");
    unitLevelSimWrapper.id = "advanced-level-box";
    unitLevelSimWrapper.classList.add("advaced-label-spacer");

    const unitLevelSimLabel = document.createElement("label");
    unitLevelSimLabel.textContent = "Set Level:";
    unitLevelSimLabel.id = "advanced-level-sim-label";
    unitLevelSimWrapper.appendChild(unitLevelSimLabel);

    const levelMap = [[CALCULATOR_LEVEL_OPTIONS.LEVEL_CURRENT, "Current"], [CALCULATOR_LEVEL_OPTIONS.LEVEL_1, "1"], [CALCULATOR_LEVEL_OPTIONS.LEVEL_30, "30"], [CALCULATOR_LEVEL_OPTIONS.LEVEL_50, "50"], [CALCULATOR_LEVEL_OPTIONS.LEVEL_MAX, "Max"]];
    for(const [data, str] of levelMap) {
        const btn = document.createElement("button");
        btn.classList.add("advanced-level-option");
        btn.classList.toggle("inactive", data !== CALCULATOR_LEVEL_OPTIONS.LEVEL_CURRENT);
        btn.textContent = `${str}`;
        btn.dataset.levelType = `${data}`;
        btn.onclick = () => {
            unitLevelSimWrapper.querySelectorAll(".advanced-level-option").forEach(b => b.classList.add("inactive"));
            btn.classList.remove("inactive");
        }

        unitLevelSimWrapper.appendChild(btn);
    }

    const wrapperContent = document.createElement("div");
    wrapperContent.id = "advanced-stats-spacer";

    const { obj: stat1, filterCallback: statCallback1 } = createSingleStatFilterInput("cost", "Cost", calculateCost, ownedCheckbox, useTraits);
    const { obj: stat2, filterCallback: statCallback2 } = createSingleStatFilterInput("health", "Health", calculateHealth, ownedCheckbox, useTraits);
    const { obj: stat3, filterCallback: statCallback3 } = createSingleStatFilterInput("damage", "Damage", calculateDamage, ownedCheckbox, useTraits);
    const { obj: stat4, filterCallback: statCallback4 } = createSingleStatFilterInput("knockbacks", "Knockbacks", calculateKnockbacks, ownedCheckbox, useTraits);
    const { obj: stat5, filterCallback: statCallback5 } = createSingleStatFilterInput("cooldown", "Recharge Time", calculateRechargeTime, ownedCheckbox, useTraits);
    const { obj: stat6, filterCallback: statCallback6 } = createSingleStatFilterInput("range", "Range", calculateRange, ownedCheckbox, useTraits);
    const { obj: stat7, filterCallback: statCallback7 } = createSingleStatFilterInput("speed", "Speed", calculateSpeed, ownedCheckbox, useTraits);

    wrapperContent.append(useTraitsWrapper, unitLevelSimWrapper, stat1, stat2, stat3, stat4, stat5, stat6, stat7);
    wrapper.append(wrapperLabel, wrapperContent);
    output.obj = wrapper;

    output.filterCallback = (/** @type {import("../../data/unit-data.js").UNIT_DATA} */ u) => {
        const formCosts = statCallback1(u);
        const formHP = statCallback2(u);
        const formATK = statCallback3(u);
        const formKBs = statCallback4(u);
        const formCD = statCallback5(u);
        const formRange = statCallback6(u);
        const formSPD = statCallback7(u);

        return [...new Array(u.max_form + 1).keys()]
            .filter(f => formCosts.includes(f) && formHP.includes(f) && formATK.includes(f) && formKBs.includes(f) && formCD.includes(f) && formRange.includes(f) && formSPD.includes(f));
    }

    return output;
}

/**
 * Creates a stat filter input for a single stat.
 * @param {string} statName The name of the stat.
 * @param {string} displayName The name to display for the stat.
 * @param {(initialValue: number, updatedData: import("../../data/unit-data.js").UNIT_RECORD, fixedData: import("../../data/unit-data.js").UNIT_DATA, calculatorOptions: import("../../helper/calculate-stats.js").CALCULATOR_OPTIONS) => number} statCallback A function which, given the unit's base stats and properties, calculates the unit's damage.
 * @param {HTMLInputElement} ownedCheckbox The checkbox that determines if all unit upgrades should be considered.
 * @param {HTMLInputElement} useTraits A checkbox to determine if the stats should be based on the unit's target trait.
 * @returns {{obj: HTMLElement, filterCallback: (u: import("../../data/unit-data.js").UNIT_DATA) => number[] }} An object containing the created input, and a function which determines which forms of a unit meet the filter.
 */
function createSingleStatFilterInput(statName, displayName, statCallback, ownedCheckbox, useTraits) {
    const output = {};

    const wrapper = document.createElement("div");
    wrapper.classList.add("advanced-single-stat-wrapper");

    const wrapperLabel = document.createElement("p");
    wrapperLabel.classList.add("advanced-stat-label");
    wrapperLabel.textContent = displayName;

    const minValue = document.createElement("input");
    minValue.type = "text";
    minValue.min = "0";
    minValue.max = "1000000000";
    minValue.placeholder = "0";
    minValue.oninput = () => {
        let str = minValue.value.replaceAll(/[^0-9.]+/g, "");
        const pos = str.indexOf(".");
        if(pos > 0) {
            str = str.slice(0, pos + 1) + str.slice(pos + 1).replaceAll(".", "");
        }
        minValue.value = str;
    }

    const maxValue = document.createElement("input");
    maxValue.type = "text";
    maxValue.min = "0";
    maxValue.max = "1000000000";
    maxValue.placeholder = "∞";
    maxValue.oninput = () => {
        let str = maxValue.value.replaceAll(/[^0-9.]+/g, "");
        const pos = str.indexOf(".");
        if(pos > 0) {
            str = str.slice(0, pos + 1) + str.slice(pos + 1).replaceAll(".", "");
        }
        maxValue.value = str;
    }

    wrapper.append(minValue, "≤", wrapperLabel, "≤", maxValue);

    output.obj = wrapper;
    output.filterCallback = (/** @type {import("../../data/unit-data.js").UNIT_DATA} */ u) => {
        let modData;
        if(ownedCheckbox.checked) {
            modData = UnitData.dataToRecord(u);
        } else {
            modData = UnitData.dataToRecord(UnitData.maxUnit(u));
        }

        // @ts-ignore
        const testLevelValue = parseInt(document.querySelector("#advanced-level-box .advanced-level-option:not(.inactive)").dataset.levelType ?? "0");
        return [...new Array(u.max_form + 1).keys()].filter(i => {
            modData.current_form = i;
            const calcStat = statCallback(u.stats[i][statName], modData, u, { 
                targetTraits: (useTraits ? SETTINGS.traits : []),
                targetSubTraits: (useTraits ? SETTINGS.subTraits : []),
                // @ts-ignore
                testLevelValue: testLevelValue,
                includeTalents: true,
                includeOrbs: true,
                eocChapterPrice: 2,
                talentIgnoreForm: false
            });

            return parseFloat(minValue.value || "0") <= calcStat && calcStat <= parseFloat(maxValue.value || "1000000000");
        });
    };

    return output;
}

/**
 * Creates a search filter element.
 * @returns {{obj: HTMLElement, filterCallback: (units: number[]) => number[] }} An object containing the created input, and a function which takes zero or more units and returns 10 randomly selected units, less if there are not enough to choose 10.
 */
function createRandom10FilterInput() {
    const output = {};

    const input = document.createElement("input");
    input.id = "advanced-random10-filter";
    input.type = "checkbox";
    input.checked = false;

    const label = document.createElement("label");
    label.textContent = "Random 10";
    label.title = "Search results will only show (up to) 10 out of all units that met the search criteria"
    label.htmlFor = "advanced-random10-filter";

    output.obj = document.createElement("div");
    output.obj.classList.add("advaced-label-spacer");
    output.obj.append(label, input);

    output.filterCallback = (/** @type {number[]} */ units) => {
        if(!input.checked) {
            return units;
        }

        const res = [];

        for(let x = 0; x < 10 && units.length > 0; x++) {
            res.push(units.splice(Math.floor(Math.random() * units.length), 1)[0]);
        }

        return res;
    };

    return output;
}

/**
 * 
 * @param {(u: import("../../data/unit-data.js").UNIT_DATA) => number[]} searchCallback A function which returns only the forms of the provided unit which met the search criteria.
 * @param {(units: number[]) => number[]} resultFilter A function which filters the search results.
 */
async function applySearch(searchCallback, resultFilter) {
    const data = await REQUEST_TYPES.GET_ALL_DATA(true);
    const res = {};

    for(const u of data) {
        const forms = searchCallback(u);
        if(forms.length > 0) {
            res[u.id] = forms;
        }
    }

    const resFilter = resultFilter(Object.keys(res).map(k => parseInt(k)));
    const filteredRes = Object.fromEntries(resFilter.map(k => [k, { forms: res[k], data: data[k] }]));

    displayResults(filteredRes);
}

/**
 * Creates the results side of the advanced search modal.
 * @returns {HTMLDivElement} An element that can display search results.
 */
function createResults() {
    const results = document.createElement("div");
    results.id = "advanced-search-results";

    const resultLabel = document.createElement("h3");
    resultLabel.id = "advanced-results-label";
    resultLabel.textContent = "Results";

    const input = document.createElement("input");
    input.id = "advanced-result-minify";
    input.type = "checkbox";
    input.checked = false;
    input.onchange = () => resultsContent.classList.toggle("advanced-simple-result", input.checked);

    const label = document.createElement("label");
    label.textContent = "Simple Results";
    label.title = "Search results will only show the unit icon"
    label.htmlFor = "advanced-result-minify";

    const resultMinInfoWrapper = document.createElement("div");
    resultMinInfoWrapper.classList.add("advaced-label-spacer");
    resultMinInfoWrapper.append(label, input);

    const resultsContent = document.createElement("div");
    resultsContent.id = "advanced-results-content";

    results.append(resultLabel, resultMinInfoWrapper, resultsContent);
    return results;
}

/**
 * Displays the results of a search.
 * @param {object} results An object that maps unit ids to the rest of their data and the forms which met the search criteria.
 */
function displayResults(results) {
    const container = /** @type {HTMLDivElement} */ (document.querySelector("#advanced-results-content"));
    container.innerHTML = "";

    for(const key of Object.keys(results).sort()) {
        const result = document.createElement("div");
        result.classList.add(`${rarityMap[results[key].data.rarity].toLowerCase().replaceAll(" ", "-")}-color`);
        result.classList.add("advanced-result-wrapper");

        const iconWrapper = document.createElement("div");
        iconWrapper.classList.add("advanced-icon-centering");

        const icon = document.createElement("img");
        const maxValidForm = Math.max(...results[key].forms);
        const validImage = SETTINGS.skipImages.includes(parseInt(key));
        if(!validImage) {
            icon.src = `./assets/img/unit_icon/${key}_${maxValidForm}.png`;
        } else {
            icon.src = `./assets/img/unit_icon/unknown.png`;
        }
        icon.title = [results[key].data.normal_form, results[key].data.evolved_form, results[key].data.true_form, results[key].data.ultra_form][maxValidForm];
        icon.dataset.form = `${maxValidForm}`;
        iconWrapper.appendChild(icon);
        // TODO: click to submit unit as search result

        const id = document.createElement("p");
        id.classList.add("advanced-result-id");
        id.textContent = key;

        const hAlign = document.createElement("div");
        hAlign.classList.add("advanced-result-details");

        const talentReq = document.createElement("div");
        talentReq.classList.add("advanced-talent-required");

        const npImg = document.createElement("img");
        npImg.classList.add("advanced-np-img");
        npImg.src = "./assets/img/evo_mats/np_token.png";
        talentReq.appendChild(npImg);

        const utReq = document.createElement("div");
        utReq.classList.add("advanced-ut-required");

        const npImg2 = document.createElement("img");
        npImg2.classList.add("advanced-np-img");
        npImg2.src = "./assets/img/evo_mats/np_token.png";

        const darkImg = document.createElement("img");
        darkImg.classList.add("advanced-dark-img");
        darkImg.src = "./assets/img/evo_mats/dark_catseye.png";

        utReq.append(darkImg, npImg2);
        hAlign.append(talentReq, utReq);

        for(let x = 0; x < 4; x++) {
            const formBtn = document.createElement("div");
            formBtn.classList.add("advanced-form-option");
            formBtn.classList.add(`advanced-form-${x}`);
            if(results[key].forms.includes(x)) {
                formBtn.innerHTML = ["N", "E", "T", "U"][x];
                formBtn.classList.add("advanced-clickable");
                formBtn.onclick = () => {
                    if(!validImage) {
                        icon.src = `./assets/img/unit_icon/${key}_${x}.png`;
                    } else {
                        icon.src = `./assets/img/unit_icon/unknown.png`;
                    }
                    icon.title = [results[key].data.normal_form, results[key].data.evolved_form, results[key].data.true_form, results[key].data.ultra_form][x];
                    icon.dataset.form = `${x}`;
                };
            }
            hAlign.appendChild(formBtn);
        }
        
        result.append(id, iconWrapper, hAlign);

        container.appendChild(result);
    }
}