import createArrowNumberBox from "./arrow-box.js";

export default function loadCannonInfo(settings) {
    const wrapper = document.querySelector("#cat-base-selector");
    const defaultCannon = createBaseStyling(settings.ototo.names[0], settings.ototo.cannon, settings.ototo.base, settings.ototo.style, 1);
    defaultCannon.querySelector("label[data-input-type='0']").classList.add("hidden");
    defaultCannon.querySelector("label[data-input-type='1']").classList.add("hidden");
    wrapper.appendChild(defaultCannon);
    for(let x = 2; x <= settings.ototo.count; x++) {
        wrapper.appendChild(createBaseStyling(settings.ototo.names[x - 1], settings.ototo.cannon, settings.ototo.base, settings.ototo.style, x));
    }
}

function createBaseStyling(name, cannonCap, baseCap, styleCap, id) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("cannon-info");
    wrapper.classList.add("v-align");

    const title = document.createElement("h4");
    title.textContent = name;

    const componentWrapper = document.createElement("div");
    componentWrapper.classList.add("h-align");

    const imageWrapper = document.createElement("div");
    imageWrapper.classList.add("base-image");

    const cannonImage = document.createElement("img");
    cannonImage.classList.add("cannon-image");
    cannonImage.src = `./assets/img/foundation/base_${id}.png`;
    cannonImage.style.zIndex = 1;

    const styleImage = document.createElement("img");
    styleImage.classList.add("style-image");
    styleImage.src = `./assets/img/foundation/base_${id}_style.png`;
    styleImage.style.zIndex = 2;

    const foundationImage = document.createElement("img");
    foundationImage.classList.add("foundation-image");
    foundationImage.src = `./assets/img/foundation/base_${id}_foundation.png`;
    foundationImage.style.zIndex = 0;

    imageWrapper.append(cannonImage, styleImage, foundationImage);

    const valueWrapper = document.createElement("div");
    valueWrapper.classList.add("base-values");

    const currentValues = window.localStorage.getItem(`oo_${id}`).split("-");

    valueWrapper.append(
        createBaseValueInput(cannonCap, parseInt(currentValues[0]), 0, id),
        createBaseValueInput(styleCap, parseInt(currentValues[1]), 1, id),
        createBaseValueInput(baseCap, parseInt(currentValues[2]), 2, id)
    );
    componentWrapper.append(imageWrapper, valueWrapper);
    wrapper.append(title, componentWrapper);

    return wrapper;
}

function createBaseValueInput(cap, currentValue, type, id) {
    const valueLabel = document.createElement("label");
    valueLabel.classList.add("h-align");
    valueLabel.dataset.inputType = type;

    const labelText = document.createElement("p");
    switch(type) {
        case 0:
            labelText.textContent = "Cannon";
            break;
        case 1:
            labelText.textContent = "Style";
            break;
        case 2:
            labelText.textContent = "Foundation";
            break;
        default:
            labelText.textContent = "Undefined part of base";
            break;
    }
    
    const [labelInput, inputElm] = createArrowNumberBox(cap, currentValue, () => {
        const currentValues = window.localStorage.getItem(`oo_${id}`).split("-");
        currentValues[type] = inputElm.value;
        window.localStorage.setItem(`oo_${id}`, currentValues.join("-"));
    });

    valueLabel.append(labelText, labelInput);
    return valueLabel;
}