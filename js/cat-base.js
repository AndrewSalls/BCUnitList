import createLoadingBar from "./helper/loading.js";

window.addEventListener("DOMContentLoaded", () => {
    const loadingBar = createLoadingBar(3, () => {});

    const defaultTab = document.querySelector("#treasure-tab");
    initializeNavButton(defaultTab, document.querySelector("#treasure-selector"));
    initializeNavButton(document.querySelector("#cannon-tab"), document.querySelector("#cat-base-selector"));
    initializeNavButton(document.querySelector("#upgrades-tab"), document.querySelector("#upgrade-selector"));
    initializeNavButton(document.querySelector("#other-tab"), document.querySelector("#other-selector"));
    defaultTab.click();
    loadingBar.increment();

    window.addEventListener("portLoaded", () => loadBaseSettings(loadingBar));
    if(checkPort()) {
        window.dispatchEvent("portLoaded");
    }
});

function initializeNavButton(button, target) {
    button.onclick = () => {
        if(!button.classList.contains("current")) {
            document.querySelector("#base-section-nav").querySelectorAll("button").forEach(b => b.classList.remove("current"));
            button.classList.add("current");
            document.querySelectorAll("#tab-list > div").forEach(t => t.classList.add("hidden"));
            target.classList.remove("hidden");
        }
    }
}

function loadBaseSettings(loadingBar) {
    makeRequest(REQUEST_TYPES.GET_SETTINGS, null).then(settings => {
        document.querySelector("#user-rank").textContent = settings.userRank;
        loadingBar.increment();
        loadTreasureInfo(settings);
        loadCannonInfo(settings);
        loadUpgradeInfo(settings);
        loadOtherInfo();
        loadingBar.increment();
    });
}

function loadTreasureInfo(settings) {
    const treasureDiv = document.querySelector("#treasure-selector");

    for(let c = 1; c <= 3; c++) {
        const wrapper = document.createElement("div");
        wrapper.classList.add("treasure-chapter");
        wrapper.classList.add("v-align");

        const title = document.createElement("h4");
        title.textContent = `Empire of Cats ${c}`;
        title.onclick = () => selectorWrapper.classList.toggle("hidden");

        const selectorWrapper = document.createElement("div");
        selectorWrapper.classList.add("treasure-wrapper");
        selectorWrapper.classList.add("h-align");

        for(let x = 0; x < settings.treasures.eoc.length; x++) {
            selectorWrapper.appendChild(createTreasureSelector("eoc", x + 1, settings.treasures.eoc[x], c));
        }

        wrapper.append(title, selectorWrapper);
        treasureDiv.appendChild(wrapper);
    }

    for(let c = 1; c <= 3; c++) {
        const wrapper = document.createElement("div");
        wrapper.classList.add("treasure-chapter");
        wrapper.classList.add("v-align");

        const title = document.createElement("h4");
        title.textContent = `Into the Future ${c}`;
        title.onclick = () => selectorWrapper.classList.toggle("hidden");

        const selectorWrapper = document.createElement("div");
        selectorWrapper.classList.add("treasure-wrapper");
        selectorWrapper.classList.add("h-align");

        for(let x = 0; x < settings.treasures.itf.length; x++) {
            selectorWrapper.appendChild(createTreasureSelector("itf", x + 1, settings.treasures.itf[x], c));
        }

        wrapper.append(title, selectorWrapper);
        treasureDiv.appendChild(wrapper);
    }

    for(let c = 1; c <= 3; c++) {
        const wrapper = document.createElement("div");
        wrapper.classList.add("treasure-chapter");
        wrapper.classList.add("v-align");

        const title = document.createElement("h4");
        title.textContent = `Cats of the Cosmos ${c}`;
        title.onclick = () => selectorWrapper.classList.toggle("hidden");

        const selectorWrapper = document.createElement("div");
        selectorWrapper.classList.add("treasure-wrapper");
        selectorWrapper.classList.add("h-align");

        for(let x = 0; x < settings.treasures.cotc.length; x++) {
            selectorWrapper.appendChild(createTreasureSelector("cotc", x + 1, settings.treasures.cotc[x], c));
        }

        wrapper.append(title, selectorWrapper);
        treasureDiv.appendChild(wrapper);
    }
}

function createTreasureSelector(location, id, treasureCount, chapterNum) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("treasure-selector");
    wrapper.classList.add("v-align");

    const wrapperIMG = document.createElement("img");
    wrapperIMG.src = `./assets/img/treasure/${location}_${id}.png`;

    const treasureSliderBox = document.createElement("div");
    treasureSliderBox.classList.add("h-align");
    treasureSliderBox.classList.add("treasure-slider-box");
    treasureSliderBox.dataset.sum = 0;

    const localStorageKey = `${location}_${chapterNum}_${id}`;
    const parsedTreasures = window.localStorage.getItem(localStorageKey).split("-");
    treasureSliderBox.append(
        createTreasureSlider("bronze", treasureCount, parsedTreasures[0], localStorageKey),
        createTreasureSlider("silver", treasureCount, parsedTreasures[1], localStorageKey),
        createTreasureSlider("gold", treasureCount, parsedTreasures[2], localStorageKey)
    );

    wrapper.append(wrapperIMG, treasureSliderBox);
    return wrapper;
}

const TYPE_MAP = { bronze: 0, silver: 1, gold: 2 };
function createTreasureSlider(treasureType, max, initialValue, localStorageKey) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("slider-wrapper");
    wrapper.classList.add("v-align");

    const medalIMG = document.createElement("img");
    medalIMG.src = `./assets/img/treasure/${treasureType}.png`;
    
    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = 0;
    slider.max = max;
    slider.step = 1;
    slider.value = initialValue;

    const sliderCount = document.createElement("p");
    sliderCount.textContent = initialValue;

    slider.addEventListener("input", _ => {
        const sum = parseInt(slider.parentElement.parentElement.dataset.sum);
        const oldValue = parseInt(sliderCount.textContent);
        const newValue = parseInt(slider.value);

        if(sum + (newValue - oldValue) > max) {
            const maxChange = max - sum;
            slider.parentElement.parentElement.dataset.sum = max;
            sliderCount.textContent = oldValue + maxChange;
            slider.value = oldValue + maxChange;
            return;
        }

        slider.parentElement.parentElement.dataset.sum = sum + (newValue - oldValue);
        sliderCount.textContent = newValue;
    });
    slider.addEventListener("change", () => {
        const parsedTreasures = window.localStorage.getItem(localStorageKey).split("-");
        parsedTreasures[TYPE_MAP[treasureType]] = slider.value;
        window.localStorage.setItem(localStorageKey, parsedTreasures.join("-"));
    });

    wrapper.append(medalIMG, slider, sliderCount);
    return wrapper;
}

function loadCannonInfo(settings) {
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

    const labelInput = document.createElement("input");
    labelInput.type = "number";
    labelInput.value = currentValue;
    labelInput.min = 0;
    labelInput.max = cap;
    labelInput.step = 1;

    labelInput.onchange = () => {
        if(parseInt(labelInput.value) < 0) {
            labelInput.value = 0;
        } else if(parseInt(labelInput.value) > cap) {
            labelInput.value = cap;
        }

        const currentValues = window.localStorage.getItem(`oo_${id}`).split("-");
        currentValues[type] = labelInput.value;
        window.localStorage.setItem(`oo_${id}`, currentValues.join("-"));
    }

    labelInput.onwheel = ev => {
        ev.preventDefault();
        if(ev.deltaY < 0) {
            labelInput.value = parseInt(labelInput.value) + 1;
            labelInput.dispatchEvent(new Event("change"));
        } else if(ev.deltaY > 0) {
            labelInput.value = parseInt(labelInput.value) - 1;
            labelInput.dispatchEvent(new Event("change"));
        }
    };
    // TODO: Add change listener to fix values to min/max, update localStorage

    if(window.localStorage.getItem("s1") === "1") {
        const labelInputWrapper = document.createElement("div");
        labelInputWrapper.classList.add("v-align");

        const upArrow = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        upArrow.classList.add("upgrade-arrow");
        upArrow.setAttribute("viewBox", "0 0 32 24");
        upArrow.innerHTML = "<path d='M0 24 L16 8 L32 24'></path>";
        upArrow.onclick = () => {
            labelInput.value = parseInt(labelInput.value) + 1;
            labelInput.dispatchEvent(new Event("change"));
        };

        const downArrow = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        downArrow.classList.add("upgrade-arrow");
        downArrow.setAttribute("viewBox", "0 0 32 24");
        downArrow.innerHTML = "<path d='M0 0 L16 16 L32 0'></path>";
        downArrow.onclick = () => {
            labelInput.value = parseInt(labelInput.value) - 1;
            labelInput.dispatchEvent(new Event("change"));
        };

        labelInputWrapper.append(upArrow, labelInput, downArrow);
        valueLabel.append(labelText, labelInputWrapper);
    } else {
        valueLabel.append(labelText, labelInput);
    }

    return valueLabel;
}

function loadUpgradeInfo(settings) {
}

function loadOtherInfo() {
    const brokenCheck = document.querySelector("#seal-broken");
    brokenCheck.checked = window.localStorage.getItem("akb") === "1";
    brokenCheck.onchange = () => window.localStorage.setItem("akb", brokenCheck.checked ? "1" : "0");

    const sealLevel = document.querySelector("#seal-level");
    sealLevel.value = window.localStorage.getItem("akl");
    sealLevel.onchange = () => {
        if(parseInt(sealLevel.value) < 0) {
            sealLevel.value = 0;
        } else if(parseInt(sealLevel.value) > 50) {
            sealLevel.value = 50;
        }

        window.localStorage.setItem("akl", sealLevel.value);
    };
    sealLevel.onwheel = ev => {
        ev.preventDefault();
        if(ev.deltaY < 0) {
            sealLevel.value = parseInt(sealLevel.value) + 1;
            sealLevel.dispatchEvent(new Event("change"));
        } else if(ev.deltaY > 0) {
            sealLevel.value = parseInt(sealLevel.value) - 1;
            sealLevel.dispatchEvent(new Event("change"));
        }
    };
}