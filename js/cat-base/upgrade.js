//@ts-check
import createArrowNumberBox from "./arrow-box.js";
import SETTINGS from "../../assets/settings.js";

/**
 * Loads the Upgrades tab of the cat base.
 * @param {import("../data/upgrade-data.js").UPGRADE_DATA} initialUpgrades All upgrade starting values.
 * @param {(owned: boolean) => Promise<void>} updateCGS A function called whenever CGS's ownership status changes.
 * @param {(index: number, level: number, plusLevel: number) => Promise<void>} updateAbility A function called whenever an ability's levels are modified.
 */
export default async function loadUpgradeInfo(initialUpgrades, updateCGS, updateAbility) {
    const wrapper = /** @type {!HTMLDivElement} */ (document.querySelector("#upgrade-selector"));

    wrapper?.appendChild(createCGSBox(initialUpgrades.cgs, updateCGS));

    for(let x = 0; x < SETTINGS.abilities.abilityNames.length; x++) {
        wrapper?.appendChild(createUpgradeLevelBox(SETTINGS.abilities.abilityNames[x], SETTINGS.abilities.levelCaps[x], SETTINGS.abilities.plusLevelCaps[x], initialUpgrades.abilities[x], x, updateAbility));
    }
}

/**
 * Creates an input for CGS being unlocked.
 * @param {boolean} isOwned Whether this upgrade is owned already.
 * @param {(owned: boolean) => Promise<void>} updateCGS A function called whenever CGS's ownership status changes.
 * @param {(owned: boolean) => void} updateCGS A function called whenever CGS's ownership status changes.
 */
function createCGSBox(isOwned, updateCGS) {
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
    ownedCheckbox.onchange = () => updateCGS(ownedCheckbox.checked);

    ownedWrapper.append(ownedLabel, ownedCheckbox);
    wrapper.append(title, image, ownedWrapper);
    return wrapper;
}

/**
 * Creates an input for an ability's level and plus level.
 * @param {string} name The name of the ability.
 * @param {number} levelCap The regular level cap.
 * @param {number} levelPlusCap The plus level cap.
 * @param {import("../data/upgrade-data.js").ABILITY_LEVEL} currentLevelData The initial values for level and plus level inputs.
 * @param {number} id The position of the ability in the various arrays representing the ability in assets/settings.js
 * @returns {HTMLDivElement} An element containing the inputs for a level and plus level.
 * @param {(index: number, level: number, plusLevel: number) => Promise<void>} updateAbility A function called whenever an ability's levels are modified.
 */
function createUpgradeLevelBox(name, levelCap, levelPlusCap, currentLevelData, id, updateAbility) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("v-align");
    wrapper.classList.add("upgrade-box");

    const title = document.createElement("h4");
    title.textContent = name;

    const image = document.createElement("img");
    image.src = `./assets/img/upgrades/ability_${id}.png`;

    const levelWrapper = document.createElement("div");
    levelWrapper.classList.add("h-align");

    let levelInput = null, plusLevelInput = null;
    
    const userRankDisplay = /** @type {!HTMLParagraphElement} */ (document.querySelector("#user-rank"));
    const [levelElm, levelInputElm] = createArrowNumberBox(levelCap, currentLevelData.level, (oldValue, newValue) => {
        userRankDisplay.textContent = `${parseInt(userRankDisplay.textContent ?? "0") + (newValue - oldValue)}`;
        updateAbility(id, parseInt(levelInput.value), parseInt(plusLevelInput?.value ?? "0"));
    }, 1);
    levelInput = levelInputElm;

    levelElm.classList.add("upgrade-level");

    levelWrapper.appendChild(levelElm);

    if(levelPlusCap > 0) {
        const [plusLevelElm, plusInputElm] = createArrowNumberBox(levelPlusCap, currentLevelData.plus, (oldValue, newValue) => {
            userRankDisplay.textContent = `${parseInt(userRankDisplay.textContent ?? "0") + (newValue - oldValue)}`;
            updateAbility(id, parseInt(levelInput.value), parseInt(plusLevelInput.value));
        });
        plusLevelElm.classList.add("upgrade-plus-level");
        plusLevelInput = plusInputElm;

        const plusSign = document.createElement("p");
        plusSign.classList.add("upgrade-plus-text");
        plusSign.textContent = "+";
        levelWrapper.append(plusSign, plusLevelElm);
    }

    wrapper.append(title, image, levelWrapper);
    return wrapper;
}