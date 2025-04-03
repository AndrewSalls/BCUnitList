import { createSearchDropdown, initializeDatasetLimited } from "./helper/make-searchable.js";
import { encodeLink } from "./helper/encoder.js";
import { createMinimalLoadout } from "./unit-table/creation/create-loadout-table.js";

let unlockedCannons = [];

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

    const editToggle = document.querySelector("#toggle-display-mode");
    editToggle.onclick = () => {
        const state = document.body.classList.toggle("disabled-editing-mode")
        document.querySelectorAll(".loadout-name").forEach(n => n.disabled = state);
        window.localStorage.setItem("tdm", state ? "1" : "0");
    }
    
    const viewShared = document.querySelector("#query-display-loadout");
    viewShared.onclick = () => window.location.href = "./loadout-display.html";
}

async function loadLoadouts() {
    const settings = await makeRequest(REQUEST_TYPES.GET_SETTINGS, null).then(r => r);

    const cannonTypeCount = settings.ototo.names.length;
    for(let x = 2; x <= cannonTypeCount; x++) {
        const cannonValues = window.localStorage.getItem(`oo_${x}`).split("-");
        unlockedCannons[x - 1] = { cannon: parseInt(cannonValues[0]) > 0, style: parseInt(cannonValues[1]) > 0, foundation: parseInt(cannonValues[2]) > 0 }
    }
    unlockedCannons[0] = { cannon: true, style: true, foundation: true }; // default base always available

    const datalist = createSearchDropdown();
    document.body.appendChild(datalist);
    await initializeDatasetLimited(datalist, true);

    makeRequest(REQUEST_TYPES.GET_ALL_LOADOUT, null).then(res => {
        const wrapper = document.querySelector("#loadout-container");
        for(const loadout of res) {
            wrapper.appendChild(createLoadout(loadout));
        }
        if(window.localStorage.getItem("tdm") === "1") {
            document.querySelector("#toggle-display-mode").click();
        }
    });
}

function createLoadout(loadoutData = null) {
    let minimalLoadout = null;
    const requestSave = () => {
        const loadoutUnits = [...minimalLoadout.querySelectorAll(".chip.set-unit")].map(c => parseInt(c.dataset.id));
        const position = Array.prototype.indexOf.call(document.querySelectorAll(".loadout-wrapper"), minimalLoadout);
        if(loadoutUnits.length > 0) {
            minimalLoadout.classList.add("save");
            makeRequest(REQUEST_TYPES.MODIFY_LOADOUT, {
                position: position,
                loadout: createLoadoutObject(minimalLoadout)
            });
        } else if(minimalLoadout.classList.contains("save")) {
            makeRequest(REQUEST_TYPES.DELETE_LOADOUT, position);
        }
    };
    minimalLoadout = createMinimalLoadout(loadoutData, unlockedCannons, requestSave);
    
    const options = minimalLoadout.querySelector(".loadout-options");
    minimalLoadout.querySelector(".loadout-name").addEventListener("input", requestSave);

    const rightOptionWrapper = document.createElement("div");
    rightOptionWrapper.classList.add("loadout-options-right");

    const deleteOption = document.createElement("button");
    deleteOption.type = "button";
    deleteOption.classList.add("delete-loadout");
    deleteOption.classList.add("active");
    deleteOption.textContent = "Delete Loadout";
    deleteOption.onclick = () => {
        if(minimalLoadout.classList.contains("save")) {
            makeRequest(REQUEST_TYPES.DELETE_LOADOUT, Array.prototype.indexOf.call(document.querySelectorAll(".loadout-wrapper"), minimalLoadout));
        }
        minimalLoadout.remove();
    }

    const shareOption = document.createElement("button");
    shareOption.type = "button";
    shareOption.classList.add("share-loadout-link");
    shareOption.textContent = "Copy Share Code";
    shareOption.onclick = () => {
        encodeLink(createLoadoutObject(minimalLoadout)).then(link => {
            navigator.clipboard.writeText(link);
            makeRequest(REQUEST_TYPES.SEND_ALERT, { message: "Loadout data copied to clipboard!", isError: false });
        });
    };

    rightOptionWrapper.append(deleteOption, shareOption);
    options.appendChild(rightOptionWrapper);

    return minimalLoadout;
}

function createLoadoutObject(container) {
    return {
        title: container.querySelector(".loadout-name").value.trim(),
        units: [...container.querySelectorAll(".chip.set-unit")].map(c => parseInt(c.dataset.id)),
        forms: [...container.querySelectorAll(".chip.set-unit")].map(c => parseInt(c.dataset.form)),
        base: [parseInt(container.querySelector(".base-cannon").dataset.type),
            parseInt(container.querySelector(".base-style").dataset.type),
            parseInt(container.querySelector(".base-foundation").dataset.type)]
    };
}