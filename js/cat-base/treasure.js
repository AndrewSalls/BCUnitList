//@ts-check
/**
 * @readonly
 * @enum {string}
 */
const TREASURE_RANK = {
    BRONZE: "bronze",
    SILVER: "silver",
    GOLD: "gold"
}

/**
 * Loads the Treasures tab of the cat base.
 * @param {Object} settings An object containing the settings from assets/settings.js
 */
export default function loadTreasureInfo(settings) {
    const treasureDiv = document.querySelector("#treasure-selector");

    for(const chapterAbrv of Object.keys(settings.chapters)) {
        for(let x = 0; x < settings.chapters[chapterAbrv].numberChapters; x++) {
            treasureDiv?.appendChild(createChapterBox(settings.chapters[chapterAbrv].name, chapterAbrv, x, settings.chapters[chapterAbrv].treasurePartCount));
        }
    }
}

/**
 * Creates a box containing all sliders for a chapter.
 * @param {string} chapterName The full name of the chapter.
 * @param {string} chapterAbrv The abbreviated name of the chapter, used for localStorage and for finding image files.
 * @param {number} chapterNum The number of the chapter, as chapters have multiple parts under a single name.
 * @param {number[]} treasurePartArray A list of how many components each treasure has.
 * @returns {HTMLDivElement} An element containing all sliders for every treasure in the specific chapter name and number.
 */
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

/**
 * Creates an HTML element that permits selecting and modifying the number of components of each rarity for a given treasure.
 * @param {string} location The chapter name the treasure is from.
 * @param {number} id The position of the treasure in the assets/settings.js treasure name list for the provided chapter.
 * @param {number} treasureCount The number of treasure components in the treasure.
 * @param {number} chapterNum The chapter number, since chapters have multiple sections.
 * @returns {HTMLDivElement} An element that contains all sliders for a specific chapter name + number's treasure.
 */
function createTreasureSelector(location, id, treasureCount, chapterNum) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("treasure-selector");
    wrapper.classList.add("v-align");

    const wrapperIMG = document.createElement("img");
    wrapperIMG.src = `./assets/img/treasure/${location}_${id}.png`;

    const treasureSliderBox = document.createElement("div");
    treasureSliderBox.classList.add("h-align");
    treasureSliderBox.classList.add("treasure-slider-box");
    treasureSliderBox.dataset.sum = "0";

    const localStorageKey = `${location}_${chapterNum}`;
    treasureSliderBox.append(
        createTreasureSlider(treasureSliderBox, TREASURE_RANK.BRONZE, treasureCount, 3 * id, localStorageKey),
        createTreasureSlider(treasureSliderBox, TREASURE_RANK.SILVER, treasureCount, 3 * id + 1, localStorageKey),
        createTreasureSlider(treasureSliderBox, TREASURE_RANK.GOLD, treasureCount, 3 * id + 2, localStorageKey)
    );

    wrapper.append(wrapperIMG, treasureSliderBox);
    return wrapper;
}

/**
 * Creates a vertical slider that counts the number of treasure components of a specific rarity.
 * @param {HTMLDivElement} sliderParent The element containing each rarity of slider for a single treasure.
 * @param {TREASURE_RANK} treasureType The rarity of treasure component to count with the slider.
 * @param {number} max The maximum number of components that make up the treasure.
 * @param {number} index The position of this treasure within localStorage.
 * @param {string} localStorageKey The localStorage entry for the chapter containing this treasure.
 * @returns {HTMLDivElement} A div containing a slider for a specific rarity of treasure, which automatically balances with other sliders under the same parent to a single shared cap on treasure components.
 */
function createTreasureSlider(sliderParent, treasureType, max, index, localStorageKey) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("slider-wrapper");
    wrapper.classList.add("v-align");

    const medalIMG = document.createElement("img");
    medalIMG.src = `./assets/img/treasure/${treasureType}.png`;
    
    //@ts-ignore All localStorage values are automatically initialized if not set.
    const treasureValue = window.localStorage.getItem(localStorageKey).split("-")[index];

    const slider = document.createElement("input");
    slider.classList.add(`slider-${treasureType}`);
    slider.type = "range";
    slider.min = "0";
    slider.max = `${max}`;
    slider.step = "1";
    slider.value = treasureValue;

    const sliderCount = document.createElement("p");
    sliderCount.textContent = treasureValue;

    slider.addEventListener("input", _ => {
        //@ts-ignore
        const sum = parseInt(sliderParent.dataset.sum);
        //@ts-ignore
        const oldValue = parseInt(sliderCount.textContent);
        const newValue = parseInt(slider.value);

        if(sum + (newValue - oldValue) > max) {
            const maxChange = max - sum;
            sliderParent.dataset.sum = `${max}`;
            sliderCount.textContent = `${oldValue + maxChange}`;
            slider.value = `${oldValue + maxChange}`;
            return;
        }

        sliderParent.dataset.sum = `${sum + (newValue - oldValue)}`;
        sliderCount.textContent = `${newValue}`;
    });
    slider.addEventListener("change", () => {
        sliderCount.textContent = slider.value;

        //@ts-ignore All localStorage values are automatically initialized if not set.
        const parsedTreasures = window.localStorage.getItem(localStorageKey).split("-");
        parsedTreasures[index] = slider.value;
        window.localStorage.setItem(localStorageKey, parsedTreasures.join("-"));
    });

    wrapper.append(medalIMG, slider, sliderCount);
    return wrapper;
}