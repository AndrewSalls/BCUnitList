//@ts-check
import { decodeUnit } from "./encoder.js";

/**
 * @readonly
 * @enum {string}
 */
export const RARITY = {
    NORMAL: "N",
    SPECIAL: "EX",
    RARE: "RR",
    SUPER_RARE: "SR",
    UBER_RARE: "UR",
    LEGEND_RARE: "LR"
}

/**
 * @readonly
 * @enum {number}
 */
export const FORM = {
    NORMAL: 0,
    EVOLVED: 1,
    TRUE: 2,
    ULTRA: 3
}

/**
 * @typedef {{Type: string; MaxLevel: number; MaxPlusLevel: number; }} LEVEL_CAP
 * @typedef {{ name: string; cap: number; value: number; }} TALENT
 * @typedef {{ trait: number; type: number; rank: number; }|null} ORB
 * 
 * @typedef LOADOUT_UNIT_DATA
 * @property {number} id
 * @property {FORM} current_form
 * @property {number} level
 * @property {number} plus_level
 * @property {number[]} talents
 * @property {number[]} ultra_talents
 * @property {ORB[]} orb
 * 
 * @typedef UNIT_RECORD
 * @property {number} id
 * @property {FORM} current_form
 * @property {number} level
 * @property {number} plus_level
 * @property {number[]} talents
 * @property {number[]} ultra_talents
 * @property {ORB[]} orb
 * @property {boolean} favorited
 * @property {boolean} hidden
 * 
 * @typedef UNIT_DATA
 * @property {number} id
 * @property {RARITY} rarity
 * @property {boolean} in_EN
 * @property {boolean} collab
 * @property {boolean} unobtainable
 * @property {boolean} disable_icon
 * @property {string | null} normal_form
 * @property {string | null} evolved_form
 * @property {string | null} true_form
 * @property {string | null} ultra_form
 * @property {number} max_form
 * @property {LEVEL_CAP} level_cap
 * @property {FORM} current_form
 * @property {number} level
 * @property {number} plus_level
 * @property {TALENT[]} talents
 * @property {TALENT[]} ultra_talents
 * @property {ORB[]} orb
 * @property {boolean} favorited
 * @property {boolean} hidden
 */

/**
 * Gets all valid level cap objects.
 * @returns {Promise<LEVEL_CAP[]>} A list of level caps.
 */
async function getLevelCaps() {
    //@ts-ignore PapaParse breaks when imported as module
    return fetch("./assets/unit_data/level_cap_stats.csv").then(r => r.text()).then(t => Papa.parse(t, { header: true, dynamicTyping: true, skipEmptyLines: true }).data).catch(e => console.error(e));
}

/**
 * Gets all unit data.
 * @param {Object} categories All categories, for the purposes of determining if a unit is a collab unit or unobtainable.
 * @param {Object} settings The site settings.
 * @returns {Promise<{units: UNIT_DATA[], ur: number}>} A list of every unit in the game, and the total user rank the current user has due to unit levels.
 */
export async function getUnitData(categories, settings) {
    const unitCount = settings.unitCount;
    const levelingCaps = await getLevelCaps();
    const collabUnits = [...Object.values(categories["collabs"]).flat(), ...Object.values(categories["small_collabs"]).flat()];
    const unobtainableUnits = categories["other"]["Unobtainable"];
    let totalLevel = 0;

    const awaitFinish = [];
    for(let x = 0; x <= Math.floor(unitCount / 100); x++) {
        awaitFinish.push(fetch(`./assets/unit_data/units_${x * 100}.csv`)
            .then(r => r.text())
            //@ts-ignore PapaParse breaks when imported as module
            .then(t => Papa.parse(t, {
                header: true,
                dynamicTyping: true,
                skipEmptyLines: true
            }).data)
            .then(entries => entries.map((/** @type {Object} */ entry) => {
                    let levelType = levelingCaps.find((/** @type {{ Type: any; }} */ t) => t.Type === entry.LevelCapFormat);
                    if(!levelType) {
                        levelType = levelingCaps.find((/** @type {{ Type: string; }} */ t) => t.Type === "Default");
                    }

                    const unitData = {
                        id: entry.ID,
                        rarity: entry.Rarity,
                        in_EN: entry.InEN === "Y",
                        collab: collabUnits.includes(entry.ID),
                        unobtainable: unobtainableUnits.includes(entry.ID),
                        normal_form: entry.NF,
                        evolved_form: entry.EF,
                        true_form: entry.TF,
                        ultra_form: entry.UF,
                        max_form: findFormNumber(entry.NF, entry.EF, entry.TF, entry.UF),
                        level_cap: levelType,
                        talents: parseTalents(entry.Talents),
                        ultra_talents: parseTalents(entry.UltraTalents),
                        orb: new Array(parseInt(entry.OrbCount)).fill(null),
                        favorited: false,
                        level: 0,
                        plus_level: 0,
                        current_form: FORM.NORMAL,
                        hidden: false
                    };
                    if(settings.skipImages.includes(entry.ID)) {
                        unitData.disable_icon = true;
                    }
                    
                    if(window.localStorage.getItem(entry.ID)) {
                        const decompressed = decodeUnit(window.localStorage.getItem(entry.ID));
                        unitData.current_form = decompressed.current_form;
                        unitData.favorited = decompressed.favorited;
                        unitData.hidden = decompressed.hidden;
                        unitData.level = decompressed.level;
                        unitData.plus_level = decompressed.plus_level;
                        for(let x = 0; x < decompressed.orb.length; x++) {
                            unitData.orb[x] = decompressed.orb[x];
                        }
                        for(let x = 0; x < decompressed.talents.length; x++) {
                            unitData.talents[x].value = decompressed.talents[x];
                        }
                        for(let x = 0; x < decompressed.ultra_talents.length; x++) {
                            unitData.ultra_talents[x].value = decompressed.ultra_talents[x];
                        }
                    } else if(entry.ID === 0) { // Cat must be at least level 1, ensures no weirdness with not owning any units
                        unitData.level = 1;
                    }

                    totalLevel += unitData.level + unitData.plus_level;
                    return unitData;
                })
            ));
    }

    return {
        units: (await Promise.all(awaitFinish)).flat(),
        ur: totalLevel
    };
}

/**
 * Finds the number of forms a unit has.
 * @param {(string|null)[]} forms A list of form names, null if the unit lacks that form. 
 * @returns {number} The number of forms before the unit lacks a form.
 */
function findFormNumber(...forms) {
    let counter = -1;
    for(const formName of forms) {
        if(formName) {
            counter++;
        } else {
            return counter;
        }
    }

    return counter;
}

/**
 * Parses talents from their encoding in the unit data csvs.
 * @param {string} talentString The encoded string.
 * @returns {TALENT[]} A list of parsed talents.
 */
function parseTalents(talentString) {
    if(!talentString) {
        return [];
    }

    const talents = talentString.split("-");

    return talents.map((/** @type {string} */ e) => { return {
        name: e.replace(/[0-9]+/i, ""),
        cap: parseInt(e.replace(/[^0-9]+/i, "")),
        value: 0
    }});
}

/**
 * Parses upgrades from localStorage.
 * @param {Object} settings Site settings.
 * @returns {{upData: [number, ...{ level: number, plus: number}[]], upUR: number}} upData contains a binary value representing whether God is owned, followed by the level and plus level of all abilities. upUR is the amount that the user's user rank should increase by as a result of abilities.
 */
export function parseUpgrades(settings) {
    const abilityIconLevels = window.localStorage.getItem("abo");
    let upgradeData, upgradeUR = 0;

    if(!abilityIconLevels) {
        upgradeData = settings.abilities.abilityNames.map((/** @type {any} */ _) => { return {
            level: 1,
            plus: 0
        }});
    } else {
        upgradeData = abilityIconLevels.split("-").map(s => {
            const parts = s.split("+");

            const output = {
                level: parseInt(parts[0]),
                plus: parseInt(parts[1])
            };
            upgradeUR += output.level + output.plus;

            return output;
        });
    }

    return { upData: [parseInt(window.localStorage.getItem("cgs") ?? "0"), ...upgradeData], upUR: upgradeUR };
}

/**
 * Parses loadouts from localStorage.
 * @returns {import("./loadout-storage-manager.js").LOADOUT[]} Parsed loadouts.
 */
export function parseLoadouts() {
    const llp = window.localStorage.getItem("llp");
    if(llp) {
        return llp.split(" ").map(b64 => JSON.parse(window.atob(b64)));
    }

    return [];
}