const RIGGED_ANTI_SCALING = 20;

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
            document.querySelector("#loading-icon").classList.add("hidden");
            document.querySelector("#loading-content").classList.remove("hidden");
        }
    };
    const rinc = () => {
        riggedCount+= 1;
        bar.style.width = `${((RIGGED_ANTI_SCALING * loadedCount + riggedCount) / (RIGGED_ANTI_SCALING * barInterval + riggedCount + 1)) * 100}%`;
    };

    return {increment: inc, rincrement: rinc};
}