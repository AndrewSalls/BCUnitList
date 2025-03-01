import makeDraggable, { sortIcons } from "./helper/make-draggable.js";
import makeSearchable from "./helper/make-searchable.js";

const MAX_LOADOUT_NAME_LENGTH = 64;
let loadedSearch = false;

document.addEventListener("DOMContentLoaded", () => {
    initializeContent();

    window.addEventListener("portLoaded", loadLoadouts);
    if(checkPort()) {
        window.dispatchEvent("portLoaded");
    }
});

function initializeContent() {
    const addButton = document.querySelector("#add-loadout");
    const addTo = document.querySelector("#loadout-container");

    addButton.onclick = () => {
        addTo.appendChild(createLoadout(null));
    };
}

async function loadLoadouts() {
    const settings = await makeRequest(REQUEST_TYPES.GET_SETTINGS, null).then(r => r);
    const unitCount = settings.unitCount;
    const searchSuggestions = document.createElement("datalist");
    searchSuggestions.id = "unit-search-suggestions";
    searchSuggestions.dataset.max_count = unitCount;
    document.body.appendChild(searchSuggestions);
    
    const tempInput = document.createElement("input");
    tempInput.type = "text";
    makeSearchable(tempInput, searchSuggestions, id => console.log(id), true).then(() => loadedSearch = true);

    makeRequest(REQUEST_TYPES.GET_ALL_LOADOUT, null).then(res => {
        res.push({
            title: "Funni",
            units: [ 69, 420, 137, 101, 690, 42, 138 ],
            forms: [ 0, 1, 2, 0, 1, 2, 3 ],
            base: [1, 3, 8]
        });
        console.log(res);

        const wrapper = document.querySelector("#loadout-container");
        for(const loadout of res) {
            wrapper.appendChild(createLoadout(loadout));
        }
    });
}

function createLoadout(loadoutData = null) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("loadout-wrapper");
    wrapper.classList.add("v-align");

    const options = document.createElement("div");
    options.classList.add("loadout-options");

    const nameOption = document.createElement("input");
    nameOption.type = "text";
    nameOption.placeholder = "Enter loadout name...";
    nameOption.value = loadoutData?.title ?? "";
    nameOption.maxLength = MAX_LOADOUT_NAME_LENGTH;

    const rightOptionWrapper = document.createElement("div");
    rightOptionWrapper.classList.add("loadout-options-right");

    const deleteOption = document.createElement("button");
    deleteOption.type = "button";
    deleteOption.classList.add("delete-loadout");
    deleteOption.classList.add("active");
    deleteOption.textContent = "Delete Loadout";
    deleteOption.onclick = () => {
        wrapper.remove();
    }

    const shareOption = document.createElement("button");
    shareOption.type = "button";
    shareOption.classList.add("share-loadout");
    shareOption.textContent = "Share Loadout";

    rightOptionWrapper.append(deleteOption, shareOption);

    options.append(nameOption, rightOptionWrapper);

    const contentWrapper = document.createElement("div");
    contentWrapper.classList.add("loadout-contents");
    contentWrapper.classList.add("h-align");

    contentWrapper.append(createUnitInput(loadoutData?.units, loadoutData?.forms), createCannonInput(loadoutData?.base));

    wrapper.append(options, contentWrapper);

    return wrapper;
}

function createUnitInput(units, forms) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("loadout-unit-wrapper");

    let x = 0;
    for(x = 0; x < 10 && x < (units?.length ?? 0); x++) {
        appendChip(units[x], forms[x], wrapper);
    }
    while(x < 10) {
        appendChip(null, null, wrapper);
        x++
    }

    makeDraggable(wrapper);

    return wrapper;
}

function appendChip(id, form, parent) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("chip");

    const img = document.createElement("img");
    img.classList.add("unit-icon");
    img.src = "./assets/img/empty_unit.png";
    const pId = document.createElement("p");
    pId.classList.add("unit-id");
    pId.classList.add("hidden");
    const removeButton = document.createElement("div");
    removeButton.classList.add("remove-unit");
    removeButton.textContent = "X";
    removeButton.classList.add("hidden");

    removeButton.onclick = () => {
        wrapper.classList.remove("set-unit");
        img.src = "./assets/img/empty_unit.png";
        img.draggable = false;
        pId.textContent = "";
        pId.classList.add("hidden");
        removeButton.classList.add("hidden");
        sortIcons(parent.querySelectorAll(".chip"), parent);
    }

    if(id !== null && form !== null) {
        wrapper.classList.add("set-unit");
        img.src = `./assets/img/unit_icon/${id}_${form}.png`;
        img.draggable = true;
        pId.textContent = id;
        pId.classList.remove("hidden");
        removeButton.classList.remove("hidden");
    }

    wrapper.append(img, pId, removeButton);
    parent.appendChild(wrapper);
}

function createCannonInput(cannonData) {
    return document.createElement("div");
    // <div class="loadout-base-wrapper h-align">
    //     <div class="left-base-arrows v-align">
    //         <div class="left-arrow">
    //             <svg viewBox="0 0 16 32">
    //                 <path d="M0 16 L16 0 L16 32"></path>
    //             </svg>
    //         </div>
    //         <div class="left-arrow">
    //             <svg viewBox="0 0 16 32">
    //                 <path d="M0 16 L16 0 L16 32"></path>
    //             </svg>
    //         </div>
    //         <div class="left-arrow">
    //             <svg viewBox="0 0 16 32">
    //                 <path d="M0 16 L16 0 L16 32"></path>
    //             </svg>
    //         </div>
    //     </div>
    //     <div class="loadout-base-image">
    //         <img src="./assets/img/foundation/base_1.png">
    //         <img src="./assets/img/foundation/base_1_style.png">
    //         <img src="./assets/img/foundation/base_1_foundation.png">
    //     </div>
    //     <div class="right-base-arrows v-align">
    //         <div class="right-arrow">
    //             <svg viewBox="0 0 16 32">
    //                 <path d="M16 16 L0 0 L0 32"></path>
    //             </svg>
    //         </div>
    //         <div class="right-arrow">
    //             <svg viewBox="0 0 16 32">
    //                 <path d="M16 16 L0 0 L0 32"></path>
    //             </svg>
    //         </div>
    //         <div class="right-arrow">
    //             <svg viewBox="0 0 16 32">
    //                 <path d="M16 16 L0 0 L0 32"></path>
    //             </svg>
    //         </div>
    //     </div>
    // </div>
}