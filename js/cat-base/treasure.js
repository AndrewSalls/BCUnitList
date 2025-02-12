export default function loadTreasureInfo(settings) {
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
    slider.classList.add(`slider-${treasureType}`);
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
        sliderCount.textContent = slider.value;

        const parsedTreasures = window.localStorage.getItem(localStorageKey).split("-");
        parsedTreasures[TYPE_MAP[treasureType]] = slider.value;
        window.localStorage.setItem(localStorageKey, parsedTreasures.join("-"));
    });

    wrapper.append(medalIMG, slider, sliderCount);
    return wrapper;
}