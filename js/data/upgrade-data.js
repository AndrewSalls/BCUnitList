//@ts-check
import SETTINGS from "../../assets/settings.js";

/**
 * @typedef {{level: number, plus: number}} ABILITY_LEVEL
 * @typedef {{cgs: boolean, abilities: ABILITY_LEVEL[]}} UPGRADE_DATA
 */

/**
 * A class containing all upgrade data.
 */
export default class UpgradeData {
    #cgs;
    #abilities;

    /**
     * Creates an object containing the provided upgrade data.
     * @param {UPGRADE_DATA} upgradeData The initial upgrade values.
     */
    constructor(upgradeData) {
        this.#cgs = upgradeData.cgs;
        this.#abilities = upgradeData.abilities;
    }


    /**
     * Gets the value of CGS.
     * @returns {boolean} The state of CGS (owned/unowned).
     */
    getCGS() {
        return this.#cgs;
    }
    
    /**
     * Gets an upgrade's value.
     * @param {number} index The index of the ability in the upgrade data.
     * @returns {ABILITY_LEVEL} The values of the ability.
     */
    getAbility(index) {
        return this.#abilities[index];
    }

    /**
     * Gets the value of all abilities.
     * @returns {ABILITY_LEVEL[]} The values of all abilities.
     */
    getAllAbilities() {
        return this.#abilities;
    }

    /**
     * Gets the total XP cost to max the level of all upgrades.
     * @returns {number} The XP cost of all upgrades.
     */
    getUpgradeCosts() {
        let xpAmt = 0;

        if(!this.#cgs) {
            xpAmt += SETTINGS.abilities.costs.CGSxpAmt;
        }

        for(let x = 0; x < this.#abilities.length; x++) {
            const costTable = SETTINGS.abilities.costs.xpAmt[SETTINGS.abilities.costs.costTypes[x]];
            for(let y = /** @type {{ plus: number; level: number; }} */ (this.#abilities[x]).level; y < SETTINGS.abilities.levelCaps[x]; y++) {
                xpAmt += costTable[y];
            }
        }

        return xpAmt;
    }

    /**
     * Sets the owned state for CGS.
     * @param {boolean} owned Whether CGS is owned or not.
     */
    updateCGS(owned) {
        window.localStorage.setItem("cgs", owned ? "1" : "0");
        this.#cgs = owned;
    }

    /**
     * Updates an ability with specified values.
     * @param {number} index The index of the ability in stored data.
     * @param {number} newLevel The value to apply to the ability's level.
     * @param {number} newPlusLevel The value to apply to the ability's plus level.
     * @returns {number} The change in user rank from applying the ability.
     */
    updateAbility(index, newLevel, newPlusLevel) {
        let urChange = newLevel - this.#abilities[index].level;
        this.#abilities[index].level = newLevel;

        urChange += (newPlusLevel - this.#abilities[index].plus);
        this.#abilities[index].plus = newPlusLevel;

        window.localStorage.setItem("abo", this.#abilities.map(v => `${v.level}+${v.plus}`).join("-"));
        return urChange;
    }
}