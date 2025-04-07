//@ts-check
import createArrowNumberBox from "./arrow-box.js";

/**
 * Loads the Upgrades tab of the cat base.
 * @param {Object} settings An object containing the settings from assets/settings.js .
 * @param {Object} initialUpgrades All upgrade starting values.
 * @param {(index: number, level: number, plusLevel: number) => void} upgradeUpdate A function called whenever an upgrade value is changed in the info.
 */
export default async function loadUpgradeInfo(settings, initialUpgrades, upgradeUpdate) {
    const wrapper = /** @type {!HTMLDivElement} */ (document.querySelector("#upgrade-selector"));

    wrapper?.appendChild(createCGSBox(initialUpgrades[0] === 1, upgradeUpdate));

    for(let x = 0; x < settings.abilities.abilityNames.length; x++) {
        wrapper?.appendChild(createUpgradeLevelBox(settings.abilities.abilityNames[x], settings.abilities.abilityLevelCap, settings.abilities.abilityPlusLevelCap, initialUpgrades[x + 1], x, upgradeUpdate));
    }

    const rangeUpgrade = wrapper.querySelectorAll(".upgrade-box").item(settings.abilities.rangePosition + 1);
    if(rangeUpgrade) {
        const upgradeLevel = /** @type {HTMLInputElement} */ (rangeUpgrade.querySelector(".upgrade-level"));
        if(upgradeLevel) {
            upgradeLevel.max = settings.abilities.rangeLevelCap;
        }
        rangeUpgrade.querySelector(".upgrade-plus-text")?.classList.add("hidden");
        rangeUpgrade.querySelector(".upgrade-plus-level")?.classList.add("hidden");
    }
}

/**
 * Creates an input for God being unlocked.
 * @param {boolean} isOwned Whether this upgrade is owned already.
 * @returns {HTMLDivElement} An element containing an input for God's unlock status.
 * @param {(index: number, level: number, plusLevel: number) => void} upgradeUpdate A function called whenever an upgrade value is changed in the info.
 */
function createCGSBox(isOwned, upgradeUpdate) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("v-align");
    wrapper.classList.add("upgrade-box");

    const title = document.createElement("h4");
    title.textContent = "The Cat God";

    const image = document.createElement("img");
    image.src = `./assets/img/upgrades/cat_god.png`;

    const ownedWrapper = document.createElement("div");
    ownedWrapper.classList.add("h-align");
    
    const ownedLabel = document.createElement("label");
    ownedLabel.textContent = "Owned?";
    
    const ownedCheckbox = document.createElement("input");
    ownedCheckbox.id = "the-one-true-cat";
    ownedCheckbox.type = "checkbox";
    ownedCheckbox.title = "Have you purchased The Cat God [not to be confused with Cat God (Cool Dude)]";
    ownedCheckbox.checked = isOwned;
    ownedCheckbox.onchange = () => upgradeUpdate(0, ownedCheckbox.checked ? 1 : 0, 0);

    ownedWrapper.append(ownedLabel, ownedCheckbox);
    wrapper.append(title, image, ownedWrapper);
    return wrapper;
}

/**
 * Creates an input for an ability's level and plus level.
 * @param {string} name The name of the ability.
 * @param {number} levelCap The regular level cap.
 * @param {number} levelPlusCap The plus level cap.
 * @param {{ plus: number; level: number; }} currentLevelData The initial values for level and plus level inputs.
 * @param {number} id The position of the ability in the various arrays representing the ability in assets/settings.js
 * @returns {HTMLDivElement} An element containing the inputs for a level and plus level.
 * @param {(index: number, level: number, plusLevel: number) => void} upgradeUpdate A function called whenever an upgrade value is changed in the info.
 */
function createUpgradeLevelBox(name, levelCap, levelPlusCap, currentLevelData, id, upgradeUpdate) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("v-align");
    wrapper.classList.add("upgrade-box");

    const title = document.createElement("h4");
    title.textContent = name;

    const image = document.createElement("img");
    image.src = `./assets/img/upgrades/ability_${id}.png`;

    const levelWrapper = document.createElement("div");
    levelWrapper.classList.add("h-align");

    let levelInput, plusLevelInput;
    
    const userRankDisplay = /** @type {!HTMLParagraphElement} */ (document.querySelector("#user-rank"));
    const [plusLevelElm, plusInputElm] = createArrowNumberBox(levelPlusCap, currentLevelData.plus, (oldValue, newValue) => {
        //@ts-ignore
        userRankDisplay.textContent = `${parseInt(userRankDisplay.textContent) + (newValue - oldValue)}`;
        upgradeUpdate(id + 1, parseInt(levelInput.value), parseInt(plusLevelInput.value));
    });
    const [levelElm, levelInputElm] = createArrowNumberBox(levelCap, currentLevelData.level, (oldValue, newValue) => {
        //@ts-ignore
        userRankDisplay.textContent = `${parseInt(userRankDisplay.textContent) + (newValue - oldValue)}`;
        upgradeUpdate(id + 1, parseInt(levelInput.value), parseInt(plusLevelInput.value));
    }, 1);
    levelInput = levelInputElm;
    plusLevelInput = plusInputElm;

    levelElm.classList.add("upgrade-level");
    plusLevelElm.classList.add("upgrade-plus-level");

    const plusSign = document.createElement("p");
    plusSign.classList.add("upgrade-plus-text");
    plusSign.textContent = "+";

    levelWrapper.append(levelElm, plusSign, plusLevelElm);
    wrapper.append(title, image, levelWrapper);
    return wrapper;
}