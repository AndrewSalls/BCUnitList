//@ts-check

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
 * @param {Object} settings An object containing all site settings. 
 * @param {Object} categories An object containing all categories. 
 */
export default function initializeLocalStorage(settings, categories) {
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
    for(const chapterAbrv of Object.keys(settings.chapters)) {
        for(let x = 0; x < settings.chapters[chapterAbrv].numberChapters; x++) {
            setIfUnset(`${chapterAbrv}_${x}`, "-0-0-0".repeat(settings.chapters[chapterAbrv].treasurePartCount.length).substring(1));
        }
    }
    
    // Base Development --------------------------------------------
    for(let b = 1; b <= settings.ototo.names.length; b++) {
        setIfUnset(`oo_${b}`, "0-0-0");
    }
    
    // Ability Upgrades --------------------------------------------
    setIfUnset("abo", "1+0-".repeat(settings.abilities.abilityNames.length).substring(0, settings.abilities.abilityNames.length * 4 - 1));
    setIfUnset("cgs", "0");

    // Other Cat Base --------------------------------------------
    setIfUnset("akl", "0");
    setIfUnset("akb", "0");

    // Save Metadata --------------------------------------------
    window.localStorage.setItem("lg", settings.gameVersion);
    window.localStorage.setItem("ls", settings.version);
}