//@ts-check
import CategoryData from "./category-data.js";
import LoadoutData from "./loadout-data.js";
import UnitData from "./unit-data.js";
import UpgradeData from "./upgrade-data.js";

/**
 * A class containing all user data.
 */
export default class UserData {
    unitData;
    upgradeData;
    categories;
    loadouts;
    sendMessage;

    /**
     * Creates a new user data object.
     * @param {import("./unit-data.js").UNIT_DATA[]} unitData A list of every unit's data.
     * @param {import("./upgrade-data.js").UPGRADE_DATA} upgradeData An object containing the data for all ability orbs.
     * @param {import("./category-data.js").CATEGORY_MAP} categories An object containing all categories and the units in each category.
     * @param {import("./loadout-data.js").LOADOUT[]} loadouts A list of all created loadouts.
     * @param {(message: string, isErrorMsg: boolean) => void} messageCallback A function to call when trying to display a message in the iframe.
     */
    constructor(unitData, upgradeData, categories, loadouts, messageCallback) {
        this.unitData = new UnitData(unitData);
        this.upgradeData = new UpgradeData(upgradeData);
        this.categories = new CategoryData(categories);
        this.loadouts = new LoadoutData(loadouts);
        this.sendMessage = messageCallback;
    }
}