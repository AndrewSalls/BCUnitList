// @ts-check

import SETTINGS from "../../../assets/settings.js";
import UnitData, { dataToRecord } from "../../data/unit-data.js";
import { calculateCost, calculateDamage, calculateHealth, calculateKnockbacks, calculateRange, calculateRechargeTime, calculateSpeed, CALCULATOR_LEVEL_OPTIONS } from "../../helper/calculate-stats.js";

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
    const { obj: statMultiRange, filterCallback: filterStatRange } = createStatFilterInput();
    const { obj: randomToggle, filterCallback: filterRandom10 } = createRandom10FilterInput();

    const searchButton = document.createElement("button");
    searchButton.id = "advanced-search-enter";
    searchButton.innerHTML = `
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 2a8 8 0 105.29 14.29l5.21 5.21 1.5-1.5-5.21-5.21A8 8 0 0010 2zm0 2a6 6 0 110 12 6 6 0 010-12z"/>
    </svg>`;

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

    const results = document.createElement("div");
    results.id = "advanced-search-results";

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
        return [...new Array(u.max_form).keys()].filter(i => unitNames[i]?.toLowerCase().includes(output.obj.value.trim().toLowerCase()) ?? false);
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

    const map = { N: "Normal", EX: "Special", RR: "Rare", SR: "Super Rare", UR: "Uber Rare", LR: "Legend Rare" };
    output.filterCallback = (/** @type {import("../../data/unit-data.js").UNIT_DATA} */ u) => [...wrapperContent.querySelectorAll(".advanced-rarity-selector")]
        .some(b => b.textContent === map[u.rarity]);

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

    output.filterCallback = (/** @type {import("../../data/unit-data.js").UNIT_DATA} */ u) => [...new Array(u.max_form).keys()].filter(form => 
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

    output.filterCallback = (/** @type {import("../../data/unit-data.js").UNIT_DATA} */ u) => [...new Array(u.max_form).keys()].filter(form =>
        /** @type {HTMLDivElement[]} */ ([...wrapperContent.querySelectorAll(".advanced-ability-selector")])
            .every(w => w.classList.contains("inactive") || UnitData.hasAbility(u, w.dataset.ability ?? "", form)));
        
    return output;
}

/**
 * Creates a search filter element.
 * @returns {{obj: HTMLElement, filterCallback: (u: import("../../data/unit-data.js").UNIT_DATA) => number[] }} An object containing the created input, and a function which determines which forms of a unit meet the filter.
 */
function createStatFilterInput() {
    const output = {};

    const wrapper = document.createElement("div");
    wrapper.classList.add("advanced-wrapper");

    const wrapperLabel = document.createElement("h4");
    wrapperLabel.textContent = "Stats";

    const wrapperContent = document.createElement("div");
    wrapperContent.id = "advanced-stats-spacer";

    const { obj: stat1, filterCallback: statCallback1 } = createSingleStatFilterInput("cost", "Cost", calculateCost);
    const { obj: stat2, filterCallback: statCallback2 } = createSingleStatFilterInput("health", "Health", calculateHealth);
    const { obj: stat3, filterCallback: statCallback3 } = createSingleStatFilterInput("damage", "Damage", calculateDamage);
    const { obj: stat4, filterCallback: statCallback4 } = createSingleStatFilterInput("knockbacks", "Knockbacks", calculateKnockbacks);
    const { obj: stat5, filterCallback: statCallback5 } = createSingleStatFilterInput("cooldown", "Recharge Time", calculateRechargeTime);
    const { obj: stat6, filterCallback: statCallback6 } = createSingleStatFilterInput("range", "Range", calculateRange);
    const { obj: stat7, filterCallback: statCallback7 } = createSingleStatFilterInput("speed", "Speed", calculateSpeed);

    wrapperContent.append(stat1, stat2, stat3, stat4, stat5, stat6, stat7);
    wrapper.append(wrapperLabel, wrapperContent);
    output.obj = wrapper;

    output.filterCallback = (/** @type {import("../../data/unit-data.js").UNIT_DATA} */ u) => {
        return [...new Array(u.max_form).keys()]
            .filter(f => statCallback1(u).includes(f) && statCallback2(u).includes(f) && statCallback3(u).includes(f) && statCallback4(u).includes(f) &&
                        statCallback5(u).includes(f) && statCallback6(u).includes(f) && statCallback7(u).includes(f));
    }

    return output;
}

/**
 * Creates a stat filter input for a single stat.
 * @param {string} statName The name of the stat.
 * @param {string} displayName The name to display for the stat.
 * @param {(number, UNIT_RECORD, UNIT_DATA, CALCULATOR_OPTIONS) => number} statCallback 
 * @returns {{obj: HTMLElement, filterCallback: (u: import("../../data/unit-data.js").UNIT_DATA) => number[] }} An object containing the created input, and a function which determines which forms of a unit meet the filter.
 */
function createSingleStatFilterInput(statName, displayName, statCallback) {
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
    output.filterCallback = (/** @type {import("../../data/unit-data.js").UNIT_DATA} */ u) => [...new Array(u.max_form).keys()]
        .filter(i => {
            const modData = dataToRecord(u); // Customize if owned only is off, max everything
            const calcStat = statCallback(u.stats[i][statName], modData, u, { 
                targetTraits: [], // fill with all if against trait toggle is on
                targetSubTraits: [], // fill with all if against trait toggle is on
                testLevelValue: CALCULATOR_LEVEL_OPTIONS.LEVEL_1, // need to change
                includeTalents: true,
                includeOrbs: true,
                eocChapterPrice: 2,
                talentIgnoreForm: false
             });
            return parseFloat(minValue.value ?? "0") <= calcStat && calcStat <= parseFloat(maxValue.value ?? "1000000000");
        });

    return output;
}

/**
 * Creates a search filter element.
 * @returns {{obj: HTMLElement, filterCallback: (units: import("../../data/unit-data.js").UNIT_DATA[]) => import("../../data/unit-data.js").UNIT_DATA[] }} An object containing the created input, and a function which takes zero or more units and returns 10 randomly selected units, less if there are not enough to choose 10.
 */
function createRandom10FilterInput() {
    const output = {};

    const input = document.createElement("input");
    input.id = "advanced-random10-filter";
    input.type = "checkbox";
    input.checked = true;

    const label = document.createElement("label");
    label.textContent = "Random 10";
    label.title = "Search results will only show (up to) 10 out of all units that met the search criteria"
    label.htmlFor = "advanced-random10-filter";

    output.obj = document.createElement("div");
    output.obj.id = "advanced-random10-wrapper";
    output.obj.append(label, input);

    output.filterCallback = (/** @type {import("../../data/unit-data.js").UNIT_DATA[]} */ units) => {
        const res = [];

        for(let x = 0; x < 10 && units.length > 0; x++) {
            res.push(units.splice(Math.floor(Math.random() * units.length), 1)[0]);
        }

        return res;
    };

    return output;
}