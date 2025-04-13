//@ts-check

/**
 * Initializes the orb selection modal.
 */
export function initializeOrbSelection() {
    const attachOrb = /** @type {HTMLButtonElement} */ (document.querySelector("#attach-orb"));

    const resultOrb = /** @type {HTMLDivElement} */ (document.querySelector("#orb-result"));
    const resultOrbColor = /** @type {HTMLImageElement} */ (resultOrb.querySelector(".orb-color"));
    const resultOrbType = /** @type {HTMLImageElement} */ (resultOrb.querySelector(".orb-type"));
    const resultOrbRank = /** @type {HTMLImageElement} */ (resultOrb.querySelector(".orb-rank"));

    const traitBox = /** @type {HTMLDivElement} */ (document.querySelector("#trait-selection"));
    const traitOptions = /** @type {NodeListOf<HTMLDivElement>} */ (traitBox.querySelectorAll(".image-selector"));
    for(const trait of traitOptions) {
        trait.onclick = () => {
            traitOptions.forEach(v => v.classList.remove("orb-selected"));
            trait.classList.add("orb-selected");
            resultOrbColor.src = trait.querySelector("img")?.src ?? "";
            resultOrbColor.dataset.trait = trait.dataset.trait;

            if(resultOrbColor.dataset.trait && resultOrbType.dataset.type && resultOrbRank.dataset.rank) {
                attachOrb.disabled = false;
            }
        };
    }

    const typeBox = /** @type {HTMLDivElement} */ (document.querySelector("#type-selection"));
    const typeOptions = /** @type {NodeListOf<HTMLDivElement>} */ (typeBox.querySelectorAll(".image-selector"));
    for(const type of typeOptions) {
        type.onclick = () => {
            typeOptions.forEach(v => v.classList.remove("orb-selected"));
            type.classList.add("orb-selected");
            resultOrbType.src = type.querySelector("img")?.src ?? "";
            resultOrbType.classList.remove("invisible");
            resultOrbType.dataset.type = type.dataset.type;

            if(resultOrbColor.dataset.trait && resultOrbType.dataset.type && resultOrbRank.dataset.rank) {
                attachOrb.disabled = false;
            }
        };
    }

    const rankBox = /** @type {HTMLDivElement} */ (document.querySelector("#rank-selection"));
    const rankOptions = /** @type {NodeListOf<HTMLDivElement>} */ (rankBox.querySelectorAll(".rank-shrinkwrap"));
    for(const rank of rankOptions) {
        rank.onclick = () => {
            rankOptions.forEach(v => v.classList.remove("orb-selected"));
            rank.classList.add("orb-selected");

            const rankIMG = /** @type {HTMLImageElement} */ (rank.querySelector("img"));

            resultOrbRank.src = rankIMG.src;
            resultOrbRank.classList.remove("invisible");
            resultOrbRank.dataset.rank = rankIMG.dataset.rank;

            if(resultOrbColor.dataset.trait && resultOrbType.dataset.type && resultOrbRank.dataset.rank) {
                attachOrb.disabled = false;
            }
        };
    }

    initializeOrbCancel();
}

let topPos = 0;

/**
 * Initializes the cancel button inside the orb selection modal.
 */
function initializeOrbCancel() {
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

    resultColor.src = color.src;
    if(!color.dataset.trait) {
        resultColor.dataset.trait = "";
        document.querySelector("#trait-selection")?.querySelector(".orb-selected")?.classList.remove("orb-selected");
    } else {
        resultColor.dataset.trait = color.dataset.trait;
        /** @type {HTMLDivElement} */ (document.querySelector("#trait-selection")?.querySelector(`.image-selector[data-trait="${color.dataset.trait}"]`)).click();
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
        /** @type {HTMLDivElement} */ (document.querySelector("#type-selection")?.querySelector(`.image-selector[data-type="${type.dataset.type}"]`)).click();
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
        /** @type {HTMLDivElement} */ (document.querySelector(`#rank-selection img[data-rank="${rank.dataset.rank}"]`)).click();
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