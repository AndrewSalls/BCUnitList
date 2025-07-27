//@ts-check
import { checkPort, REQUEST_TYPES } from "./communication/iframe-link.js";
import { getValuesFromRow, observeRowChange } from "./helper/link-row.js";
import makeSearchable, { createSearchDropdown, initializeDataset } from "./helper/make-searchable.js";
import * as RowComponents from "./unit-table/creation/create-unit-row.js";
import createOrbMenu from "./unit-table/orb/create-orb-selector.js";
import { initializeOrbSelection } from "./unit-table/orb/orb-selection.js";
import SETTINGS from "../assets/settings.js";
import createStatRow from "./unit-table/creation/create-stat-row.js";

/**
 * @readonly
 */
const RARITY_MAP = {
    "N": "normal",
    "EX": "special",
    "RR": "rare",
    "SR": "super-rare",
    "UR": "uber-rare",
    "LR": "legend-rare"
}

/**
 * Initializes page elements once page has loaded.
 */
document.addEventListener("DOMContentLoaded", () => {
    document.body.appendChild(createOrbMenu());
    initializeOrbSelection();
    /** @type {HTMLInputElement} */ (document.querySelector("#ut-uf-input")).oninput = () => {
        /** @type {NodeListOf<HTMLParagraphElement>} */ (document.querySelectorAll(".evo-mat-needed")).forEach(p => {
            const temp = p.dataset.alt;
            p.dataset.alt = p.textContent ?? "";
            p.textContent = temp ?? null;
        });
    };

    window.addEventListener("portLoaded", initialize);
    if(checkPort()) {
        window.dispatchEvent(new CustomEvent("portLoaded"));
    }
});

/**
 * Initializes static content on the page.
 */
function initialize() {
    const datalist = createSearchDropdown();
    document.body.appendChild(datalist);
    makeSearchable(/** @type {HTMLInputElement} */ (document.querySelector("#search-box")), id => {
        loadSpecific(id);
    });
    REQUEST_TYPES.GET_NAMES(true).then(names => initializeDataset(datalist, names));

    let target = window.localStorage.getItem("su");
    if(!target || Number.isNaN(target)) {
        target = "0";
    }
    loadSpecific(parseInt(target));
}

let loadedObj = null;
let loadedLink = null;
/**
 * Loads a specific unit to the combined attribute and cost table.
 * @param {number} id The specific unit ID to load.
 */
function loadSpecific(id) {
    loadedLink && loadedLink();
    loadedObj && loadedObj.remove();
    
    const container = document.querySelector("#loading-content");

    REQUEST_TYPES.GET_ID_DATA(id, true).then((/** @type {import("./data/unit-data.js").UNIT_DATA|null} */ entry) => {
        if(!entry) {
            console.error(`Missing unit data: ${id}`);
            return;
        }

        window.localStorage.setItem("su", `${id}`);

        const wrapper = /** @type {HTMLDivElement} */ (document.querySelector("#unit-border"));
        wrapper.className = RARITY_MAP[entry.rarity] + "-color";

        const idBox = RowComponents.createIDBox(entry.id);
        wrapper.querySelector("#id-wrapper")?.replaceChildren(idBox);
        const [nameBox, nameUpdate] = RowComponents.createNameBox([entry.normal_form, entry.evolved_form, entry.true_form, entry.ultra_form], entry.current_form);
        wrapper.querySelector("#name-wrapper")?.replaceChildren(nameBox);
        const iconBox = RowComponents.createIconBox(entry.id, entry.current_form, entry.max_form, SETTINGS.skipImages.includes(id), nameUpdate);
        wrapper.querySelector("#icon-wrapper")?.replaceChildren(iconBox);
        const levelBox = RowComponents.createLevelBox(entry.id, entry.level_cap, entry.level, entry.plus_level);
        wrapper.querySelector("#level-wrapper")?.replaceChildren(levelBox);
        const talentBox = RowComponents.createTalentBox(entry.talents, entry.ultra_talents);
        const talentWrapper = wrapper.querySelector("#talent-wrapper");
        talentWrapper?.replaceChildren(talentBox);
        if(entry.talents.length === 0 && entry.ultra_talents.length === 0) {
            const noTalent = document.createElement("h4");
            noTalent.textContent = "No Talents";
            talentWrapper?.replaceChildren(noTalent);
        }
        const orbBox = RowComponents.createOrbBox(entry.orb);
        const orbWrapper = wrapper.querySelector("#orb-wrapper");
        orbWrapper?.replaceChildren(orbBox);
        if(entry.talents.length === 0 && entry.ultra_talents.length === 0) {
            const noOrb = document.createElement("h4");
            noOrb.textContent = "No Talent Orbs";
            orbWrapper?.replaceChildren(noOrb);
        }
        const favoriteBox = RowComponents.createFavoriteBox(entry.favorited);
        wrapper.querySelector("#favorite-wrapper")?.replaceChildren(favoriteBox);

        document.querySelector("#ut-uf-checkbox")?.classList.toggle("hidden", entry.rarity !== "UR");
        /** @type {HTMLDivElement} */ (document.querySelector("#rarity-wrapper")).textContent = parseKebabCase(RARITY_MAP[entry.rarity]);
        document.querySelector("#catseye-wrapper")?.classList.toggle("hidden", entry.rarity === "N");
        if(entry.rarity !== "N") {
            /** @type {HTMLImageElement} */ (document.querySelector("#catseye-img")).src = `./assets/img/evo_mats/${RARITY_MAP[entry.rarity].replace("-", "_")}_catseye.png`;
        }
        document.querySelector("#dark-wrapper")?.classList.toggle("hidden", entry.rarity !== "UR");

        const borderWrapper = /** @type {HTMLDivElement} */ (document.querySelector("#unit-border"));
        REQUEST_TYPES.GET_ID_COST(id, true).then(cost => {
            setSpecificCost(cost, entry.rarity);

            /** @type {HTMLInputElement} */ (document.querySelector("#ut-uf-input")).checked = true;

            observeRowChange(borderWrapper, () => {
                (async () => {
                    await REQUEST_TYPES.UPDATE_ID(getValuesFromRow(borderWrapper));
                    setSpecificCost(await REQUEST_TYPES.GET_ID_COST(id), entry.rarity);
                })();
            });

            container?.classList.remove("hidden");
        });

        //@ts-ignore Don't tell anyone, but createStatRow doesn't actually need the input to be an HTMLTableRowElement
        const { row: statBox, callback: deloadCallback } = createStatRow(entry, borderWrapper);
        loadedLink = deloadCallback;
        const rowContents = /** @type {HTMLElement} */ (statBox.querySelector(".unit-stat-table"));
        loadedObj = rowContents;
        rowContents.classList.add("specific-unit-stats");

        wrapper.appendChild(rowContents);
    });
}

/**
 * Updates the quantities of all cost materials.
 * @param {import("./helper/find-costs.js").MATERIAL_COSTS} cost All of the costs needed.
 * @param {string} rarity A string representing the rarity of the unit, for displaying the correct type of non-dark catseye.
 */
function setSpecificCost(cost, rarity) {
    setupCostValue("xp-evo", cost.formXP, cost.ultra.formXP);
    setupCostValue("xp-30", cost.lvl30XP, cost.ultra.lvl30XP);
    setupCostValue("xp-max", cost.lvlMaxXP, cost.ultra.lvlMaxXP);
    setupCostValue("np", cost.maxNP, cost.ultra.maxNP);
    if(rarity !== "N") {
        setupCostValue("catseye", cost[`catseye_${rarity}`], cost.ultra[`catseye_${rarity}`]);
    }
    if(rarity === "UR") {
        setupCostValue("dark-catseye", cost.catseye_dark, cost.ultra.catseye_dark);
    }

    setupCostValue("green-fruit", cost.green_fruit, cost.ultra.green_fruit);
    setupCostValue("purple-fruit", cost.purple_fruit, cost.ultra.purple_fruit);
    setupCostValue("red-fruit", cost.red_fruit, cost.ultra.red_fruit);
    setupCostValue("blue-fruit", cost.blue_fruit, cost.ultra.blue_fruit);
    setupCostValue("yellow-fruit", cost.yellow_fruit, cost.ultra.yellow_fruit);
    setupCostValue("epic-fruit", cost.epic_fruit, cost.ultra.epic_fruit);
    setupCostValue("elder-fruit", cost.elder_fruit, cost.ultra.elder_fruit);
    setupCostValue("aku-fruit", cost.aku_fruit, cost.ultra.aku_fruit);
    setupCostValue("gold-fruit", cost.gold_fruit, cost.ultra.gold_fruit);

    setupCostValue("green-seed", cost.green_seed, cost.ultra.green_seed);
    setupCostValue("purple-seed", cost.purple_seed, cost.ultra.purple_seed);
    setupCostValue("red-seed", cost.red_seed, cost.ultra.red_seed);
    setupCostValue("blue-seed", cost.blue_seed, cost.ultra.blue_seed);
    setupCostValue("yellow-seed", cost.yellow_seed, cost.ultra.yellow_seed);
    setupCostValue("epic-seed", cost.epic_seed, cost.ultra.epic_seed);
    setupCostValue("elder-seed", cost.elder_seed, cost.ultra.elder_seed);
    setupCostValue("aku-seed", cost.aku_seed, cost.ultra.aku_seed);
    setupCostValue("gold-seed", cost.gold_seed, cost.ultra.gold_seed);
    
    setupCostValue("green-gem", cost.green_gem, cost.ultra.green_gem);
    setupCostValue("purple-gem", cost.purple_gem, cost.ultra.purple_gem);
    setupCostValue("red-gem", cost.red_gem, cost.ultra.red_gem);
    setupCostValue("blue-gem", cost.blue_gem, cost.ultra.blue_gem);
    setupCostValue("yellow-gem", cost.yellow_gem, cost.ultra.yellow_gem);

    setupCostValue("green-stone", cost.green_stone, cost.ultra.green_stone);
    setupCostValue("purple-stone", cost.purple_stone, cost.ultra.purple_stone);
    setupCostValue("red-stone", cost.red_stone, cost.ultra.red_stone);
    setupCostValue("blue-stone", cost.blue_stone, cost.ultra.blue_stone);
    setupCostValue("yellow-stone", cost.yellow_stone, cost.ultra.yellow_stone);
    setupCostValue("epic-stone", cost.epic_stone, cost.ultra.epic_stone);
}

/**
 * Sets the value for a specific cost element.
 * @param {string} target The id of the cost element that is having its value set. 
 * @param {number} value The total cost for the targetted cost element.
 * @param {number|null} ultraValue The amount of the cost element needed only for upgrades involving dark catseyes, or null if the upgrade does not rely on dark catseyes.
 */
function setupCostValue(target, value, ultraValue = null) {
    const text = /** @type {HTMLParagraphElement} */ (document.querySelector(`#${target}`));
    text.textContent = value.toLocaleString();
    text.dataset.alt = (value - (ultraValue ?? 0)).toLocaleString();
}

/**
 * Parses a kebab-case name.
 * @param {string} str A kebab-case string.
 * @returns {string} A Capital Case string (with spaces).
 */
function parseKebabCase(str) {
    return str.replaceAll(/\-[a-z]/g, m => ` ${m[1].toUpperCase()}`).replace(/^[a-z]/, m => m[0].toUpperCase());    
}