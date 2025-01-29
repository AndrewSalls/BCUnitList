import { openOrbSelectionModal } from "../orb/orb-selection.js";

export function createLevelInteractable(cap, current) {
    const target = document.createElement("input");
    target.classList.add("level-select");
    target.type = "number";
    target.value = current;
    target.min = 0;
    target.max = parseInt(cap);
    target.step = 1;
    target.title = `Max is ${cap}`;

    target.onwheel = ev => {
        ev.preventDefault();
        if(ev.deltaY < 0) {
            target.value = parseInt(target.value) + 1;
            target.dispatchEvent(new Event("change"));
        } else if(ev.deltaY > 0) {
            target.value = parseInt(target.value) - 1;
            target.dispatchEvent(new Event("change"));
        }
    };

    target.onchange = _ => {
        if(target.value > cap) {
            target.value = cap;
        } else if(target.value < 0) {
            target.value = 0;
        }
    }

    if(window.localStorage.getItem("s1") === "1") {
        const wrapper = document.createElement("div");
        wrapper.classList.add("level-arrow-box");

        const upArrow = createUpArrow();
        upArrow.onclick = () => {
            target.value = parseInt(target.value) + 1;
            target.dispatchEvent(new Event("change"));
        };

        const downArrow = createDownArrow();
        downArrow.onclick = () => {
            target.value = parseInt(target.value) - 1;
            target.dispatchEvent(new Event("change"));
        };

        wrapper.append(upArrow, target, downArrow);
        return wrapper;
    }

    return target;
}

export function createTalentInteractable(talentName, talentMax, talentLevel, isUltra) {
    const container = document.createElement("div");
    container.classList.add("talent-box");
    container.classList.add(isUltra ? "ultra-talent" : "regular-talent");
    container.dataset.max = talentMax;
    container.title = `${talentName.replace("_", " ")} - Max level: ${talentMax}`;

    const image = document.createElement("img");
    image.src = `/assets/img/ability/${talentName}.png`;

    const number = document.createElement("p");
    number.classList.add("talent-level");
    number.textContent = talentLevel;

    const background = document.createElement("span");

    container.onwheel = ev => {
        ev.preventDefault();
        if(ev.deltaY < 0) {
            number.textContent = Math.min(talentMax, parseInt(number.textContent) + 1);
            number.dispatchEvent(new Event("change"));
        } else if(ev.deltaY > 0) {
            number.textContent = Math.max(0, parseInt(number.textContent) - 1);
            number.dispatchEvent(new Event("change"));
        }
    };
    
    const talentLevelChange = () => container.classList.toggle("maxed-talent", number.textContent === talentMax);
    talentLevelChange();
    number.onchange = talentLevelChange;

    container.append(image, number, background);

    if(window.localStorage.getItem("s1") === "1") {
        const arrowContainer = document.createElement("div");
        arrowContainer.classList.add("talent-arrow-box");

        const upArrow = createUpArrow();
        upArrow.onclick = () => {
            number.textContent = Math.min(talentMax, parseInt(number.textContent) + 1);
            number.dispatchEvent(new Event("change"));
        };

        const downArrow = createDownArrow();
        downArrow.onclick = () => {
            number.textContent = Math.max(0, parseInt(number.textContent) - 1);
            number.dispatchEvent(new Event("change"));
        };

        arrowContainer.append(upArrow, downArrow);

        container.appendChild(arrowContainer);
    }

    return container;
}

export function createOrbInteractable(orbData) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("orb-wrapper");

    const container = document.createElement("div");
    container.classList.add("orb-selector");

    const orbColor = document.createElement("img");
    orbColor.classList.add("orb-color");
    
    const orbType = document.createElement("img");
    orbType.classList.add("orb-type");

    const orbRank = document.createElement("img");
    orbRank.classList.add("orb-rank");

    if(orbData) {
        orbColor.dataset.trait = orbData.trait;
        orbColor.src = `/assets/img/orb/${orbData.trait}.png`;
        orbType.dataset.type = orbData.type;
        orbType.src = `/assets/img/orb/${orbData.type}.png`;
        orbRank.dataset.rank = orbData.rank;
        orbRank.src = `/assets/img/orb/${orbData.rank}.png`;
    } else {
        orbColor.dataset.trait = "none";
        orbColor.src = "/assets/img/orb/empty-orb.png";
        orbType.dataset.type = "none";
        orbType.classList.add("invisible");
        orbRank.dataset.rank = "none";
        orbRank.classList.add("invisible");
    }

    container.onclick = _ => openOrbSelectionModal(container);

    container.append(orbColor, orbType, orbRank);
    wrapper.appendChild(container);

    return wrapper;
}

function createUpArrow() {
    const upArrow = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    upArrow.classList.add("upgrade-arrow");
    upArrow.setAttribute("viewBox", "0 0 32 24");
    upArrow.innerHTML = "<path d='M0 24 L16 8 L32 24'></path>";
    return upArrow;
}

function createDownArrow() {
    const downArrow = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    downArrow.classList.add("upgrade-arrow");
    downArrow.setAttribute("viewBox", "0 0 32 24");
    downArrow.innerHTML = "<path d='M0 0 L16 16 L32 0'></path>";
    return downArrow;
}