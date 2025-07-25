//@ts-check
import { encodeUnitEntry } from "../helper/encoder.js";
import getCostsFor from "../helper/find-costs.js";
import { isGloballyFiltered } from "../unit-table/filter-functions.js";

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
 * @typedef UNIT_STATS
 * @property {number} cost
 * @property {number} health
 * @property {number} damage
 * @property {number} range
 * @property {number} knockbacks
 * @property {number} speed
 * @property {number} cooldown
 * @property {boolean} has_area
 * @property {string[]} traits
 * @property {string[]} abilities
 * 
 * @typedef UNIT_DATA
 * @property {number} id
 * @property {RARITY} rarity
 * @property {boolean} in_EN
 * @property {boolean} collab
 * @property {boolean} unobtainable
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
 * @property {UNIT_STATS[]} stats
 */

/**
 * @readonly
 * @enum {string}
 */
export const UNIT_DATA_TYPE = {
    UNIT: "unit",
    OWNED_FORM_NAMES: "owned name",
    FORM_NAMES: "name",
    COST: "cost"
}

export default class UnitData {
    #unitData;

    /**
     * Creates a new unit data object.
     * @param {UNIT_DATA[]} unitData A list of every unit's data.
     */
    constructor(unitData) {
        this.#unitData = unitData;
    }

    /**
     * Gets a singular unit.
     * @param {number} id The unit's ID.
     * @param {UNIT_DATA_TYPE} dataType What type of data is being obtained.
     * @param {boolean} checkIfFiltered If true and the unit is hidden by a global filter, returns null.
     * @returns {any} The requested data for the unit, minus any data for filtered units.
     */
    getUnitData(id, dataType, checkIfFiltered) {
        return this.getUnitListData([id], dataType, checkIfFiltered);
    }

    /**
     * Gets multiple units.
     * @param {number[]} unitIDs A list of unit IDs to get.
     * @param {UNIT_DATA_TYPE} dataType What type of data is being obtained.
     * @param {boolean} checkIfFiltered If true and the unit is hidden by a global filter, returns null.
     * @returns {any} The requested data for the unit, minus any data for filtered units.
     */
    getUnitListData(unitIDs, dataType, checkIfFiltered) {
        const output = [];

        for(const id of unitIDs) {
            if(!(checkIfFiltered && isGloballyFiltered(this.#unitData[id]))) {
                output.push(this.#unitData[id]);
            }
        }

        return this.#getDataType(output, dataType);
    }

    /**
     * Gets all units, optionally filtering them by a conditional.
     * @param {((unit: UNIT_DATA) => boolean)|null} filterFunction A function to filter the returned units, separate from the global filter check. Use null if no filter is desired.
     * @param {UNIT_DATA_TYPE} dataType What type of data is being obtained.
     * @param {boolean} checkIfFiltered If true and the unit is hidden by a global filter, returns null.
     * @returns {any} The requested data for the unit, minus any data for filtered units.
     */
    getAllUnitData(filterFunction, dataType, checkIfFiltered) {
        if(filterFunction) {
            return this.#getDataType(this.#unitData.filter(u => filterFunction(u) && !(checkIfFiltered && isGloballyFiltered(u))), dataType);
        }

        return this.#getDataType(this.#unitData.filter(u => !(checkIfFiltered && isGloballyFiltered(u))), dataType);
    }

    /**
     * Updates a unit's customizable attributes based on the provided values.
     * @param {UNIT_RECORD} data The values to update the unit with.
     */
    updateUnit(data) {
        const id = data.id;
    
        this.#unitData[id].current_form = data.current_form ?? this.#unitData[id].current_form;
    
        const oldURCount = this.#unitData[id].level + this.#unitData[id].plus_level;
        this.#unitData[id].level = data.level ?? this.#unitData[id].level;
        this.#unitData[id].plus_level = data.plus_level ?? this.#unitData[id].plus_level;
        const userRankDelta = this.#unitData[id].level + this.#unitData[id].plus_level - oldURCount;
    
        if(data.talents) {
            for(let i = 0; i < this.#unitData[id].talents.length; i++) {
                this.#unitData[id].talents[i].value = data.talents[i];
            }
        }
        if(data.ultra_talents) {
            for(let i = 0; i < this.#unitData[id].ultra_talents.length; i++) {
                this.#unitData[id].ultra_talents[i].value = data.ultra_talents[i];
            }
        }
        this.#unitData[id].orb = data.orb ?? this.#unitData[id].orb;
        this.#unitData[id].favorited = data.favorited ?? this.#unitData[id].favorited;
        this.#unitData[id].hidden = data.hidden ?? this.#unitData[id].hidden;
    
        const entry = encodeUnitEntry(data);
        if(entry !== "") {
            window.localStorage.setItem(`${data.id}`, entry);
        } else {
            window.localStorage.removeItem(`${data.id}`);
        }

        window.localStorage.setItem("ur", `${parseInt(window.localStorage.getItem("ur") ?? "0") + userRankDelta}`);
    }

    /**
     * Gets a requested data attribute for all provided units.
     * @param {UNIT_DATA[]} units The units to get the requested data type for.
     * @param {UNIT_DATA_TYPE} dataType The type of data to get per unit.
     * @returns {any} The converted data.
     */
    #getDataType(units, dataType) {
        switch(dataType) {
            case UNIT_DATA_TYPE.UNIT:
                return units;
            case UNIT_DATA_TYPE.COST:
                return getCostsFor(units);
            case UNIT_DATA_TYPE.FORM_NAMES:
                return units.map(u => [u.id, u.normal_form, u.evolved_form, u.true_form, u.ultra_form]);
            case UNIT_DATA_TYPE.OWNED_FORM_NAMES:
                return units.filter(u => u.level > 0).map(u => [u.id, u.normal_form, u.evolved_form, u.true_form, u.ultra_form].slice(0, u.current_form + 2));
            default:
                console.error(`Invalid data type requested: ${dataType}`);
        }
    }
}

/**
 * Converts unit data to a unit record.
 * @param {UNIT_DATA} unitData The unconverted data.
 * @returns {UNIT_RECORD} The convered data.
 */
export function dataToRecord(unitData) {
    return {
        id: unitData.id,
        current_form: unitData.current_form,
        level: unitData.level,
        plus_level: unitData.plus_level,
        talents: unitData.talents.map(t => t.value),
        ultra_talents: unitData.ultra_talents.map(u => u.value),
        orb: unitData.orb,
        favorited: unitData.favorited,
        hidden: unitData.hidden
    };
}