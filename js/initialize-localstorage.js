//@ts-check
import SETTINGS from "../assets/settings.js";

/**
 * @readonly
 */
const DEFAULT_SETTINGS = {
    "f1": "0", "f2": "1", "f3": "0", "f4": "1", "f5": "1",
    "s1": "0", "s2": "1", "s3": "0", "s4": "0", "s5": "0", "s6": "0", "s7": "0"
};

/**
 * Sets a local storage key if it is not already set.
 * @param {string} key The key to check.
 * @param {string} defaultValue The value to set the key to if it doesn't already have a value.
 */
function setIfUnset(key, defaultValue) {
    if(window.localStorage.getItem(key) === null) {
        window.localStorage.setItem(key, defaultValue);
    }
}

/**
 * Initializes all important localStorage values, for any unset values.
 * @param {import("./data/category-data").CATEGORY_MAP} categories An object containing all categories. 
 */
export default function initializeLocalStorage(categories) {
    // Site Settings --------------------------------------------
    for(const key of Object.keys(DEFAULT_SETTINGS)) {
        setIfUnset(key, DEFAULT_SETTINGS[key]);
    }

    // Site unit sort settings --------------------------------------------
    setIfUnset("skey", "0");
    setIfUnset("sasc", "Y");
    
    // Categories --------------------------------------------
    for(const superCategory of Object.keys(categories)) {
        const superKey = `gk-${superCategory}`;
        const subLength = Object.keys(categories[superCategory]).length + 1;
        setIfUnset(superKey, "1".repeat(subLength));

        const value = window.localStorage.getItem(superKey) ?? "";
        if(value.length < subLength) {
            window.localStorage.setItem(superKey, value.padEnd(subLength, "1"));
        }
    }
    setIfUnset("gk-custom", "1");

    // Treasures --------------------------------------------
    for(const chapterAbrv of Object.keys(SETTINGS.chapters)) {
        for(let x = 0; x < SETTINGS.chapters[chapterAbrv].numberChapters; x++) {
            setIfUnset(`${chapterAbrv}_${x}`, "-0-0-0".repeat(SETTINGS.chapters[chapterAbrv].treasurePartCount.length).substring(1));
        }
    }
    
    // Base Development --------------------------------------------
    setIfUnset("oo_1", "0-0-1"); // starting foundation is level 1
    for(let b = 2; b <= SETTINGS.ototo.names.length; b++) {
        setIfUnset(`oo_${b}`, "0-0-0");
    }
    
    // Ability Upgrades --------------------------------------------
    setIfUnset("abo", "1+0-".repeat(SETTINGS.abilities.abilityNames.length).substring(0, SETTINGS.abilities.abilityNames.length * 4 - 1));
    setIfUnset("cgs", "0");

    // Other Cat Base --------------------------------------------
    setIfUnset("ur", "0");
    setIfUnset("akl", "0");
    setIfUnset("akb", "0");

    // Save Metadata --------------------------------------------
    window.localStorage.setItem("lg", SETTINGS.gameVersion);
    window.localStorage.setItem("ls", SETTINGS.version);
}