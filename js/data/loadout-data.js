//@ts-check

/**
 * @typedef LOADOUT
 * @property {string} title
 * @property {number[]} units
 * @property {number[]} forms
 * @property {[number, number, number]} baseLevels
 * 
 * @typedef FULL_LOADOUT
 * @property {string} title
 * @property {import("../data/unit-data").LOADOUT_UNIT_DATA[]} units
 * @property {number[]} forms
 * @property {[number, number, number]} baseLevels
 */

/**
 * A class containing all loadout data.
 */
export default class LoadoutData {
    #loadouts;
    #loadoutEncodings;

    /**
     * Creates a new LoadoutData object with previously existing loadouts.
     * @param {LOADOUT[]} loadouts 
     */
    constructor(loadouts) {
        this.#loadouts = loadouts;
        this.#loadoutEncodings = loadouts.map(l => window.btoa(JSON.stringify(l)));
    }

    /**
     * Gets all loadouts.
     * @returns {LOADOUT[]} An ordered list of existing loadouts.
     */
    getLoadouts() {
        return this.#loadouts;
    }
    
    /**
    * Updates an the loadout at the provided index to the provided values, or creates the loadout if there is no loadout at that index.
    * @param {number} index The index of the loadout to add or modify.
    * @param {LOADOUT} newLoadout The updated loadout.
    */
    updateLoadout(index, newLoadout) {
        this.#loadouts[index] = newLoadout;
        this.#loadoutEncodings[index] = window.btoa(JSON.stringify(newLoadout));
        window.localStorage.setItem("llp", this.#loadoutEncodings.join(" "));
    }

    /**
     * Removes a loadout from memory.
     * @param {number} index The index of the loadout to be removed.
     */
    removeLoadout(index) {
        this.#loadouts.splice(index, 1);
        this.#loadoutEncodings.splice(index, 1);
        window.localStorage.setItem("llp", this.#loadoutEncodings.join(" "));
    }
}