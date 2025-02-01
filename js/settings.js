import { parseSnakeCase } from "./category/category-parser.js";

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
    const showEmpty = document.querySelector(buttonID);
    showEmpty.addEventListener("click", () => {
        window.localStorage.setItem(storageKey, showEmpty.classList.toggle("active") ? "0" : "1");
    });
    showEmpty.classList.toggle("active", window.localStorage.getItem(storageKey) === "0");
}

function finishSetup() {
    const selection = document.querySelector("#category-selection");
    selection.classList.add("hidden");
    makeRequest(REQUEST_TYPES.GET_CATEGORY_NAMES, null, true).then(names => {
        for(const superCategory of Object.keys(names).sort()) {
            const wrapper = document.createElement("div");
            wrapper.classList.add("super-category-wrapper");

            const superKey = `gk-${superCategory}`;
            const superButton = document.createElement("button");
            superButton.type = "button";
            superButton.classList.add("filter-button");
            superButton.classList.add("super-category-button");
            superButton.textContent = parseSnakeCase(superCategory);

            if(!window.localStorage.getItem(superKey)) {
                window.localStorage.setItem(superKey, "1");
            }
            superButton.classList.toggle("active", window.localStorage.getItem(superKey) === "0");
            superButton.addEventListener("click", () => {
                window.localStorage.setItem(superKey, superButton.classList.toggle("active") ? "0" : "1");
            });

            const subWrapper = document.createElement("div");
            subWrapper.classList.add("h-align");
            subWrapper.classList.add("sub-category-wrapper");

            for(const subCategory of Object.keys(names[superCategory]).sort()) {
                const key = `${superCategory}-${subCategory}`;

                const subButton = document.createElement("button");
                subButton.type = "button";
                subButton.classList.add("filter-button");
                subButton.textContent = subCategory;

                if(!window.localStorage.getItem(key)) {
                    window.localStorage.setItem(key, "1");
                }
                subButton.classList.toggle("active", window.localStorage.getItem(key) === "0");
                subButton.addEventListener("click", () => {
                    window.localStorage.setItem(key, subButton.classList.toggle("active") ? "0" : "1");
                });

                subWrapper.appendChild(subButton);
            }

            wrapper.append(superButton, subWrapper);
            selection.appendChild(wrapper);
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

function displayMessage(message, isError) {
    const saveText = document.querySelector("#save-change-text");
    saveText.classList.add("hidden");
    saveText.textContent = message;
    saveText.classList.toggle("error-msg", isError);
    saveText.clientHeight;
    saveText.classList.remove("hidden");
}

function initializeSaveOptions() {
    document.querySelector("#load-file-save").onclick = () => openWarningModal("Loading a save file", "overwrite", () => {
        const file = document.querySelector("#file-selected").files[0];

        if(file) {
            const parser = new FileReader();
            parser.readAsText(file);

            parser.onload = () => {
                const undata = JSON.parse(window.atob(parser.result));
                for(const key of Object.keys(undata)) {
                    window.localStorage.setItem(key, undata[key]);
                }

                displayMessage("File loaded!", false);
                window.top.location.reload();
            };
            parser.onerror = () => {
                displayMessage("Unable to read file!", true);
            }
        } else {
            displayMessage("No file selected to load!", true);
        }
    }, true);

    document.querySelector("#load-clipboard-save").onclick = () => openWarningModal("Pasting a save file", "overwrite", () => {
        navigator.clipboard.readText().then(t => {
            try {
                const undata = JSON.parse(window.atob(t));
                for(const key of Object.keys(undata)) {
                    window.localStorage.setItem(key, undata[key]);
                }

                displayMessage("Save Pasted!", false);
                window.top.location.reload();
            } catch(e) {
                displayMessage("Unable to parse clipboard text...", true);
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
        displayMessage("Downloading save...", false);
    };

    document.querySelector("#write-clipboard-save").onclick = () => {
        const data = window.btoa(JSON.stringify({...window.localStorage}));
        navigator.clipboard.writeText(data);
        displayMessage("Copied Save!", false);
    };

    document.querySelector("#delete-save").onclick = () => openWarningModal("Deleting your save file", "erase", () => {
        const localKeys = {...window.localStorage};
        for(const key of Object.keys(localKeys)) {
            window.localStorage.removeItem(key);
        }

        displayMessage("Save deleted! Close the tab or refresh the page.", false);
    });
}