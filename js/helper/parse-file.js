//@ts-check
import Papa from "../papaparse5.5.2.min.js";
import SETTINGS from "../../assets/settings.js";
import { FORM } from "../data/unit-data.js";
import { decodeUnit } from "./encoder.js";

/**
 * Gets all valid level cap objects.
 * @returns {Promise<import("../data/unit-data.js").LEVEL_CAP[]>} A list of level caps.
 */
async function getLevelCaps() {
    return fetch("./assets/unit_data/level_cap_stats.csv").then(r => r.text()).then(t => Papa.parse(t, { header: true, dynamicTyping: true, skipEmptyLines: true }).data).catch(e => console.error(e));
}

/**
 * Gets all unit data.
 * @param {import("../data/category-data.js").CATEGORY_MAP} categories All categories, for the purposes of determining if a unit is a collab unit or unobtainable.
 * @returns {Promise<import("../data/unit-data.js").UNIT_DATA[]>} A list of every unit in the game.
 */
export async function getUnitData(categories) {
    const unitCount = SETTINGS.unitCount;
    const levelCaps = await getLevelCaps();
    const collabUnits = [...Object.values(categories["collabs"]).flat(), ...Object.values(categories["small_collabs"]).flat()];
    const unobtainableUnits = categories["other"]["Unobtainable"];
    let totalLevel = 0;

    const awaitFinish = [];
    for(let x = 0; x <= Math.floor(unitCount / 100); x++) {
        awaitFinish.push(new Promise(res => {
            readDescriptiveData(x * 100, levelCaps).then(desc => {
                readStatData(x * 100).then(stats => {
                    for(let p = 0; p < desc.length; p++) {
                        totalLevel += desc[p].level + desc[p].plus_level;

                        desc[p].stats = stats[p];
                        desc[p].collab = collabUnits.includes(desc[p].id);
                        desc[p].unobtainable = unobtainableUnits.includes(desc[p].id);
                    }

                    res(desc);
                });
            });
        }));
    }

    const output = (await Promise.all(awaitFinish)).flat();
    window.localStorage.setItem("ur", `${parseInt(window.localStorage.getItem("ur") ?? "0") + totalLevel}`);
    return output;
}

/**
 * Reads in a file containing all descriptive unit data (data that describes qualities of a unit).
 * @param {number} fileNumber The starting unit id of the read file, a multiple of 100.
 * @param {import("../data/unit-data.js").LEVEL_CAP[]} levelCaps A list of all valid level cap types.
 * @returns {Promise<any>} An unfinited unit object.
 */
async function readDescriptiveData(fileNumber, levelCaps) {
    return fetch(`./assets/unit_data/units_${fileNumber}.csv`)
        .then(r => r.text())
        .then(t => Papa.parse(t, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true
        }).data)
        .then(entries => entries.map((/** @type {any} */ entry) => {
                let levelType = levelCaps.find((/** @type {{ Type: any; }} */ t) => t.Type === entry.LevelCapFormat);
                if(!levelType) {
                    levelType = levelCaps.find((/** @type {{ Type: string; }} */ t) => t.Type === "Default");
                }

                const unitData = {
                    id: entry.ID,
                    rarity: entry.Rarity,
                    in_EN: entry.InEN === "Y",
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
                    
                    if(unitData.id === 25) {
                        window.localStorage.setItem("bhtf", `${unitData.current_form > 1 ? "1" : "0"}`);
                    } else if(unitData.id === 127) {
                        window.localStorage.setItem("bloom", `${unitData.current_form > 1 ? "1" : "0"}`);
                    }
                } else if(entry.ID === 0) { // Cat must be at least level 1, ensures no weirdness with not owning any units
                    unitData.level = 1;
                }

                return unitData;
            })
        );
}

/**
 * Reads in a file containing all stat data (data that describes quantities of a unit).
 * @param {number} fileNumber The starting unit id of the read file, a multiple of 100.
 * @returns {Promise<any>} An unfinished unit object.
 */
async function readStatData(fileNumber) {
    const output = [];

    await fetch(`./assets/unit_data/unit_abilities_${fileNumber}.csv`)
        .then(r => r.text())
        .then(t => Papa.parse(t, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true
        }).data)
        .then(entries => {
            for(const entry of entries) {
                const outputObj = {
                    cost: parseInt(entry.Cost),
                    health: parseInt(entry.Health),
                    damage: parseInt(entry.Damage),
                    range: parseInt(entry.Range),
                    knockbacks: parseInt(entry.KBCount),
                    speed: parseInt(entry.Speed),
                    cooldown: parseFloat(entry.Cooldown),
                    has_area: entry.HasArea === "T",
                    abilities: entry.Abilities?.split("-") ?? []
                };

                if(entry.Traits === "All") {
                    outputObj.traits = [...SETTINGS.traits];
                } else if(entry.Traits === "Non-Metal") {
                    outputObj.traits = SETTINGS.traits.filter(t => t != "Metal");
                } else {
                    outputObj.traits = entry.Traits?.split("-") ?? [];
                }

                const id = parseInt(entry.ID) - fileNumber;
                if(output[id]) {
                    output[id].push(outputObj);
                } else {
                    output[id] = [outputObj];
                }
            }
        });

    return output;
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
 * @returns {import("../data/unit-data.js").TALENT[]} A list of parsed talents.
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
 * @returns {{cgs: boolean, abilities: { level: number, plus: number }[]}} All upgrades' initial values.
 */
export function parseUpgrades() {
    const abilityIconLevels = window.localStorage.getItem("abo");
    let upgradeData, upgradeUR = 0;

    if(!abilityIconLevels) {
        upgradeData = SETTINGS.abilities.abilityNames.map((/** @type {any} */ _) => { return {
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

    window.localStorage.setItem("ur", `${parseInt(window.localStorage.getItem("ur") ?? "0") + upgradeUR}`);
    return { cgs: window.localStorage.getItem("cgs") === "1", abilities: upgradeData };
}

/**
 * Parses loadouts from localStorage.
 * @returns {import("../data/loadout-data.js").LOADOUT[]} Parsed loadouts.
 */
export function parseLoadouts() {
    const llp = window.localStorage.getItem("llp");
    if(llp?.trim()) {
        return llp.split(" ").map(b64 => JSON.parse(window.atob(b64)));
    }

    return [];
}