import createArrowNumberBox from "./arrow-box.js";

export default async function loadUpgradeInfo(settings) {
    const wrapper = document.querySelector("#upgrade-selector");
    const res = await makeRequest(REQUEST_TYPES.GET_ALL_UPGRADE, null);

    wrapper.appendChild(createCGSBox(res[0] === 1));

    for(let x = 0; x < settings.abilities.abilityNames.length; x++) {
        wrapper.appendChild(createUpgradeLevelBox(settings.abilities.abilityNames[x], settings.abilities.abilityLevelCap, settings.abilities.abilityPlusLevelCap, res[x + 1], x));
    }
}

function createCGSBox(isOwned) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("v-align");

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
    ownedCheckbox.onchange = () => makeRequest(REQUEST_TYPES.UPDATE_UPGRADE, { id: 0, level: ownedCheckbox.checked ? 1 : 0 });

    ownedWrapper.append(ownedLabel, ownedCheckbox);
    wrapper.append(title, image, ownedWrapper);
    return wrapper;
}

function createUpgradeLevelBox(name, levelCap, levelPlusCap, currentLevelData, id) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("v-align");

    const title = document.createElement("h4");
    title.textContent = name;

    const image = document.createElement("img");
    image.src = `./assets/img/upgrades/ability_${id}.png`;

    const levelWrapper = document.createElement("div");
    levelWrapper.classList.add("h-align");

    let levelInput, plusLevelInput;
    
    const userRankDisplay = document.querySelector("#user-rank");
    const [plusLevelElm, plusInputElm] = createArrowNumberBox(levelPlusCap, currentLevelData.plus, (oldValue, newValue) => {
        userRankDisplay.textContent = parseInt(userRankDisplay.textContent) + (newValue - oldValue);
        makeRequest(REQUEST_TYPES.UPDATE_UPGRADE, { id: id + 1, level: parseInt(levelInput.value), plus: parseInt(plusLevelInput.value) });
    });
    const [levelElm, levelInputElm] = createArrowNumberBox(levelCap, currentLevelData.level, (oldValue, newValue) => {
        userRankDisplay.textContent = parseInt(userRankDisplay.textContent) + (newValue - oldValue);
        makeRequest(REQUEST_TYPES.UPDATE_UPGRADE, { id: id + 1, level: parseInt(levelInput.value), plus: parseInt(plusLevelInput.value) });
    });
    levelInput = levelInputElm;
    plusLevelInput = plusInputElm;

    levelWrapper.append(levelElm, "+", plusLevelElm);
    wrapper.append(title, image, levelWrapper);
    return wrapper;
}