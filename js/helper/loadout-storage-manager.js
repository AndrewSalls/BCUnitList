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
 * @property {import("./parse-file.js").LOADOUT_UNIT_DATA[]} units
 * @property {number[]} forms
 * @property {[number, number, number]} baseLevels
 */

/**
 * Manages all loadouts, saving them to a single localStorage item.
 */
export default class LoadoutManager {
    constructor() {
        if(window.localStorage.getItem("llp")) {
            //@ts-ignore All localStorage values are automatically initialized if not set.
            this.loadouts = window.localStorage.getItem("llp").split(" ");
        } else {
            this.loadouts = [];
        }
    }

    /**
     * Updates an index with a new loadout value.
     * @param {number} index The index of the loadout to add or modify.
     * @param {LOADOUT} change The updated loadout.
     */
    update(index, change) {
        this.loadouts[index] = window.btoa(JSON.stringify(change));
        window.localStorage.setItem("llp", this.loadouts.join(" "));
    }

    /**
     * Removes a loadout from memory.
     * @param {number} index The index of the loadout to be removed.
     */
    remove(index) {
        this.loadouts.splice(index, 1);
        window.localStorage.setItem("llp", this.loadouts.join(" "));
    }
}