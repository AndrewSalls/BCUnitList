import makeSearchable from "../../helper/make-searchable.js";
import makeDraggable from "../../helper/make-draggable.js";

const MAX_LOADOUT_NAME_LENGTH = 64;

export function createMinimalLoadout(loadoutData = null, cannonData = [], saveCallback = null) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("loadout-wrapper");
    wrapper.classList.add("v-align");
    if(loadoutData) {
        wrapper.classList.add("save");
    }

    const options = document.createElement("div");
    options.classList.add("loadout-options");

    const nameOption = document.createElement("input");
    nameOption.classList.add("loadout-name");
    nameOption.type = "text";
    nameOption.placeholder = "Enter loadout name...";
    nameOption.value = loadoutData?.title ?? "";
    nameOption.maxLength = MAX_LOADOUT_NAME_LENGTH;

    options.appendChild(nameOption);

    const contentWrapper = document.createElement("div");
    contentWrapper.classList.add("loadout-contents");
    contentWrapper.classList.add("h-align");

    contentWrapper.append(createUnitInput(loadoutData?.units, loadoutData?.forms, saveCallback), createCannonInput(loadoutData?.base, cannonData, saveCallback));
    wrapper.append(options, contentWrapper);

    return wrapper;
}

export function createUnitInput(units, forms, saveCallback = null) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("loadout-unit-wrapper");

    let x = 0;
    if(units) {
        for(x = 0; x < 10 && x < units.length; x++) {
            appendChip(units[x], forms[x], wrapper, saveCallback);
        }
    }
    while(x < 10) {
        appendChip(null, null, wrapper, saveCallback);
        x++
    }

    makeDraggable(wrapper, saveCallback);

    return wrapper;
}

export function appendChip(id, form, parent, saveCallback = null) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("chip");

    const img = document.createElement("img");
    img.classList.add("unit-icon");
    img.src = "./assets/img/empty_unit.png";
    img.onclick = () => {
        if(window.document.body.classList.contains("disabled-editing-mode")) {
            return;
        }
        if(wrapper.classList.contains("set-unit")) {
            let form = parseInt(wrapper.dataset.form) + 1;
            if(form > parseInt(wrapper.dataset.maxForm)) {
                form = 0;
            }

            wrapper.dataset.form = form;
            img.src = `./assets/img/unit_icon/${wrapper.dataset.id}_${form}.png`;
            saveCallback && saveCallback();
        }
    };

    const pId = document.createElement("p");
    pId.classList.add("unit-id");
    pId.classList.add("hidden");
    const removeButton = document.createElement("div");
    removeButton.classList.add("remove-unit");
    removeButton.textContent = "X";
    removeButton.classList.add("hidden");

    const datalist = document.querySelector("#unit-search-suggestions");

    removeButton.onclick = () => {
        wrapper.classList.remove("set-unit");
        delete wrapper.dataset.id;
        delete wrapper.dataset.maxForm;
        
        const formNameOptions = datalist.querySelectorAll(`option[data-target="${pId.textContent}"]`);
        formNameOptions.forEach(o => o.disabled = false);

        img.src = "./assets/img/empty_unit.png";
        pId.textContent = "";
        pId.classList.add("hidden");
        removeButton.classList.add("hidden");
        unitSearchInput.classList.remove("hidden");
        sortIcons(parent);
        saveCallback && saveCallback();
    }

    const unitSearchInput = document.createElement("input");
    unitSearchInput.classList.add("unset-search");
    unitSearchInput.type = "search";
    unitSearchInput.placeholder = "Search...";
    unitSearchInput.setAttribute("list", "unit-search-suggestions");

    makeSearchable(unitSearchInput, datalist, searchID => {
        const formNameOptions = datalist.querySelectorAll(`option[data-target="${searchID}"]`);
        formNameOptions.forEach(o => o.disabled = true);

        wrapper.classList.add("set-unit");
        wrapper.dataset.form = formNameOptions.length - 1;
        wrapper.dataset.id = searchID;
        wrapper.dataset.maxForm = formNameOptions.length - 1;
        img.src = `./assets/img/unit_icon/${searchID}_${formNameOptions.length - 1}.png`;
        pId.textContent = searchID;
        pId.classList.remove("hidden");
        removeButton.classList.remove("hidden");
        unitSearchInput.classList.add("hidden");
        sortIcons(parent);
        saveCallback && saveCallback();
    });

    if(id !== null && form !== null) {
        wrapper.classList.add("set-unit");
        wrapper.dataset.form = form;
        wrapper.dataset.id = id;
        wrapper.dataset.maxForm = document.querySelectorAll(`#unit-search-suggestions option[data-target="${id}"]`).length - 1;
        img.src = `./assets/img/unit_icon/${id}_${form}.png`;
        pId.textContent = id;
        pId.classList.remove("hidden");
        removeButton.classList.remove("hidden");
        unitSearchInput.classList.add("hidden");
        const formNameOptions = datalist.querySelectorAll(`option[data-target="${id}"]`);
        formNameOptions.forEach(o => o.disabled = true);
    }

    wrapper.append(img, pId, removeButton, unitSearchInput);
    parent.appendChild(wrapper);
}

export function createCannonInput(cannonData, unlockedCannons, saveCallback = null) {
    cannonData = cannonData ?? [1, 1, 1];
    const wrapper = document.createElement("div");
    wrapper.classList.add("loadout-base-wrapper");
    wrapper.classList.add("h-align");

    const baseImage = document.createElement("div");
    baseImage.classList.add("loadout-base-image");

    const cannonImage = document.createElement("img");
    cannonImage.classList.add("base-cannon");
    cannonImage.dataset.type = cannonData[0];
    cannonImage.src = `./assets/img/foundation/base_${cannonData[0] ?? 1}.png`;

    const styleImage = document.createElement("img");
    styleImage.classList.add("base-style");
    styleImage.dataset.type = cannonData[1];
    styleImage.src = `./assets/img/foundation/base_${cannonData[1] ?? 1}_style.png`;

    const foundationImage = document.createElement("img");
    foundationImage.classList.add("base-foundation");
    foundationImage.dataset.type = cannonData[2];
    foundationImage.src = `./assets/img/foundation/base_${cannonData[2] ?? 1}_foundation.png`;

    const leftArrowWrapper = document.createElement("div");
    leftArrowWrapper.classList.add("left-base-arrows");

    baseImage.append(cannonImage, styleImage, foundationImage);

    leftArrowWrapper.append(
        createBaseArrow(true, "cannon", cannonImage, unlockedCannons, saveCallback),
        createBaseArrow(true, "style", styleImage, unlockedCannons, saveCallback),
        createBaseArrow(true, "foundation", foundationImage, unlockedCannons, saveCallback)
    );

    const rightArrowWrapper = document.createElement("div");
    rightArrowWrapper.classList.add("right-base-arrows");

    rightArrowWrapper.append(
        createBaseArrow(false, "cannon", cannonImage, unlockedCannons, saveCallback),
        createBaseArrow(false, "style", styleImage, unlockedCannons, saveCallback),
        createBaseArrow(false, "foundation", foundationImage, unlockedCannons, saveCallback)
    );

    wrapper.append(leftArrowWrapper, baseImage, rightArrowWrapper);
    return wrapper;
}

export function createBaseArrow(isLeft, arrowFor, target, unlockedCannons, saveCallback = null) {
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
        saveCallback && saveCallback();
    };

    return wrapper;
}