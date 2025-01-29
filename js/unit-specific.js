import { getValuesFromRow, observeRowChange } from "./helper/link-row.js";
import makeSearchable from "./helper/make-searchable.js";
import * as RowComponents from "./unit-table/creation/create-unit-row.js";
import createOrbMenu from "./unit-table/orb/create-orb-selector.js";
import { initializeOrbSelection } from "./unit-table/orb/orb-selection.js";

const RARITY_MAP = {
    "N": "normal",
    "EX": "special",
    "RR": "rare",
    "SR": "super-rare",
    "UR": "uber-rare",
    "LR": "legend-rare"
}

document.addEventListener("DOMContentLoaded", () => {
    document.body.appendChild(createOrbMenu());
    initializeOrbSelection();
    document.querySelector("#ut-uf-checkbox").oninput = () => document.querySelectorAll(".evo-mat-needed").forEach(p => [p.textContent, p.dataset.alt] = [p.dataset.alt, p.textContent]);

    window.addEventListener("portLoaded", initialize);
    if(checkPort()) {
        window.dispatchEvent("portLoaded");
    }
});

function initialize() {
    const searchSuggestions = document.createElement("datalist");
    searchSuggestions.id = "search-options";
    document.body.appendChild(searchSuggestions);

    makeSearchable(document.querySelector("#search-box"), searchSuggestions, id => {
        loadSpecific(id);
    }, true);

    let target = 0;
    if(window.localStorage.getItem("su") !== null) {
        target = parseInt(window.localStorage.getItem("su"));
    }
    loadSpecific(target);
}

function loadSpecific(id) {
    makeRequest(REQUEST_TYPES.GET_ID_DATA, id, true).then(entry => {
        window.localStorage.setItem("su", id);

        const wrapper = document.querySelector("#unit-border");
        wrapper.classList.add(RARITY_MAP[entry.rarity] + "-color");

        const idBox = RowComponents.createIDBox(entry.id);
        wrapper.querySelector("#id-wrapper").replaceChildren(idBox);
        const [nameBox, nameUpdate] = RowComponents.createNameBox([entry.normal_form, entry.evolved_form, entry.true_form, entry.ultra_form], entry.current_form);
        wrapper.querySelector("#name-wrapper").replaceChildren(nameBox);
        const [iconBox, _1, _2] = RowComponents.createIconBox(entry.id, entry.current_form, entry.max_form, nameUpdate);
        wrapper.querySelector("#icon-wrapper").replaceChildren(iconBox);
        const [levelBox, _3, _4, _5, _6] = RowComponents.createLevelBox(entry.level_cap, entry.level, entry.plus_level);
        wrapper.querySelector("#level-wrapper").replaceChildren(levelBox);
        const [talentBox, _7, _8, _9, _10] = RowComponents.createTalentBox(entry.talents, entry.ultra_talents);
        const talentWrapper = wrapper.querySelector("#talent-wrapper");
        talentWrapper.replaceChildren(talentBox);
        if(entry.talents.length === 0 && entry.ultra_talents.length === 0) {
            const noTalent = document.createElement("h4");
            noTalent.textContent = "No Talents";
            talentWrapper.replaceChildren(noTalent);
        }
        const [orbBox, _11] = RowComponents.createOrbBox(entry.orb, entry.orb.length);
        const orbWrapper = wrapper.querySelector("#orb-wrapper");
        orbWrapper.replaceChildren(orbBox);
        if(entry.talents.length === 0 && entry.ultra_talents.length === 0) {
            const noOrb = document.createElement("h4");
            noOrb.textContent = "No Talent Orbs";
            orbWrapper.replaceChildren(noOrb);
        }
        const [favoriteBox, _12] = RowComponents.createFavoriteBox(entry.favorited);
        wrapper.querySelector("#favorite-wrapper").replaceChildren(favoriteBox);

        document.querySelector("#rarity-wrapper").textContent = parseKebabCase(RARITY_MAP[entry.rarity]);

        makeRequest(REQUEST_TYPES.GET_ID_COST, id).then(cost => {
            const wrapper = document.querySelector("#unit-border");
            document.querySelector("#ut-uf-checkbox").classList.toggle("hidden", entry.rarity !== "UR");
            document.querySelector("#ut-uf-input").checked = true;
    
            setupCostValue("xp-evo", cost.formXP, cost.ultra.formXP);
            setupCostValue("xp-30", cost.lvl30XP, cost.ultra.lvl30XP);
            setupCostValue("xp-max", cost.lvlMaxXP, cost.ultra.lvlMaxXP);
            setupCostValue("np", cost.maxNP, cost.ultra.maxNP);
            document.querySelector("#catseye-wrapper").classList.toggle("hidden", entry.rarity === "N");
            if(entry.rarity !== "N") {
                setupCostValue("catseye", cost[`catseye_${entry.rarity}`], cost.ultra[`catseye_${entry.rarity}`]);
                document.querySelector("#catseye-img").src = `../res/img/evo_mats/${RARITY_MAP[entry.rarity].replace("-", "_")}_catseye.png`;
            }
            document.querySelector("#dark-wrapper").classList.toggle("hidden", entry.rarity !== "UR");
            if(entry.rarity === "UR") {
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

            observeRowChange(wrapper, () => makeRequest(REQUEST_TYPES.UPDATE_ID, getValuesFromRow(wrapper), true));

            wrapper.classList.remove("hidden");
        });
    });
}

function setupCostValue(target, value, ultraValue = null) {
    const text = document.querySelector(`#${target}`);
    text.textContent = value.toLocaleString();
    text.dataset.alt = (value - (ultraValue ?? 0)).toLocaleString();
}

function parseKebabCase(str) {
    return str.replaceAll(/\-[a-z]/g, m => ` ${m[1].toUpperCase()}`).replace(/^[a-z]/, m => m[0].toUpperCase());    
}