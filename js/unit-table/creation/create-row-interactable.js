//@ts-check
import { openOrbSelectionModal } from "../orb/orb-selection.js";

/**
 * Creates an interactive element for setting the level of a unit.
 * @param {number} cap The maximum level of the unit.
 * @param {number} current The current level of the unit.
 * @returns {HTMLInputElement|HTMLDivElement} The interactable element, or a wrapper surrounding it if the setting for arrow controls is set.
 */
export function createLevelInteractable(cap, current) {
    const target = document.createElement("input");
    target.classList.add("level-select");
    target.type = "number";
    target.value = `${current}`;
    target.min = "0";
    target.max = `${cap}`;
    target.step = "1";
    target.title = `Max is ${cap}`;

    target.addEventListener("wheel", ev => {
        ev.preventDefault();
        if(ev.deltaY < 0) {
            target.value = `${parseInt(target.value) + 1}`;
            target.dispatchEvent(new Event("change"));
        } else if(ev.deltaY > 0) {
            target.value = `${parseInt(target.value) - 1}`;
            target.dispatchEvent(new Event("change"));
        }
    }, { passive: false });

    target.onchange = _ => {
        if(parseInt(target.value) > cap) {
            target.value = `${cap}`;
        } else if(parseInt(target.value) < 0) {
            target.value = "0";
        }
    }

    if(window.localStorage.getItem("s1") === "1") {
        const wrapper = document.createElement("div");
        wrapper.classList.add("level-arrow-box");

        const upArrow = createUpArrow();
        upArrow.onclick = () => {
            target.value = `${parseInt(target.value) + 1}`;
            target.dispatchEvent(new Event("change"));
        };

        const downArrow = createDownArrow();
        downArrow.onclick = () => {
            target.value = `${parseInt(target.value) - 1}`;
            target.dispatchEvent(new Event("change"));
        };

        wrapper.append(upArrow, target, downArrow);
        return wrapper;
    }

    return target;
}

/**
 * Creates an interactive element for setting the level of a talent.
 * @param {string} talentName The name of the talent.
 * @param {number} talentMax The maximum level of the talent.
 * @param {number} talentLevel The initial level of the talent.
 * @param {boolean} isUltra Whether the talent is an ultra talent or regular talent.
 * @returns {HTMLDivElement} The interactable element.
 */
export function createTalentInteractable(talentName, talentMax, talentLevel, isUltra) {
    const container = document.createElement("div");
    container.classList.add("talent-box");
    container.classList.add(isUltra ? "ultra-talent" : "regular-talent");
    container.dataset.max = `${talentMax}`;
    container.title = `${talentName.replace("_", " ")} - Max level: ${talentMax}`;

    const image = document.createElement("img");
    image.src = `./assets/img/ability/${talentName}.png`;

    const number = document.createElement("p");
    number.classList.add("talent-level");
    number.textContent = `${talentLevel}`;

    const background = document.createElement("span");

    container.addEventListener("wheel", ev => {
        ev.preventDefault();
        if(ev.deltaY < 0) {
            number.textContent = `${Math.min(talentMax, parseInt(number.textContent ?? "0") + 1)}`;
            number.dispatchEvent(new Event("change"));
        } else if(ev.deltaY > 0) {
            number.textContent = `${Math.max(0, parseInt(number.textContent ?? "0") - 1)}`;
            number.dispatchEvent(new Event("change"));
        }
    }, { passive: false });
    
    const talentLevelChange = () => container.classList.toggle("maxed-talent", number.textContent === `${talentMax}`);
    talentLevelChange();
    number.onchange = talentLevelChange;

    container.append(image, number, background);

    if(window.localStorage.getItem("s1") === "1") {
        const arrowContainer = document.createElement("div");
        arrowContainer.classList.add("talent-arrow-box");

        const upArrow = createUpArrow();
        upArrow.onclick = () => {
            number.textContent = `${Math.min(talentMax, parseInt(number.textContent ?? "0") + 1)}`;
            number.dispatchEvent(new Event("change"));
        };

        const downArrow = createDownArrow();
        downArrow.onclick = () => {
            number.textContent = `${Math.max(0, parseInt(number.textContent ?? "0") - 1)}`;
            number.dispatchEvent(new Event("change"));
        };

        arrowContainer.append(upArrow, downArrow);

        container.appendChild(arrowContainer);
    }

    return container;
}

/**
 * Creates an interactive element to set orb data.
 * @param {import("../../data/unit-data.js").ORB} orbData Initial values for the orb.
 * @returns {HTMLDivElement} The interactable element.
 */
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
        orbColor.dataset.trait = `${orbData.trait}`;
        orbColor.src = `./assets/img/orb/trait/${orbData.trait}.png`;
        orbType.dataset.type = `${orbData.type}`;
        if(orbData.trait === 99) {
            orbType.src = `./assets/img/orb/ability/${orbData.type}.png`;
        } else {
            orbType.src = `./assets/img/orb/type/${orbData.type}.png`;
        }
        orbRank.dataset.rank = `${orbData.rank}`;
        orbRank.src = `./assets/img/orb/rank/${orbData.rank}.png`;
    } else {
        orbColor.dataset.trait = "";
        orbColor.src = "./assets/img/orb/empty-orb.png";
        orbType.dataset.type = "";
        orbType.classList.add("invisible");
        orbRank.dataset.rank = "";
        orbRank.classList.add("invisible");
    }

    container.onclick = _ => openOrbSelectionModal(container);

    container.append(orbColor, orbType, orbRank);
    wrapper.appendChild(container);

    return wrapper;
}

/**
 * Creates an SVG up arrow.
 * @returns {SVGElement} An up arrow.
 */
function createUpArrow() {
    const upArrow = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    upArrow.classList.add("upgrade-arrow");
    upArrow.setAttribute("viewBox", "0 0 32 24");
    upArrow.innerHTML = "<path d='M0 24 L16 8 L32 24'></path>";
    return upArrow;
}

/**
 * Creates an SVG down arrow.
 * @returns {SVGElement} A down arrow.
 */
function createDownArrow() {
    const downArrow = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    downArrow.classList.add("upgrade-arrow");
    downArrow.setAttribute("viewBox", "0 0 32 24");
    downArrow.innerHTML = "<path d='M0 0 L16 16 L32 0'></path>";
    return downArrow;
}