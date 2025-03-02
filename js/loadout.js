import makeDraggable, { sortIcons } from "./helper/make-draggable.js";
import makeSearchable from "./helper/make-searchable.js";

const MAX_LOADOUT_NAME_LENGTH = 64;
let loadedSearch = false;
let unlockedCannons = [];

document.addEventListener("DOMContentLoaded", () => {
    initializeContent();

    window.addEventListener("portLoaded", loadLoadouts);
    if(checkPort()) {
        window.dispatchEvent("portLoaded");
    }
});

function initializeContent() {
    const addButton = document.querySelector("#add-loadout");
    const addTo = document.querySelector("#loadout-container");

    addButton.onclick = async () => {
        addTo.appendChild(await createLoadout(null));
    };
}

async function loadLoadouts() {
    const settings = await makeRequest(REQUEST_TYPES.GET_SETTINGS, null).then(r => r);

    const cannonTypeCount = settings.ototo.count;
    for(let x = 2; x <= cannonTypeCount; x++) {
        const cannonValues = window.localStorage.getItem(`oo_${x}`).split("-");
        unlockedCannons[x - 1] = { cannon: parseInt(cannonValues[0]) > 0, style: parseInt(cannonValues[1]) > 0, foundation: parseInt(cannonValues[2]) > 0 }
    }
    unlockedCannons[0] = { cannon: true, style: true, foundation: true }; // default base always available

    const unitCount = settings.unitCount;
    const searchSuggestions = document.createElement("datalist");
    searchSuggestions.id = "unit-search-suggestions";
    searchSuggestions.dataset.max_count = unitCount;
    document.body.appendChild(searchSuggestions);
    
    const tempInput = document.createElement("input");
    tempInput.type = "text";
    makeSearchable(tempInput, searchSuggestions, id => console.log(id), true).then(() => loadedSearch = true);

    makeRequest(REQUEST_TYPES.GET_ALL_LOADOUT, null).then(async res => {
        res.push({
            title: "Funni",
            units: [ 69, 420, 137, 101, 690, 42, 138 ],
            forms: [ 0, 1, 2, 0, 1, 2, 3 ],
            base: [1, 3, 8]
        });

        const wrapper = document.querySelector("#loadout-container");
        for(const loadout of res) {
            wrapper.appendChild(await createLoadout(loadout));
        }
    });
}

async function createLoadout(loadoutData = null) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("loadout-wrapper");
    wrapper.classList.add("v-align");

    const options = document.createElement("div");
    options.classList.add("loadout-options");

    const nameOption = document.createElement("input");
    nameOption.type = "text";
    nameOption.placeholder = "Enter loadout name...";
    nameOption.value = loadoutData?.title ?? "";
    nameOption.maxLength = MAX_LOADOUT_NAME_LENGTH;

    const rightOptionWrapper = document.createElement("div");
    rightOptionWrapper.classList.add("loadout-options-right");

    const deleteOption = document.createElement("button");
    deleteOption.type = "button";
    deleteOption.classList.add("delete-loadout");
    deleteOption.classList.add("active");
    deleteOption.textContent = "Delete Loadout";
    deleteOption.onclick = () => {
        wrapper.remove();
    }

    const shareOption = document.createElement("button");
    shareOption.type = "button";
    shareOption.classList.add("share-loadout");
    shareOption.textContent = "Share Loadout";

    rightOptionWrapper.append(deleteOption, shareOption);

    options.append(nameOption, rightOptionWrapper);

    const contentWrapper = document.createElement("div");
    contentWrapper.classList.add("loadout-contents");
    contentWrapper.classList.add("h-align");

    contentWrapper.append(await createUnitInput(loadoutData?.units, loadoutData?.forms), createCannonInput(loadoutData?.base));

    wrapper.append(options, contentWrapper);

    return wrapper;
}

async function createUnitInput(units, forms) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("loadout-unit-wrapper");

    const unitData = await makeRequest(REQUEST_TYPES.GET_MULTIPLE_DATA, units, true);

    let x = 0;
    for(x = 0; x < 10 && x < (units?.length ?? 0); x++) {
        appendChip(units[x], forms[x], unitData[x], wrapper);
    }
    while(x < 10) {
        appendChip(null, null, null, wrapper);
        x++
    }

    makeDraggable(wrapper);

    return wrapper;
}

function appendChip(id, form, unitData, parent) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("chip");

    const img = document.createElement("img");
    img.classList.add("unit-icon");
    img.src = "./assets/img/empty_unit.png";
    img.onclick = () => {
        if(wrapper.classList.contains("set-unit")) {
            let form = parseInt(wrapper.dataset.form) + 1;
            if(form > unitData.current_form) {
                form = 0;
            }

            wrapper.dataset.form = form;
            img.src = `./assets/img/unit_icon/${id}_${form}.png`;
        }
    };

    const pId = document.createElement("p");
    pId.classList.add("unit-id");
    pId.classList.add("hidden");
    const removeButton = document.createElement("div");
    removeButton.classList.add("remove-unit");
    removeButton.textContent = "X";
    removeButton.classList.add("hidden");

    removeButton.onclick = () => {
        wrapper.classList.remove("set-unit");
        img.src = "./assets/img/empty_unit.png";
        img.draggable = false;
        pId.textContent = "";
        pId.classList.add("hidden");
        removeButton.classList.add("hidden");
        sortIcons(parent.querySelectorAll(".chip"), parent);
    }

    if(id !== null && form !== null) {
        wrapper.classList.add("set-unit");
        wrapper.dataset.form = form;
        img.src = `./assets/img/unit_icon/${id}_${form}.png`;
        img.draggable = true;
        pId.textContent = id;
        pId.classList.remove("hidden");
        removeButton.classList.remove("hidden");
    }

    wrapper.append(img, pId, removeButton);
    parent.appendChild(wrapper);
}

function createCannonInput(cannonData) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("loadout-base-wrapper");
    wrapper.classList.add("h-align");

    const baseImage = document.createElement("div");
    baseImage.classList.add("loadout-base-image");

    const cannonImage = document.createElement("img");
    cannonImage.classList.add("base-cannon");
    cannonImage.dataset.type = cannonData[0] ?? 1;
    cannonImage.src = `./assets/img/foundation/base_${cannonData[0] ?? 1}.png`;

    const styleImage = document.createElement("img");
    styleImage.classList.add("base-style");
    styleImage.dataset.type = cannonData[1] ?? 1;
    styleImage.src = `./assets/img/foundation/base_${cannonData[1] ?? 1}_style.png`;

    const foundationImage = document.createElement("img");
    foundationImage.classList.add("base-foundation");
    foundationImage.dataset.type = cannonData[2] ?? 1;
    foundationImage.src = `./assets/img/foundation/base_${cannonData[2] ?? 1}_foundation.png`;

    const leftArrowWrapper = document.createElement("div");
    leftArrowWrapper.classList.add("left-base-arrows");

    baseImage.append(cannonImage, styleImage, foundationImage);

    leftArrowWrapper.append(
        createBaseArrow(true, "cannon", cannonImage),
        createBaseArrow(true, "style", styleImage),
        createBaseArrow(true, "foundation", foundationImage)
    );

    const rightArrowWrapper = document.createElement("div");
    rightArrowWrapper.classList.add("right-base-arrows");

    rightArrowWrapper.append(
        createBaseArrow(false, "cannon", cannonImage),
        createBaseArrow(false, "style", styleImage),
        createBaseArrow(false, "foundation", foundationImage)
    );

    wrapper.append(leftArrowWrapper, baseImage, rightArrowWrapper);
    return wrapper;
}

function createBaseArrow(isLeft, arrowFor, target) {
    const wrapper = document.createElement("div");
    wrapper.classList.add(`${arrowFor}-arrow`)
    wrapper.classList.add(isLeft ? "left-arrow" : "right-arrow");

    if(isLeft) {
        wrapper.innerHTML = "<svg viewBox='0 0 16 32'><path d='M0 16 L16 0 L16 32'></path></svg>";
    } else {
        wrapper.innerHTML = "<svg viewBox='0 0 16 32'><path d='M16 16 L0 0 L0 32'></path></svg>";
    }

    const changeAmt = isLeft ? -1 : 1;
    wrapper.querySelector("svg").onclick = () => {
        const currIndex = parseInt(target.dataset.type) - 1;
        
        let inc = currIndex;
        do {
            inc = (inc + changeAmt + unlockedCannons.length) % unlockedCannons.length;
        } while(!unlockedCannons[inc][arrowFor] && inc !== currIndex);

        inc = inc + 1;
        target.dataset.type = inc;

        let extra = "";
        if(arrowFor === "style" || arrowFor === "foundation"){
            extra = `_${arrowFor}`;
        }
        target.src = `./assets/img/foundation/base_${inc}${extra}.png`;
    };

    return wrapper;
}