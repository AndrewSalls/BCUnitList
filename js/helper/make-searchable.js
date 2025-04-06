import { FORM } from "./parse-file.js";

//@ts-check
let targettedInput = null;

/**
 * Makes an input searchable. Only has a visible effect if the dataset has been initialized.
 * @param {HTMLInputElement} input The input to make searchable.
 * @param {(id: number, form: FORM) => void} findCallback A function called when an option is selected from the search.
 */
export default function makeSearchable(input, findCallback) {
    const suggestionDropdown = document.querySelector("#search-suggestion-dropdown");

    function displayDropdown() {
        targettedInput = input;
        const inputBounds = input.getBoundingClientRect();
        const suggestionBounds = suggestionDropdown.getBoundingClientRect();
        suggestionDropdown.style.minWidth = `${inputBounds.width}px`;

        if(inputBounds.left + suggestionBounds.width > window.innerWidth) {
            suggestionDropdown.style.left = `${inputBounds.right + window.scrollX - suggestionBounds.width}px`;
        } else {
            suggestionDropdown.style.left = `${inputBounds.left + window.scrollX}px`;
        }

        if(inputBounds.bottom + suggestionBounds.height > window.innerHeight) {
            suggestionDropdown.style.top = `${inputBounds.top + window.scrollY - suggestionBounds.height}px`;
        } else {
            suggestionDropdown.style.top = `${inputBounds.bottom + window.scrollY}px`;
        }
        suggestionDropdown.classList.remove("invisible");
    }

    input.addEventListener("click", displayDropdown);
    input.addEventListener("focus", displayDropdown);
    input.addEventListener("blur", (/** @type {any} */ _ev) => {
        suggestionDropdown.classList.add("invisible");
        suggestionDropdown.top = "-10000000px";
        suggestionDropdown.left = "-10000000px";
    });
    input.addEventListener("suggest", (/** @type {{ detail: { id: any; form: any; }; }} */ v) => {
        input.value = "";
        input.blur();
        suggestionDropdown.querySelectorAll(".hidden").forEach(s => s.classList.remove("hidden"));
        findCallback(v.detail.id, v.detail.form);
    });
    input.addEventListener("keydown", (/** @type {{ key: string; }} */ ev) => {
        if(ev.key === "ArrowUp") {
            let target = suggestionDropdown.querySelector(".suggestion-hovered");
            if(!target) {
                target = suggestionDropdown.querySelector("div:nth-last-child(1 of :not(.hidden))");
                if(target) {
                    target.classList.add("suggestion-hovered");
                    ensureOnscreen(target, suggestionDropdown);
                }
                return;
            }
            target.classList.remove("suggestion-hovered");

            do {
                if(target === suggestionDropdown.children[0]) {
                    target = suggestionDropdown.children[suggestionDropdown.children.length - 1];
                }
                target = target.previousElementSibling;
            } while(target.classList.contains("hidden"));

            target.classList.add("suggestion-hovered");
            ensureOnscreen(target, suggestionDropdown);
        } else if(ev.key === "ArrowDown") {
            let target = suggestionDropdown.querySelector(".suggestion-hovered");
            if(!target) {
                target = suggestionDropdown.querySelector("div:not(.hidden)");
                if(target) {
                    target.classList.add("suggestion-hovered");
                    ensureOnscreen(target, suggestionDropdown);
                }
                return;
            }
            target.classList.remove("suggestion-hovered");

            do {
                if(target === suggestionDropdown.children[suggestionDropdown.children.length - 1]) {
                    target = suggestionDropdown.children[0];
                }
                target = target.nextElementSibling;
            } while(target.classList.contains("hidden"));

            target.classList.add("suggestion-hovered");
            ensureOnscreen(target, suggestionDropdown);
        }
    });
    input.addEventListener("keyup", (/** @type {{ key: string; }} */ ev) => {
        if(ev.key === "Enter") {
            let id = -1;
            let form = -1;

            const hovered = suggestionDropdown.querySelector(".suggestion-hovered")
            if(hovered) {
                id = parseInt(hovered.dataset.target);
                form = parseInt(hovered.dataset.form);
            } else if(!isNaN(input.value)) {
                id = parseInt(input.value);
                if(id < 0 || id > parseInt(suggestionDropdown.dataset.max_count) || !suggestionDropdown.querySelector(`div[data-target="${id}"]`)) {
                    return;
                }
                form = parseInt([...suggestionDropdown.querySelectorAll(`div[data-target="${id}"]`)].reduce((a, b) => parseInt(b.dataset.form) - parseInt(a.dataset.form)).dataset.form);
            } else {
                const idEntry = suggestionDropdown.querySelector(`div[data-content="${input.value.trim().toLowerCase()}"]`);
                if(idEntry) {
                    id = parseInt(idEntry.dataset.target);
                    form = parseInt(idEntry.dataset.form);
                } else {
                    return;
                }
            }
        
            findCallback(id, form);
            input.value = "";
            input.blur();
            suggestionDropdown.querySelectorAll(".hidden").forEach(s => s.classList.remove("hidden"));
        } else {
            const cleanValue = input.value.trim().toLowerCase();

            for(const child of suggestionDropdown.children) {
                child.classList.toggle("hidden", !child.dataset.content.includes(cleanValue));

                if(child.classList.contains("suggestion-hovered") && child.classList.contains("hidden")) {
                    child.classList.remove("suggestion-hovered");
                }
            }
        }
    });
}

/**
 * Scrolls the dropdown, if necessary, such that the provided dropdown is visible.
 * @param {Element} dropdownElement The element in the dropdown that must be visible.
 * @param {Element} dropdown The dropdown to be scrolled.
 */
function ensureOnscreen(dropdownElement, dropdown) {
    const suggestionBounds = dropdown.getBoundingClientRect();
    const targettedBounds = dropdownElement.getBoundingClientRect();

    if(targettedBounds.top <= suggestionBounds.top) {
        dropdown.scrollTop = dropdown.scrollTop + (targettedBounds.top - suggestionBounds.top);
    } else if(targettedBounds.bottom >= suggestionBounds.bottom) {
        dropdown.scrollTop = dropdown.scrollTop + (targettedBounds.bottom - suggestionBounds.bottom);
    }
}

/**
 * Creates an element that holds a dropdown menu of searchable divs.
 * @returns {HTMLDivElement} The element that contains the dropdown.
 */
export function createSearchDropdown() {
    const wrapper = document.createElement("div");
    wrapper.classList.add("invisible");
    wrapper.id = "search-suggestion-dropdown";

    return wrapper;
}

/**
 * Creates a datalist containing all recorded unit forms, regardless of if the user owns the unit and their form.
 * @param {Element} datalist The element that will contain all searchable divs.
 */
export async function initializeDataset(datalist, finds_all = false) {
    const names = await makeRequest(REQUEST_TYPES.GET_NAMES, null, finds_all);

    for(let x = 0; x < names.length; x++) {
        appendSearchSuggestions(names[x], datalist);
    }

    [...datalist.children].sort((a, b) => a.textContent.toLowerCase() > b.textContent.toLowerCase() ? 1 : -1).forEach(n => datalist.appendChild(n));
}

/**
 * Creates a datalist containing all unit forms owned by the user.
 * @param {Element} datalist The element that will contain all searchable divs.
 */
export async function initializeDatasetLimited(datalist, finds_all = false) {
    const names = await makeRequest(REQUEST_TYPES.GET_OWNED_FORM_NAMES, null, finds_all);

    for(let x = 0; x < names.length; x++) {
        appendSearchSuggestions(names[x], datalist);
    }

    [...datalist.children].sort((a, b) => a.textContent.toLowerCase() > b.textContent.toLowerCase() ? 1 : -1).forEach(n => datalist.appendChild(n));
}

/**
 * Event listener delegate that highlights a searchable div upon being hovered.
 * @param {HTMLDivElement} option The element that was hovered.
 * @param {Element} datalist The element containing all searchable divs.
 */
function suggestionOption_onEnter(option, datalist) {
    datalist.querySelector(".suggestion-hovered")?.classList.remove("suggestion-hovered");
    option.classList.add("suggestion-hovered");
}

/**
 * Creates a div that can be searched for and selected.
 * @param {string} text The name of the form to display in the search option.
 * @param {number} id The ID of the unit represented by this option.
 * @param {FORM} form The number representing what type of form the unit is.
 * @param {Element} datalist The element containing all searchable divs.
 * @returns {HTMLDivElement} The searchable element.
 */
function  createSearchOption(text, id, form, datalist) {
    const option = document.createElement("div");
    option.textContent = text;
    option.dataset.content = text.toLowerCase();
    option.dataset.target = `${id}`;
    option.dataset.form = form;

    option.addEventListener("mouseenter", () => suggestionOption_onEnter(option, datalist));
    option.addEventListener("mouseleave", () => option.classList.remove("suggestion-hovered"));
    option.addEventListener("mousedown", () => targettedInput?.dispatchEvent(new CustomEvent("suggest", { detail: { id: id, form: form } })));

    return option;
}

/**
 * Adds search options for the provided unit info to the datalist.
 * @param {[number, string|null, string|null, string|null, string|null]} data The id, normal form, evolved form, true form, and ultra form (respectively) of a unit.
 * @param {Element} datalist The element containing all search options for the page.
 */
function appendSearchSuggestions(data, datalist) {
    if(data[1]) {
        datalist.appendChild(createSearchOption(data[1], data[0], FORM.NORMAL, datalist));
    }
    if(data[2]) {
        datalist.appendChild(createSearchOption(data[2], data[0], FORM.EVOLVED, datalist));
    }
    if(data[3]) {
        datalist.appendChild(createSearchOption(data[3], data[0], FORM.TRUE, datalist));
    }
    if(data[4]) {
        datalist.appendChild(createSearchOption(data[4], data[0], FORM.ULTRA, datalist));
    }
}