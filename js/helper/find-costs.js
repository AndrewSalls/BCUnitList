//@ts-check
import TALENT_NP_MAP from "../../assets/talent-np-map.js";
import UT_NP_MAP from "../../assets/ut-np-map.js";
import ORB_MAP from "../../assets/orb-map.js";
import { RARITY } from "./parse-file.js";

/**
 * @typedef {import("./parse-file.js").UNIT_DATA} UNIT_DATA
 */

let levelingCost;
let pause = false;

/**
 * Checks that the leveling costs are initialized.
 * @returns {boolean} Whether the leveling costs have been initialized.
 */
export function isInitialized() {
    return !!levelingCost;
}

/**
 * Initializes leveling costs for all units.
 */
export async function initializeLeveling() {
    if(!pause && !isInitialized()) {
        pause = true;
        levelingCost = await fetch("./assets/unit_data/leveling_stats.csv")
            .then(r => r.text())
            //@ts-ignore PapaParse breaks when imported as module
            .then(t => Papa.parse(t, { header: true, dynamicTyping: true, skipEmptyLines: true }).data)
            .catch(e => console.error(e));
    }
}

/**
 * Obtains the costs needed to upgrade a list of units.
 * @param {UNIT_DATA[]} unitList The list of units.
 * @returns {Promise<Object>} The materials needed to upgrade the units.
 */
export default async function getCostsFor(unitList) {    
    unitList.sort((/** @type {{ id: number; }} */ a, /** @type {{ id: number; }} */ b) => a.id - b.id);

    const tables = Object.groupBy(unitList, (/** @type {{ id: number; }} */ v) => Math.floor(v.id / 100) * 100);
    const promises = [];
    
    const tableAllValues = {
        formXP: 0, lvl30XP: 0, lvlMaxXP: 0, maxNP: 0, sOrb: 0, catseye_EX: 0, catseye_RR: 0, catseye_SR: 0, catseye_UR: 0, catseye_LR: 0, catseye_dark: 0,
        green_fruit: 0, purple_fruit: 0, red_fruit: 0, blue_fruit: 0, yellow_fruit: 0, epic_fruit: 0, elder_fruit: 0, aku_fruit: 0, gold_fruit: 0,
        green_seed: 0, purple_seed: 0, red_seed: 0, blue_seed: 0, yellow_seed: 0, epic_seed: 0, elder_seed: 0, aku_seed: 0, gold_seed: 0,
        green_gem: 0, purple_gem: 0, red_gem: 0, blue_gem: 0, yellow_gem: 0,
        green_stone: 0, purple_stone: 0, red_stone: 0, blue_stone: 0, yellow_stone: 0, epic_stone: 0
    };
    const tableUltraValues = {...tableAllValues};
    
    if(unitList.length === 0) {
        tableAllValues.ultra = tableUltraValues;
        tableAllValues.has_units = false;
        return tableAllValues;
    }

    for(const key of Object.keys(tables)) {
        const numKey = parseInt(key);
        promises.push(fetch(`./assets/unit_data/unit_costs_${numKey}.csv`)
            .then(r => r.text())
            //@ts-ignore PapaParse breaks when imported as a module
            .then(t => Papa.parse(t, {
                header: true,
                dynamicTyping: true,
                skipEmptyLines: true
            }).data)
            .then(entries => {
                for(const unit of tables[key]) {
                    const row = entries[unit.id - numKey];
                    
                    // ------------------------------------- XP costs ------------------------------------- 
                    const xpTable = getLevelingCosts(unit.rarity, row.LevelFormat);
                    if(unit.max_form >= 2 && unit.current_form < 2) {
                        tableAllValues.formXP += row.TrueXPCost;
                    }
                    if(unit.max_form >= 3 && unit.current_form < 3) {
                        tableAllValues.formXP += row.UltraXPCost;
                        tableUltraValues.formXP += row.UltraXPCost;
                    }
                    const lvl30 = Math.min(30, unit.level_cap.MaxLevel);
                    if(unit.level < lvl30) {
                        tableAllValues.lvl30XP += getXPToLvl(xpTable, lvl30, unit.level);
                    }
                    if(unit.level < unit.level_cap.MaxLevel) {
                        tableAllValues.lvlMaxXP += getXPToLvl(xpTable, unit.level_cap.MaxLevel, unit.level);

                        if(unit.level_cap.MaxLevel > 50) {
                            tableUltraValues.lvlMaxXP += getXPToLvl(xpTable, unit.level_cap.MaxLevel, Math.max(unit.level, 50));
                        }
                    }

                    // ------------------------------------- NP costs ------------------------------------- 
                    if(unit.talents.length > 0) {
                        const talentNPCosts = `${row.TalentNP}`.split("-");
                        unit.talents.forEach((/** @type {{ value: number; cap: number; }} */ talent, /** @type {string | number} */ i) => {
                            if(talent.value < talent.cap) {
                                tableAllValues.maxNP += getNPToLvl(TALENT_NP_MAP[unit.rarity][talentNPCosts[i]], talent.value);
                            }
                        });
                    }

                    if(unit.ultra_talents.length > 0) {
                        const ultraTalentNPCosts = `${row.UltraTalentNP}`.split("-");
                        unit.ultra_talents.forEach((/** @type {{ value: number; cap: number; }} */ talent, /** @type {string | number} */ i) => {
                            if(talent.value < talent.cap) {
                                const npIncrease = getNPToLvl(UT_NP_MAP[ultraTalentNPCosts[i]], talent.value);
                                tableAllValues.maxNP += npIncrease;
                                tableUltraValues.maxNP += npIncrease;
                            }
                        });
                    }

                    // ------------------------------------- Non-S Rank Orb Count -------------------------------------
                    if(unit.orb.length > 0) { // Talent orb
                        tableAllValues.sOrb += (unit.orb[0] === null || unit.orb[0].rank !== ORB_MAP.ranks.length - 1) ? 0 : 1;
                    }
                    if(unit.orb.length > 1) { // UT orb
                        const isSRank = (unit.orb[1] === null || unit.orb[1].rank !== ORB_MAP.ranks.length - 1) ? 0 : 1;
                        tableAllValues.sOrb += isSRank;
                        tableUltraValues.sOrb += isSRank;
                    }

                    // ------------------------------------- Catseye costs ------------------------------------- 
                    if(unit.level_cap.MaxLevel > 30) {
                        tableAllValues[`catseye_${unit.rarity}`] += Math.min(25, Math.max(0, 45 - unit.level) + 2 * Math.max(0, 50 - unit.level));
                    }
                    if(unit.level_cap.MaxLevel > 50) {
                        const darkEyes = Math.min(15, Math.max(0, 55 - unit.level) + 2 * Math.max(0, 60 - unit.level));
                        tableAllValues.catseye_dark += darkEyes;
                        tableUltraValues.catseye_dark += darkEyes;
                    }

                    // ------------------------------------- Evolution Material costs -------------------------------------
                    if(unit.current_form < 2) {
                        for(let x = 1; x <= 5; x++) {
                            const material = row[`TrueMaterial${x}`];
                            if(material) {
                                tableAllValues[material] += parseInt(row[`TrueMaterialCount${x}`]);
                            }
                        }
                    }

                    if(unit.current_form < 3) {
                        for(let x = 1; x <= 5; x++) {
                            const material = row[`UltraMaterial${x}`];
                            if(material) {
                                const increase = parseInt(row[`UltraMaterialCount${x}`]);
                                tableAllValues[material] += increase;
                                tableUltraValues[material] += increase;
                            }
                        }
                    }
                }
            })
        );
    }

    await Promise.all(promises);
    
    tableAllValues.ultra = tableUltraValues;
    tableAllValues.has_units = true;
    tableAllValues.hasUber = unitList.some((/** @type {{ rarity: string; }} */ u) => u.rarity === "UR");
    return tableAllValues;
}

/**
 * Calculates the amount of XP needed to level up a unit to a chosen level, starting at a specified level
 * @param {Object} xpTable The amount of XP needed for each level.
 * @param {number} targetLvl The target level.
 * @param {number} lvl The starting level.
 * @returns {number} The amount of XP needed.
 */
function getXPToLvl(xpTable, targetLvl, lvl) {
    let sum = 0;

    for(let x = lvl + 1; x <= targetLvl; x++) {
        // @ts-ignore level >= 0
        sum += xpTable[x];
    }

    return sum;
}

/**
 * Calculates the amount of NP needed to level up a talent to a chosen level.
 * @param {number[]} npTable The amount of NP needed for each level.
 * @param {number} lvl The target level for the talent.
 * @returns {number} The amount of NP needed.
 */
function getNPToLvl(npTable, lvl) {
    let sum = 0;

    for(let x = lvl; x < npTable.length; x++) {
        sum += npTable[x];
    }

    return sum;
}

/**
 * Gets the XP leveling costs for the specified unit type
 * @param {RARITY} rarity The unit's rarity, for when the unit lacks a levelFormat
 * @param {string|null} levelFormat The level format the unit should use, or null if no level format was defined
 * @returns {Object} The XP leveling costs for a unit with the specified rarity/levelFormat.
 */
function getLevelingCosts(rarity, levelFormat) {
    if(levelFormat) {
        return levelingCost.find((/** @type {{ Type: string; }} */ c) => c.Type === levelFormat);
    }

    switch(rarity) {
        case RARITY.SPECIAL:
        case RARITY.RARE:
            return levelingCost.find((/** @type {{ Type: string; }} */ c) => c.Type === "GachaRare");
        case RARITY.SUPER_RARE:
            return levelingCost.find((/** @type {{ Type: string; }} */ c) => c.Type === "GachaSR");
        case RARITY.UBER_RARE:
        case RARITY.LEGEND_RARE:
            return levelingCost.find((/** @type {{ Type: string; }} */ c) => c.Type === "UR");
        case RARITY.NORMAL:
        default:
            console.error("Attempting to get standard leveling cost for invalid rarity.");
            return {};
    }
}