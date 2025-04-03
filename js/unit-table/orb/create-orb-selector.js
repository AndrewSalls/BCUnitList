import * as orbData from "../../../assets/orb-map.js";
const ORB_DATA = orbData.default;

export default function createOrbMenu() {
    const modalBG = document.createElement("div");
    modalBG.id = "orb-selection-modal";
    modalBG.classList.add("modal-bg");
    modalBG.classList.add("hidden");

    const content = document.createElement("div");
    content.classList.add("modal-fill");

    const exit = document.createElement("div");
    exit.id = "orb-selection-cancel";
    exit.classList.add("modal-close");
    
    const closeX = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    closeX.setAttribute("viewBox", "0 0 64 64");
    closeX.innerHTML = '<polygon points="10,0 0,10 54,64 64,54" /><polygon points="54,0 64,10 10,64 0,54" />';

    exit.appendChild(closeX);

    const label = document.createElement("h2");
    label.textContent = "Talent Orb Selection";

    const traitLabel = document.createElement("h3");
    traitLabel.textContent = "Orb Target Trait";
    const typeLabel = document.createElement("h3");
    typeLabel.textContent = "Orb Type";
    const rankLabel = document.createElement("h3");
    rankLabel.textContent = "Orb Rank";

    const confirmCentering = document.createElement("div");
    confirmCentering.id = "orb-option-centering";

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.id = "remove-orb";
    removeButton.textContent = "Remove Orb";

    const resultDisplay = document.createElement("div");
    resultDisplay.classList.add("orb-selector");
    resultDisplay.id = "orb-result";

    const colorImg = document.createElement("img");
    colorImg.classList.add("orb-color");
    const typeImg = document.createElement("img");
    typeImg.classList.add("orb-type");
    const rankImg = document.createElement("img");
    rankImg.classList.add("orb-rank");

    resultDisplay.append(colorImg, typeImg, rankImg);

    const attachButton = document.createElement("button");
    attachButton.type = "button";
    attachButton.id = "attach-orb";
    attachButton.textContent = "Attach Orb";

    confirmCentering.append(removeButton, resultDisplay, attachButton);
    content.append(exit, label, traitLabel, createTraitSelectionSubmenu(), typeLabel, createTypeSelectionSubmenu(), rankLabel, createRankSelectionSubmenu(), confirmCentering);
    modalBG.appendChild(content);

    return modalBG;
}

function createTraitSelectionSubmenu() {
    const wrapper = document.createElement("div");
    wrapper.id = "trait-selection";
    for(let x = 0; x < ORB_DATA.traits.length; x++) {
        wrapper.appendChild(createTraitSelector(x, ORB_DATA.traits[x]));
    }

    return wrapper;
}

function createTraitSelector(traitID, traitTitle) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("image-selector");
    wrapper.dataset.trait = traitID;

    const title = document.createElement("h4");
    title.textContent = traitTitle;

    const traitImg = document.createElement("img");
    traitImg.src = `./assets/img/orb/trait/${traitID}.png`;
    traitImg.title = traitTitle;

    wrapper.append(title, traitImg);
    return wrapper;
}

function createTypeSelectionSubmenu() {
    const wrapper = document.createElement("div");
    wrapper.id = "type-selection";
    for(let x = 0; x < ORB_DATA.types.length; x++) {
        wrapper.appendChild(createTypeSelector(x, ORB_DATA.types[x]));
    }

    return wrapper;
}

function createTypeSelector(typeID, typeTitle) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("image-selector");
    wrapper.dataset.type = typeID;

    const title = document.createElement("h4");
    title.textContent = typeTitle;

    const typeImgWrapper = document.createElement("div");
    typeImgWrapper.classList.add("type-shrinkwrap");

    const typeImg = document.createElement("img");
    typeImg.src = `./assets/img/orb/type/${typeID}.png`;
    typeImg.title = typeTitle;

    typeImgWrapper.appendChild(typeImg);

    wrapper.append(title, typeImgWrapper);
    return wrapper;
}

function createRankSelectionSubmenu() {
    const wrapper = document.createElement("div");
    wrapper.id = "rank-selection";
    for(let x = 0; x < ORB_DATA.ranks.length; x++) {
        wrapper.appendChild(createRankSelector(x, ORB_DATA.ranks[x]));
    }

    return wrapper;
}

function createRankSelector(imgID, imgTitle) {
    const superWrapper = document.createElement("div");
    superWrapper.classList.add("rank-shrinkwrap");

    const wrapper = document.createElement("div");

    const img = document.createElement("img");

    img.src = `./assets/img/orb/rank/${imgID}.png`;
    img.dataset.rank = imgID;
    img.title = imgTitle;

    wrapper.appendChild(img);
    superWrapper.appendChild(wrapper);

    return superWrapper;
}