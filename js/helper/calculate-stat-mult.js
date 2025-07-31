//@ts-check
import ORB_MAP from "../../assets/orb-map.js";
import SETTINGS from "../../assets/settings.js";
import TALENT_GROWTH_MAP from "../../assets/talent-growth.js";
import { RARITY } from "../data/unit-data.js";
import { CALCULATOR_LEVEL_OPTIONS } from "./calculate-stats.js";

/**
 * Calculates a unit's stats not accounting for any enemy properties.
 * @param {number} baseStat The initial stat of the unit at level 1.
 * @param {number} totalLevel The unit's level.
 * @param {number} id The unit's id.
 * @param {RARITY} rarity The unit's rarity.
 * @param {number} treasureMult The stat multiplier caused by treasures.
 * @returns {number} The unit's stats after multipliers and level are taken into account.
 */
export function getLevelStatMult(baseStat, totalLevel, id, rarity, treasureMult) {
    let bp1 = Infinity, bp2 = Infinity;
    if(`${id}` in SETTINGS.statGrowth.unique) {
        bp1 = SETTINGS.statGrowth.unique[id]?.[0] ?? bp1;
        bp2 = SETTINGS.statGrowth.unique[id]?.[1] ?? bp2;
    } else if(`${id}` in SETTINGS.statGrowth.P2W) {
        return getP2WStatMult(baseStat, totalLevel, SETTINGS.statGrowth.P2W[id], treasureMult);
    } else {
        bp1 = SETTINGS.statGrowth.rarity[rarity]?.[0] ?? bp1;
        bp2 = SETTINGS.statGrowth.rarity[rarity]?.[1] ?? bp2;
    }

    let levelMult = Math.min(bp1, totalLevel) * 0.2 + 0.8; // + 20% per level, starting at 100%
    
    if(totalLevel > bp1) {
        levelMult += (Math.min(bp2, totalLevel) - bp1) * 0.1; // After break point 1, + 10% per level

        if(totalLevel > bp2) {
            levelMult += (totalLevel - bp2) * 0.05; // After break point 2, + 5% per level
        }
    }

    return Math.floor(Math.round(baseStat * levelMult) * treasureMult);
}

/**
 * Calculates a unit's stats not accounting for any enemy properties, for a unit with custom level multiplier breakpoints.
 * @param {number} baseStat The initial stat of the unit at level 1.
 * @param {number} totalLevel The unit's level.
 * @param {number[][]} statObj An array consisting of the unit's level breakpoints, and what the stat multiplier changes to at each breakpoint.
 * @param {number} treasureMult The stat multiplier caused by treasures.
 * @returns {number} The unit's stats after multipliers and level are taken into account.
 */
export function getP2WStatMult(baseStat, totalLevel, statObj, treasureMult) {
    if(totalLevel > statObj[statObj.length - 1][0]) {
        console.error(`Missing stat growth for P2W unit`);
    }

    let levelMult = 1 - statObj[0][1]; // Ensures level 1 unit has stat multiplier of 1.
    let prevGrowthLevel = 0;

    for(let x = 0; x < statObj.length && statObj[x][0] >= totalLevel; x++) {
        levelMult += (Math.min(totalLevel, statObj[x][0]) - prevGrowthLevel) * statObj[x][1];
        prevGrowthLevel = statObj[x][0];
    }

    return Math.floor(Math.round(baseStat * levelMult) * treasureMult);
}

/**
 * Gets the percent treasure completion for a specified treasure.
 * Percent is calculated as the average percent treasure completion for each chapter, where a gold treasure is worth 100% completion, a silver 66%, and a bronze 33%
 * @param {string} treasureName The name of the treasure to get the percent for.
 * @param {string} chapterAbbr The abbreviated name as seen in settings.js of the chapter the treasure is from.
 * @returns {number} A percent from 0 to 300%, where 100% corresponds to all gold treasures in a single chapter.
 */
export function getTreasurePercent(treasureName, chapterAbbr) {
    const treasureIndex = SETTINGS.chapters[chapterAbbr].treasureNames.indexOf(treasureName);
    const treasureLevelStartPos = 3 * treasureIndex;
    const numTreasures = SETTINGS.chapters[chapterAbbr].treasurePartCount[treasureIndex];
    let sum = 0;

    for(let x = 0; x < SETTINGS.chapters[chapterAbbr].numberChapters; x++) {
        const treasureLevels = window.localStorage.getItem(`${chapterAbbr}_${x}`)?.split("-") ?? [];
        const bronzeAmt = parseInt(treasureLevels[treasureLevelStartPos]);
        const silverAmt = parseInt(treasureLevels[treasureLevelStartPos + 1]);
        const goldAmt = parseInt(treasureLevels[treasureLevelStartPos + 2]);

        // Treasures only activate if at least bronze is obtained for all parts
        if(bronzeAmt + silverAmt + goldAmt === numTreasures) {
            sum += bronzeAmt + 2 * silverAmt + 3 * goldAmt;
        }
    }

    return sum / (3 * numTreasures);
}

/**
 * Gets a unit's level after considering calculator options.
 * @param {CALCULATOR_LEVEL_OPTIONS} levelOption What level option is desired.
 * @param {number} currentLevel The unit's current level.
 * @param {import("../data/unit-data.js").UNIT_DATA} unitData The unit's fixed level data.
 * @returns {number} The level to use for the unit.
 */
export function getDesiredLevel(levelOption, currentLevel, unitData) {
    switch(levelOption) {
        case CALCULATOR_LEVEL_OPTIONS.LEVEL_1:
            return 1;
        case CALCULATOR_LEVEL_OPTIONS.LEVEL_30:
            return 30;
        case CALCULATOR_LEVEL_OPTIONS.LEVEL_50:
            return 50;
        case CALCULATOR_LEVEL_OPTIONS.LEVEL_CURRENT:
            return currentLevel;
        case CALCULATOR_LEVEL_OPTIONS.LEVEL_MAX:
            return unitData.level_cap.MaxLevel + unitData.level_cap.MaxPlusLevel;
        default:
            console.error(`Unexpected CALCULATOR_LEVEL_OPTIONS value: ${levelOption}`);
            return -1;
    }
}

/**
 * Calculates the effect of trait-specific abilities on damage.
 * @param {import("../data/unit-data").UNIT_DATA} fixedData Values for the unit that cannot be modified. Also contains modifiable values, but these may be outdated and should not be used.
 * @param {import("../data/unit-data").UNIT_RECORD} updatedData Values for the unit that can be modified, e.g. level, talents, etc.
 * @param {import("./calculate-stats.js").CALCULATOR_OPTIONS} calculatorOptions The options which modify the displayed stats.
 * @param {string} statType The type of stat from SETTINGS.traitEffectMult to gather multipliers from.
 * @returns {number} The total multiplier to apply to the unit's stat because of the multiplier.
 */
export function getTraitSpecificMult(fixedData, updatedData, calculatorOptions, statType) {
    const unitTargetTraits = getUnitTraitTargets(fixedData, updatedData, calculatorOptions.includeTalents, calculatorOptions.talentIgnoreForm);

    // If enemy has no target traits, target trait multipliers don't take effect
    if(calculatorOptions.targetTraits.every(t => !unitTargetTraits.includes(t))) {
        return 1;
    }

    const traitTreasureMult = unitTargetTraits.filter(
        t => t in SETTINGS.traitEffectMult.trait && calculatorOptions.targetTraits.includes(t)
    ).map(
        t => getTreasurePercent(SETTINGS.traitEffectMult.trait[t][0], SETTINGS.traitEffectMult.trait[t][1])
    ).reduce((pre, curr) => Math.max(pre, curr), 0);

    let cumulativeMult = 1;
    for(const ability of Object.keys(SETTINGS.traitEffectMult[statType])) {
        if(hasAbility(ability, fixedData, updatedData, calculatorOptions.includeTalents, calculatorOptions.talentIgnoreForm)) {
            // Additional filter is because orbs that modify trait-specific abilities only work if unit targets that trait
            const orbAddition = getEffectOrb(ability, calculatorOptions.targetTraits, updatedData) // @ts-ignore Type hints do not detect that filter prevents null orbs from being reduced
                .filter(o => unitTargetTraits.includes(ORB_MAP.traits[o.trait])) // @ts-ignore Type hints do not detect that filter prevents null orbs from being reduced
                .reduce((prev, next) => prev + ORB_MAP.type_mults[statType][ability][next.rank], 0);
            let multiplier = SETTINGS.traitEffectMult[statType][ability][0] + (traitTreasureMult * SETTINGS.traitEffectMult[statType][ability][1] / 3);

            if(calculatorOptions.includeOrbs) {
                if(statType === "def" && orbAddition > 0) {
                    multiplier *= orbAddition;
                } else if(statType === "atk" && orbAddition > 0) {
                    multiplier += orbAddition;
                }
            }

            cumulativeMult *= multiplier;
        }
    }

    return cumulativeMult;
}

/**
 * Obtains all traits that the unit can currently target.
 * @param {import("../data/unit-data").UNIT_DATA} fixedData Values for the unit that cannot be modified. Also contains modifiable values, but these may be outdated and should not be used.
 * @param {import("../data/unit-data").UNIT_RECORD} updatedData Values for the unit that can be modified, e.g. level, talents, etc.
 * @param {boolean} includeTalents Whether talents should be included when looking for abilities.
 * @param {boolean} talentIgnoreForm Whether talents should only be included when the unit's form is high enough for the talents to take effect.
 * @returns {string[]} A list of targetted traits.
 */
export function getUnitTraitTargets(fixedData, updatedData, includeTalents, talentIgnoreForm) {
    let targetTraits = new Set(fixedData.stats[updatedData.current_form].traits);    

    for(const trait of SETTINGS.traits) {
        if(!targetTraits.has(trait) && hasAbility(`Target_${trait}`, fixedData, updatedData, includeTalents, talentIgnoreForm)) {
            targetTraits.add(trait);
        }
    }

    return [...targetTraits];
}

/**
 * Checks if a unit currently has an ability active.
 * @param {string} abilityName The name of the ability to check for.
 * @param {import("../data/unit-data").UNIT_DATA} fixedData Values for the unit that cannot be modified. Also contains modifiable values, but these may be outdated and should not be used.
 * @param {import("../data/unit-data").UNIT_RECORD} updatedData Values for the unit that can be modified, e.g. level, talents, etc.
 * @param {boolean} includeTalents Whether talents should be included when looking for abilities.
 * @param {boolean} talentIgnoreForm Whether talents should only be included when the unit's form is high enough for the talents to take effect.
 * @returns {boolean} Whether the unit has the ability.
 */
export function hasAbility(abilityName, fixedData, updatedData, includeTalents, talentIgnoreForm) {
    let foundAbility = fixedData.stats[updatedData.current_form].abilities.includes(abilityName);
    
    if(includeTalents && !foundAbility && (talentIgnoreForm || updatedData.current_form >= 2)) {
        const talentIndex = fixedData.talents.findIndex(t => t.name === abilityName);
        foundAbility = talentIndex !== -1 && updatedData.talents[talentIndex] === 1;
    }

    if(includeTalents && !foundAbility && (talentIgnoreForm || updatedData.current_form >= 3)) {
        const talentIndex = fixedData.ultra_talents.findIndex(t => t.name === abilityName);
        foundAbility = talentIndex !== -1 && updatedData.ultra_talents[talentIndex] === 1;
    }

    return foundAbility;
}

/**
 * Filters a unit's orbs to get only ones that are active for the provided orb type.
 * @param {string} ability The ability to get orbs for.
 * @param {string[]} targetTraits A list of targeted traits which the unit may or may not effect.
 * @param {import("../data/unit-data").UNIT_RECORD} updatedData Values for the unit that can be modified, e.g. level, talents, etc.
 * @returns {import("../data/unit-data.js").ORB[]} A list of all orbs that match the target trait and ability.
 */
export function getEffectOrb(ability, targetTraits, updatedData) {
    return updatedData.orb.filter(o =>
        o &&
        o.trait < ORB_MAP.traits.length &&
        targetTraits.includes(ORB_MAP.traits[o.trait]) &&
        ORB_MAP.encoded_types[o.type] === ability);
}

/**
 * Filters a unit's orbs to get only ones that are active for the provided orb type.
 * @param {string} ability The ability to get orbs for.
 * @param {import("../data/unit-data").UNIT_RECORD} updatedData Values for the unit that can be modified, e.g. level, talents, etc.
 * @returns {import("../data/unit-data.js").ORB[]} A list of all orbs that match the target ability.
 */
export function getAbilityOrb(ability, updatedData) {
    return updatedData.orb.filter(o =>
        o &&
        o.trait === 99
        && ORB_MAP.abilities[o.type] === ability);
}

/**
 * Gets the multiplier to a stat for an talent.
 * @param {string} talentName The name of the ability to check for.
 * @param {import("../data/unit-data").UNIT_DATA} fixedData Values for the unit that cannot be modified. Also contains modifiable values, but these may be outdated and should not be used.
 * @param {import("../data/unit-data").UNIT_RECORD} updatedData Values for the unit that can be modified, e.g. level, talents, etc.
 * @param {boolean} talentIgnoreForm Whether the talent stat modifiers should apply regardless of unit form.
 * @returns {number} The total change to apply to the stat based on its multiplier.
 */
export function getTalentStatMod(talentName, fixedData, updatedData, talentIgnoreForm) {
    let mult = 0;

    if(talentIgnoreForm || updatedData.current_form >= 2) {
        for(let x = 0; x < fixedData.talents.length; x++) {
            if(fixedData.talents[x].name === talentName) {
                if(TALENT_GROWTH_MAP.talents[fixedData.id]?.[talentName]) {
                    if(typeof TALENT_GROWTH_MAP.talents[fixedData.id][talentName] === "number") {
                        mult += TALENT_GROWTH_MAP.talents[fixedData.id][talentName] * updatedData.talents[x];
                    } else {
                        mult += TALENT_GROWTH_MAP.talents[fixedData.id][talentName][0];
                        mult += TALENT_GROWTH_MAP.talents[fixedData.id][talentName][1] * updatedData.talents[x];
                    }
                } else {
                    mult += TALENT_GROWTH_MAP[talentName] * updatedData.talents[x];
                }
            }
        }
    }
    if(talentIgnoreForm || updatedData.current_form >= 3) {
        for(let x = 0; x < fixedData.ultra_talents.length; x++) {
            if(fixedData.ultra_talents[x].name === talentName) {
                if(TALENT_GROWTH_MAP.ultra_talents[fixedData.id]?.[talentName]) {
                    if(typeof TALENT_GROWTH_MAP.ultra_talents[fixedData.id][talentName] === "number") {
                        mult += TALENT_GROWTH_MAP.ultra_talents[fixedData.id][talentName] * updatedData.ultra_talents[x];
                    } else {
                        mult += TALENT_GROWTH_MAP.ultra_talents[fixedData.id][talentName][0];
                        mult += TALENT_GROWTH_MAP.ultra_talents[fixedData.id][talentName][1] * updatedData.ultra_talents[x];
                    }
                } else {
                    mult += TALENT_GROWTH_MAP[talentName] * updatedData.ultra_talents[x];
                }
            }
        }
    }
    
    return mult;
}