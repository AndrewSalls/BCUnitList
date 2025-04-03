export default function loadTreasureInfo(settings) {
    const treasureDiv = document.querySelector("#treasure-selector");

    for(const chapterAbrv of Object.keys(settings.chapters)) {
        for(let x = 0; x < settings.chapters[chapterAbrv].numberChapters; x++) {
            treasureDiv.appendChild(createChapterBox(settings.chapters[chapterAbrv].name, chapterAbrv, x, settings.chapters[chapterAbrv].treasurePartCount));
        }
    }
}

function createChapterBox(chapterName, chapterAbrv, chapterNum, treasurePartArray) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("treasure-chapter");
    wrapper.classList.add("v-align");

    const title = document.createElement("h4");
    title.textContent = `${chapterName} ${chapterNum + 1}`;
    title.onclick = () => selectorWrapper.classList.toggle("hidden");

    const selectorWrapper = document.createElement("div");
    selectorWrapper.classList.add("treasure-wrapper");
    selectorWrapper.classList.add("h-align");

    for(let x = 0; x < treasurePartArray.length; x++) {
        selectorWrapper.appendChild(createTreasureSelector(chapterAbrv, x, treasurePartArray[x], chapterNum));
    }

    wrapper.append(title, selectorWrapper);
    return wrapper;
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

    const localStorageKey = `${location}_${chapterNum}`;
    treasureSliderBox.append(
        createTreasureSlider("bronze", treasureCount, 3 * id, localStorageKey),
        createTreasureSlider("silver", treasureCount, 3 * id + 1, localStorageKey),
        createTreasureSlider("gold", treasureCount, 3 * id + 2, localStorageKey)
    );

    wrapper.append(wrapperIMG, treasureSliderBox);
    return wrapper;
}

function createTreasureSlider(treasureType, max, index, localStorageKey) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("slider-wrapper");
    wrapper.classList.add("v-align");

    const medalIMG = document.createElement("img");
    medalIMG.src = `./assets/img/treasure/${treasureType}.png`;
    
    const treasureValue = window.localStorage.getItem(localStorageKey).split("-")[index];

    const slider = document.createElement("input");
    slider.classList.add(`slider-${treasureType}`);
    slider.type = "range";
    slider.min = 0;
    slider.max = max;
    slider.step = 1;
    slider.value = treasureValue;

    const sliderCount = document.createElement("p");
    sliderCount.textContent = treasureValue;

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
        parsedTreasures[index] = slider.value;
        window.localStorage.setItem(localStorageKey, parsedTreasures.join("-"));
    });

    wrapper.append(medalIMG, slider, sliderCount);
    return wrapper;
}