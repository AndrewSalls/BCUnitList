let targettedInput = null;

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
    input.addEventListener("blur", _ev => {
        suggestionDropdown.classList.add("invisible");
        suggestionDropdown.top = "-10000000px";
        suggestionDropdown.left = "-10000000px";
    });
    input.addEventListener("suggest", v => {
        input.value = "";
        input.blur();
        suggestionDropdown.querySelectorAll(".hidden").forEach(s => s.classList.remove("hidden"));
        findCallback(v.detail.id, v.detail.form);
    });
    input.addEventListener("keydown", ev => {
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
    input.addEventListener("keyup", ev => {
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

function ensureOnscreen(dropdownElement, dropdown) {
    const suggestionBounds = dropdown.getBoundingClientRect();
    const targettedBounds = dropdownElement.getBoundingClientRect();

    if(targettedBounds.top <= suggestionBounds.top) {
        dropdown.scrollTop = dropdown.scrollTop + (targettedBounds.top - suggestionBounds.top);
    } else if(targettedBounds.bottom >= suggestionBounds.bottom) {
        dropdown.scrollTop = dropdown.scrollTop + (targettedBounds.bottom - suggestionBounds.bottom);
    }
}

export function createSearchDropdown() {
    const wrapper = document.createElement("div");
    wrapper.classList.add("invisible");
    wrapper.id = "search-suggestion-dropdown";

    return wrapper;
}

export async function initializeDataset(datalist, finds_all = false) {
    const names = await makeRequest(REQUEST_TYPES.GET_NAMES, null, finds_all);

    for(let x = 0; x < names.length; x++) {
        createSearchSuggestions(names[x], datalist);
    }

    [...datalist.children].sort((a, b) => a.textContent.toLowerCase() > b.textContent.toLowerCase() ? 1 : -1).forEach(n => datalist.appendChild(n));
}

export async function initializeDatasetLimited(datalist, finds_all = false) {
    const names = await makeRequest(REQUEST_TYPES.GET_OWNED_FORM_NAMES, null, finds_all);

    for(let x = 0; x < names.length; x++) {
        createSearchSuggestions(names[x], datalist);
    }

    [...datalist.children].sort((a, b) => a.textContent.toLowerCase() > b.textContent.toLowerCase() ? 1 : -1).forEach(n => datalist.appendChild(n));
}

function suggestionOption_onEnter(option, datalist) {
    datalist.querySelector(".suggestion-hovered")?.classList.remove("suggestion-hovered");
    option.classList.add("suggestion-hovered");
}

function  createSearchOption(text, id, form, datalist) {
    const option = document.createElement("div");
    option.textContent = text;
    option.dataset.content = text.toLowerCase();
    option.dataset.target = id;
    option.dataset.form = form;

    option.addEventListener("mouseenter", () => suggestionOption_onEnter(option, datalist));
    option.addEventListener("mouseleave", () => option.classList.remove("suggestion-hovered"));
    option.addEventListener("mousedown", () => targettedInput?.dispatchEvent(new CustomEvent("suggest", { detail: { id: id, form: form } })));

    return option;
}

function createSearchSuggestions(data, datalist) {
    if(data[1]) {
        datalist.appendChild(createSearchOption(data[1], data[0], 0, datalist));
    }
    if(data[2]) {
        datalist.appendChild(createSearchOption(data[2], data[0], 1, datalist));
    }
    if(data[3]) {
        datalist.appendChild(createSearchOption(data[3], data[0], 2, datalist));
    }
    if(data[4]) {
        datalist.appendChild(createSearchOption(data[4], data[0], 3, datalist));
    }
}