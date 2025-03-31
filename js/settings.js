import { initializeCategoryCreator } from "./category/category-creator.js";
import { createSuperCategoryButton } from "./category/create-settings-category.js";

let topPos = 0;
document.addEventListener("DOMContentLoaded", () => {
    loadButton("#fake-filter", "f1");
    loadButton("#collab-filter", "f2");
    loadButton("#version-filter", "f3");
    loadButton("#unobtained-filter", "f4");
    loadButton("#favorite-filter", "f5");
    loadButton("#arrow-upgrade-filter", "s1");
    loadButton("#auto-collapse-filter", "s2");
    loadButton("#show-empty-filter", "s3");
    loadButton("#hide-category-filter", "s4");
    loadButton("#auto-group-collapse-filter", "s5");
    loadButton("#history-filter", "s6");
    loadButton("#single-category-filter", "s7");

    loadSortButtons(["#ingame-sort-option", "#id-sort-option", "#name-sort-option", "#form-sort-option", "#level-sort-option", "#talent-sort-option", "#orb-sort-option", "#talent-sort-option", "#orb-sort-option", "#favorite-sort-option"]);
    const ascendingToggle = document.querySelector("#toggle-ascending");
    const ascendingToggleText = ascendingToggle.querySelector("span");
    ascendingToggle.onclick = () => {
        window.localStorage.setItem("sasc", ascendingToggle.classList.toggle("descending") ? "N" : "Y");
        ascendingToggleText.textContent = window.localStorage.getItem("sasc") === "Y" ? "Ascending" : "Descending";
    };
    ascendingToggle.classList.toggle("descending", window.localStorage.getItem("sasc") === "N");


    document.querySelector("#cancel-overwrite").onclick = () => {
        document.querySelector("#warning-modal").classList.add("hidden");
        document.body.classList.remove("unscrollable");
        document.documentElement.scrollTop = topPos;
    };

    document.querySelectorAll("section > h3").forEach(h => h.onclick = () => h.classList.toggle("section-collapse"));

    const fileSelector = document.querySelector("#file-selected");
    const fileLabel = document.querySelector("#file-name");
    fileSelector.onchange = () => {
        const fileName = fileSelector.files.length > 0 ? fileSelector.files[0].name : "No file selected";
        fileLabel.textContent = fileName;
    };

    initializeSaveOptions();

    window.addEventListener("portLoaded", finishSetup);
    if(checkPort()) {
        window.dispatchEvent("portLoaded");
    }
});

function loadButton(buttonID, storageKey) {
    const target = document.querySelector(buttonID);
    target.addEventListener("click", () => {
        window.localStorage.setItem(storageKey, target.classList.toggle("active") ? "0" : "1");
    });
    target.classList.toggle("active", window.localStorage.getItem(storageKey) === "0");
}

function finishSetup() {
    initializeCategoryCreator((msg, isErr) => makeRequest(REQUEST_TYPES.SEND_ALERT, { message: msg, isError: isErr }));

    const selection = document.querySelector("#category-selection");
    selection.classList.add("hidden");
    makeRequest(REQUEST_TYPES.GET_CATEGORY_NAMES, null, true).then(names => {
        for(const superCategory of Object.keys(names).sort()) {
            selection.appendChild(createSuperCategoryButton(superCategory, names));
        }
        selection.classList.remove("hidden");
    });
}

function openWarningModal(warningText, warningAction, confirmCallback, showFileSelector = false) {
    document.querySelector("#warning-action-text").textContent = warningText;
    document.querySelector("#warning-action-action").textContent = warningAction;
    document.querySelector("#file-selector").classList.toggle("hidden", !showFileSelector);

    document.querySelector("#confirm-overwrite").onclick = () => {
        confirmCallback();
        document.querySelector("#warning-modal").classList.add("hidden");
        document.body.classList.remove("unscrollable");
        document.documentElement.scrollTop = topPos;
    };

    document.querySelector("#warning-modal").classList.remove("hidden");
    topPos = document.documentElement.scrollTop;
    document.body.classList.add("unscrollable");
    document.body.style.top = -1 * topPos + "px";
}

function initializeSaveOptions() {
    document.querySelector("#load-file-save").onclick = () => openWarningModal("Loading a save file", "overwrite", () => {
        const file = document.querySelector("#file-selected").files[0];

        if(file) {
            const parser = new FileReader();
            parser.readAsText(file);

            parser.onload = () => {
                try {
                    const undata = JSON.parse(window.atob(parser.result));
                    for(const key of Object.keys(undata)) {
                        window.localStorage.setItem(key, undata[key]);
                    }

                    makeRequest(REQUEST_TYPES.SEND_ALERT, { message: "File loaded!", isError: false });
                    window.top.location.reload();
                } catch(e) {
                    console.error(e);
                    makeRequest(REQUEST_TYPES.SEND_ALERT, { message: "Unable to read file!", isError: true });
                }
            };
            parser.onerror = () => {
                makeRequest(REQUEST_TYPES.SEND_ALERT, { message: "Unable to read file!", isError: true });
            }
        } else {
            makeRequest(REQUEST_TYPES.SEND_ALERT, { message: "No file selected to load!", isError: true });
        }
    }, true);

    document.querySelector("#load-clipboard-save").onclick = () => openWarningModal("Pasting a save file", "overwrite", () => {
        navigator.clipboard.readText().then(t => {
            try {
                const undata = JSON.parse(window.atob(t));
                for(const key of Object.keys(undata)) {
                    window.localStorage.setItem(key, undata[key]);
                }

                makeRequest(REQUEST_TYPES.SEND_ALERT, { message: "Save Pasted!", isError: false });
                window.top.location.reload();
            } catch(e) {
                makeRequest(REQUEST_TYPES.SEND_ALERT, { message: "Unable to parse clipboard text...", isError: true });
            }
        });
    });

    document.querySelector("#write-file-save").onclick = () => {
        const data = window.btoa(JSON.stringify({...window.localStorage}));
        const blob = new Blob([data], { type: "text/plain" });
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `BCC-Save-${new Date().toLocaleDateString()}.txt`;

        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        makeRequest(REQUEST_TYPES.SEND_ALERT, { message: "Downloading save...", isError: false });
    };

    document.querySelector("#write-clipboard-save").onclick = () => {
        const data = window.btoa(JSON.stringify({...window.localStorage}));
        navigator.clipboard.writeText(data);
        makeRequest(REQUEST_TYPES.SEND_ALERT, { message: "Copied Save!", isError: false });
    };

    document.querySelector("#delete-save").onclick = () => openWarningModal("Deleting your save file", "erase", () => {
        const localKeys = {...window.localStorage};
        for(const key of Object.keys(localKeys)) {
            window.localStorage.removeItem(key);
        }

        window.localStorage.setItem("delete_flag", "1");
        makeRequest(REQUEST_TYPES.SEND_ALERT, { message: "Save deleted!", isError: false });
    });
}

function loadSortButtons(orderedIDs) {
    const targets = orderedIDs.map(id => document.querySelector(id));
    for(let x = 0; x < targets.length; x++) {
        targets[x].classList.add("active");
        targets[x].addEventListener("click", () => {
            window.localStorage.setItem("skey", x);
            targets.forEach(t => t.classList.add("active"));
            targets[x].classList.remove("active");
        });
    }

    targets[parseInt(window.localStorage.getItem("skey"))].classList.remove("active");
}