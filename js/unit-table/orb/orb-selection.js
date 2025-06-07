//@ts-check

let topPos = 0;

/**
 * Initializes the orb selection modal.
 */
export function initializeOrbSelection() {
    const modal = /** @type {HTMLDivElement} */ (document.querySelector("#orb-selection-modal"));
    const orbCancel = /** @type {HTMLDivElement} */ (document.querySelector("#orb-selection-cancel"));

    orbCancel.onclick = () => {
        modal.classList.add("hidden");
        document.body.classList.remove("unscrollable");
        document.documentElement.scrollTop = topPos;
    };
}

/**
 * Opens the orb selection modal for the specified row.
 * @param {HTMLDivElement} target The orb interactable for which an orb selection modal is opened.
 */
export function openOrbSelectionModal(target) {
    const modal = /** @type {HTMLDivElement} */ (document.querySelector("#orb-selection-modal"));
    const attachOrb = /** @type {HTMLButtonElement} */ (document.querySelector("#attach-orb"));
    modal.classList.remove("hidden");

    topPos = document.documentElement.scrollTop;
    document.body.classList.add("unscrollable");
    document.body.style.top = -1 * topPos + "px";

    const resultOrb = /** @type {HTMLDivElement} */ (document.querySelector("#orb-result"));
    const resultColor = /** @type {HTMLImageElement} */ (resultOrb.querySelector(".orb-color"));
    const resultType = /** @type {HTMLImageElement} */ (resultOrb.querySelector(".orb-type"));
    const resultRank = /** @type {HTMLImageElement} */ (resultOrb.querySelector(".orb-rank"));

    const color = /** @type {HTMLImageElement} */ (target.querySelector(".orb-color"));
    const type = /** @type {HTMLImageElement} */ (target.querySelector(".orb-type"));
    const rank = /** @type {HTMLImageElement} */ (target.querySelector(".orb-rank"));

    const series = color.dataset.trait === "99" ? "ability" : "effect";

    resultColor.src = color.src;
    if(!color.dataset.trait) {
        resultColor.dataset.trait = "";
        document.querySelector(".trait-selection")?.querySelector(".orb-selected")?.classList.remove("orb-selected");
    } else { // Note: If orb is valid orb, it has a color, and thus one of the toggles will be called from here. This resets all orb properties
        if(series === "ability") {
            /** @type {HTMLButtonElement} */ (document.querySelector("#ability-toggle")).click();
        } else {
            /** @type {HTMLButtonElement} */ (document.querySelector("#effect-toggle")).click();
            /** @type {HTMLDivElement} */ (document.querySelector(".trait-selection")?.querySelector(`.image-selector[data-trait="${color.dataset.trait}"]`)).click();
        }
        resultColor.dataset.trait = color.dataset.trait;
    }

    if(type.classList.contains("invisible")) {
        resultType.src = "";
        resultType.classList.add("invisible");
        resultType.dataset.type = "";
        document.querySelector("#type-selection")?.querySelector(".orb-selected")?.classList.remove("orb-selected");
    } else {
        resultType.src = type.src;
        resultType.classList.remove("invisible");
        resultType.dataset.type = type.dataset.type;

        if(series === "ability") {
            /** @type {HTMLDivElement} */ (document.querySelector(".ability-selection")?.querySelector(`.image-selector[data-type="${type.dataset.type}"]`)).click();
        } else {
            /** @type {HTMLDivElement} */ (document.querySelector(".type-selection")?.querySelector(`.image-selector[data-type="${type.dataset.type}"]`)).click();
        }
    }

    if(rank.classList.contains("invisible")) {
        resultRank.src = "";
        resultRank.classList.add("invisible");
        resultRank.dataset.rank = "";
        document.querySelector("#rank-selection")?.querySelector(".orb-selected")?.classList.remove("orb-selected");
    } else {
        resultRank.src = rank.src;
        resultRank.classList.remove("invisible");
        resultRank.dataset.rank = rank.dataset.rank;
        /** @type {HTMLImageElement} */ (document.querySelector(`#${series}-submenu .rank-selection img[data-rank="${rank.dataset.rank}"]`)).click();
    }

    if(resultColor.dataset.trait && resultType.dataset.type && resultRank.dataset.rank) {
        attachOrb.disabled = false;
    } else {
        attachOrb.disabled = true;
    }

    /** @type {HTMLButtonElement} */ (modal.querySelector("#remove-orb")).onclick = () => {
        color.src = "./assets/img/orb/empty-orb.png";
        color.dataset.trait = "";
        type.src = "";
        type.dataset.type = "";
        type.classList.add("invisible");
        rank.src = "";
        rank.dataset.rank = "";
        rank.classList.add("invisible");
        target.dispatchEvent(new Event("change"));
        modal.classList.add("hidden");
        document.body.classList.remove("unscrollable");
        document.documentElement.scrollTop = topPos;
    };

    /** @type {HTMLButtonElement} */ (modal.querySelector("#attach-orb")).onclick = () => {
        color.src = resultColor.src;
        color.dataset.trait = resultColor.dataset.trait;
        type.src = resultType.src;
        type.dataset.type = resultType.dataset.type;
        type.classList.remove("invisible");
        rank.src = resultRank.src;
        rank.dataset.rank = resultRank.dataset.rank;
        rank.classList.remove("invisible");
        target.dispatchEvent(new Event("change"));
        modal.classList.add("hidden");
        document.body.classList.remove("unscrollable");
        document.documentElement.scrollTop = topPos;
    }
}