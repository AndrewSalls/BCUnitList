//@ts-check
const RIGGED_ANTI_SCALING = 20;

/**
 * Overlays a loading bar on the page, which disappears upon calling increment the specified number of times, after which the provided callback is called.
 * @param {number} barInterval The number of times increment needs to be called before the loading bar finishes.
 * @param {() => void} fullCallback A function called after the loading bar finishes.
 * @returns {{increment: () => void, rincrement: () => void}} increment, which counts towards the number of times needed to finish the loading bar, and rincrement, which updates the display but does not atually count.
 */
export default function createLoadingBar(barInterval, fullCallback) {
    const container = document.createElement("div");
    container.id = "loading-icon";
    const loadingText = document.createElement("h2");
    loadingText.textContent = "Loading";
    const wrapper = document.createElement("div");
    wrapper.id = "loading-container";
    const bar = document.createElement("span");
    bar.id = "loading-progress";

    wrapper.appendChild(bar);
    container.append(loadingText, wrapper);

    document.body.appendChild(container);

    let loadedCount = 0;
    let riggedCount = 0;
    const inc = () => {
        loadedCount++;
        bar.style.width = `${((RIGGED_ANTI_SCALING * loadedCount + riggedCount) / (RIGGED_ANTI_SCALING * barInterval + riggedCount + 1)) * 100}%`;
    
        if(loadedCount === barInterval) {
            fullCallback();
            document.querySelector("#loading-icon")?.classList.add("hidden");
            document.querySelector("#loading-content")?.classList.remove("hidden");
        }
    };
    const rinc = () => {
        riggedCount+= 1;
        bar.style.width = `${((RIGGED_ANTI_SCALING * loadedCount + riggedCount) / (RIGGED_ANTI_SCALING * barInterval + riggedCount + 1)) * 100}%`;
    };

    return {increment: inc, rincrement: rinc};
}