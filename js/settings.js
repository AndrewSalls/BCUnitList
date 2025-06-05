//@ts-check
import { initializeCategoryCreator } from "./category/category-creator.js";
import { createSuperCategoryButton } from "./category/create-settings-category.js";
import { checkPort, REQUEST_TYPES } from "./communication/iframe-link.js";

let topPos = 0;

/**
 * Initializes page elements once page has loaded.
 */
document.addEventListener("DOMContentLoaded", () => {
    loadButton("#fake-filter", "f1");
    loadButton("#collab-filter", "f2");
    loadButton("#version-filter", "f3");
    loadButton("#unobtained-filter", "f4");
    loadButton("#favorite-filter", "f5");
    loadButton("#obtained-filter", "f6");
    loadButton("#arrow-upgrade-filter", "s1");
    loadButton("#auto-collapse-filter", "s2");
    loadButton("#show-empty-filter", "s3");
    loadButton("#hide-category-filter", "s4");
    loadButton("#auto-group-collapse-filter", "s5");
    loadButton("#history-filter", "s6");
    loadButton("#single-category-filter", "s7");

    loadSortButtons(["#ingame-sort-option", "#id-sort-option", "#name-sort-option", "#form-sort-option", "#level-sort-option", "#talent-sort-option", "#orb-sort-option", "#favorite-sort-option"]);
    const ascendingToggle = /** @type {HTMLButtonElement} */ (document.querySelector("#toggle-ascending"));
    const ascendingToggleText = /** @type {HTMLSpanElement} */ (ascendingToggle.querySelector("span"));
    ascendingToggle.onclick = () => {
        window.localStorage.setItem("sasc", ascendingToggle.classList.toggle("descending") ? "N" : "Y");
        ascendingToggleText.textContent = window.localStorage.getItem("sasc") === "Y" ? "Ascending" : "Descending";
    };
    ascendingToggle.classList.toggle("descending", window.localStorage.getItem("sasc") === "N");


    /** @type {HTMLButtonElement} */ (document.querySelector("#cancel-overwrite")).onclick = () => {
        document.querySelector("#warning-modal")?.classList.add("hidden");
        document.body.classList.remove("unscrollable");
        document.documentElement.scrollTop = topPos;
    };

    /** @type {NodeListOf<HTMLHeadingElement>} */ (document.querySelectorAll("section > h3")).forEach(h => h.onclick = () => h.classList.toggle("section-collapse"));

    const fileSelector = /** @type {HTMLInputElement} */ (document.querySelector("#file-selected"));
    const fileLabel = /** @type {HTMLDivElement} */ (document.querySelector("#file-name"));
    fileSelector.onchange = () => {
        if(fileSelector.files) {
            const fileName = fileSelector.files.length > 0 ? fileSelector.files[0].name : "No file selected";
            fileLabel.textContent = fileName;
        }
    };

    initializeSaveOptions();

    window.addEventListener("portLoaded", finishSetup);
    if(checkPort()) {
        window.dispatchEvent(new CustomEvent("portLoaded"));
    }
});

/**
 * Loads a button assigned to a specific localStorage setting.
 * @param {string} buttonID The ID of the button being assigned.
 * @param {string} storageKey The localStorage key to control with this button.
 */
function loadButton(buttonID, storageKey) {
    const target = /** @type {HTMLButtonElement} */ (document.querySelector(buttonID));
    target.addEventListener("click", () => {
        window.localStorage.setItem(storageKey, target.classList.toggle("active") ? "0" : "1");
    });
    target.classList.toggle("active", window.localStorage.getItem(storageKey) === "0");
}

/**
 * Loads content that relies on connecting to the main window.
 */
function finishSetup() {
    REQUEST_TYPES.GET_NAMES(true).then(names => initializeCategoryCreator(REQUEST_TYPES.GET_CATEGORIES, REQUEST_TYPES.MODIFY_CUSTOM_CATEGORY, REQUEST_TYPES.REMOVE_CUSTOM_CATEGORY, names, REQUEST_TYPES.SEND_ALERT));

    const selection = /** @type {HTMLDivElement} */ (document.querySelector("#category-selection"));
    selection.classList.add("hidden");
    (async () => {
        const categoryOrder = await REQUEST_TYPES.GET_CATEGORIES_ORDER(true);

        for(const superCategory of Object.keys(categoryOrder).sort()) {
            selection.appendChild(createSuperCategoryButton(superCategory, categoryOrder[superCategory]));
        }
        selection.classList.remove("hidden");
    })();
}

/**
 * Opens a warning modal, for warning about messing with save data.
 * @param {string} warningText The name of the action being performed.
 * @param {string} warningAction The effect of the action being performed.
 * @param {() => void} confirmCallback A function to call should the user confirm the action they are about to perform.
 * @param {boolean} [showFileSelector = false] Whether the user should be able to select a file within the warning modal.
 */
function openWarningModal(warningText, warningAction, confirmCallback, showFileSelector = false) {
    /** @type {HTMLSpanElement} */ (document.querySelector("#warning-action-text")).textContent = warningText;
    /** @type {HTMLSpanElement} */ (document.querySelector("#warning-action-action")).textContent = warningAction;
    document.querySelector("#file-selector")?.classList.toggle("hidden", !showFileSelector);

    /** @type {HTMLButtonElement} */ (document.querySelector("#confirm-overwrite")).onclick = () => {
        confirmCallback();
        document.querySelector("#warning-modal")?.classList.add("hidden");
        document.body.classList.remove("unscrollable");
        document.documentElement.scrollTop = topPos;
    };

    document.querySelector("#warning-modal")?.classList.remove("hidden");
    topPos = document.documentElement.scrollTop;
    document.body.classList.add("unscrollable");
    document.body.style.top = -1 * topPos + "px";
}

/**
 * Initialize the settings buttons that provide access to the save settings.
 */
function initializeSaveOptions() {
    /** @type {HTMLButtonElement} */ (document.querySelector("#load-file-save")).onclick = () => {
        openWarningModal("Loading a save file", "overwrite", () => {
            const files = /** @type {HTMLInputElement} */ (document.querySelector("#file-selected")).files;

            if(files) {
                const parser = new FileReader();
                parser.readAsText(files[0]);

                parser.onload = () => {
                    try {
                        if(typeof(parser.result) !== "string") {
                            throw new EvalError("File did not parse to a string");
                        }

                        const undata = JSON.parse(window.atob(parser.result));
                        for(const key of Object.keys(undata)) {
                            window.localStorage.setItem(key, undata[key]);
                        }

                        REQUEST_TYPES.SEND_ALERT("File loaded!", false);
                        window.top?.location.reload();
                    } catch(e) {
                        console.error(e);
                        REQUEST_TYPES.SEND_ALERT("Unable to read file!", true);
                    }
                };
                parser.onerror = () => {
                    REQUEST_TYPES.SEND_ALERT("Unable to read file!", true);
                }
            } else {
                REQUEST_TYPES.SEND_ALERT("No file selected to load!", true);
            }
        }, true);
    };

    /** @type {HTMLButtonElement} */ (document.querySelector("#load-clipboard-save")).onclick = () => {
        openWarningModal("Pasting a save file", "overwrite", () => {
            navigator.clipboard.readText().then(t => {
                try {
                    const undata = JSON.parse(window.atob(t));
                    for(const key of Object.keys(undata)) {
                        window.localStorage.setItem(key, undata[key]);
                    }

                    REQUEST_TYPES.SEND_ALERT("Save Pasted!", false);
                    window.top?.location.reload();
                } catch(e) {
                    REQUEST_TYPES.SEND_ALERT("Unable to parse clipboard text...", true);
                }
            });
        });
    };

    /** @type {HTMLButtonElement} */ (document.querySelector("#write-file-save")).onclick = () => {
        const data = window.btoa(JSON.stringify({...window.localStorage}));
        const blob = new Blob([data], { type: "text/plain" });
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `BCC-Save-${new Date().toLocaleDateString()}.txt`;

        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        REQUEST_TYPES.SEND_ALERT("Downloading save...", false);
    };

    /** @type {HTMLButtonElement} */ (document.querySelector("#write-clipboard-save")).onclick = () => {
        const data = window.btoa(JSON.stringify({...window.localStorage}));
        navigator.clipboard.writeText(data);
        REQUEST_TYPES.SEND_ALERT("Copied Save!", false);
    };

    /** @type {HTMLButtonElement} */ (document.querySelector("#delete-save")).onclick = () => openWarningModal("Deleting your save file", "erase", () => {
        const localKeys = {...window.localStorage};
        for(const key of Object.keys(localKeys)) {
            window.localStorage.removeItem(key);
        }

        REQUEST_TYPES.DELETE_USER_DATA();
    });
}

/**
 * Initializes default sort selection buttons.
 * @param {string[]} orderedIDs A list of button IDs in order of how they should be rendered. 
 */
function loadSortButtons(orderedIDs) {
    const targets = /** @type {HTMLButtonElement[]} */ (orderedIDs.map(id => document.querySelector(id)));
    for(let x = 0; x < targets.length; x++) {
        targets[x].classList.add("active");
        targets[x].addEventListener("click", () => {
            window.localStorage.setItem("skey", `${x}`);
            targets.forEach(t => t.classList.add("active"));
            targets[x].classList.remove("active");
        });
    }
    
    targets[parseInt(window.localStorage.getItem("skey") ?? "0")]?.classList.remove("active");
}