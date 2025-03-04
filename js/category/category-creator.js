import makeSearchable, { initializeDataset } from "../helper/make-searchable.js";
import { createSubCategoryButton, createSuperCategoryButton } from "./create-settings-category.js";

const MAX_CATEGORY_NAME_LENGTH = 64;

let selectedUnits = new Set();
let targetedKey = null;

export function initializeCategoryCreator(completionMessager) {
    const wrapper = document.querySelector("#category-creator");
    const antiWrapper = document.querySelector("#category-creator-menu");
    const chipList = document.querySelector("#category-units");
    const categoryName = document.querySelector("#category-name");
    const cancelButton = document.querySelector("#cancel-category-creation");
    const createButton = document.querySelector("#create-category-creation");

    const searchSuggestions = document.querySelector("#add-unit-options");
    makeSearchable(document.querySelector("#add-unit"), searchSuggestions, id => {
        if(!selectedUnits.has(id)) {
            selectedUnits.add(id);
            const chip = createChip(id);
            if(chipList.children.length === 0) {
                chipList.appendChild(chip);
            } else {
                let pos = 0;
                while(pos < chipList.children.length && id > parseInt(chipList.children[pos].querySelector(".unit-id").textContent)) {
                    pos++;
                }
                if(pos === chipList.children.length) {
                    chipList.appendChild(chip);
                } else {
                    chipList.children[pos].insertAdjacentElement("beforebegin", chip);
                }
            }
        }
    });
    initializeDataset(searchSuggestions);

    cancelButton.onclick = () => {
        antiWrapper.classList.remove("hidden");
        wrapper.classList.add("hidden");
        completionMessager("Cancelled category creation.", false);
    };

    makeRequest(REQUEST_TYPES.GET_CATEGORY_NAMES, null, true).then(categories => {
        const custom = categories.custom ?? {};

        const opener = document.querySelector("#open-creator");
        const remover = document.querySelector("#delete-category");
        const existingList = document.querySelector("#created-category-list");
        for(const existing of Object.keys(custom)) {
            existingList.appendChild(createCategorySelectionButton(existing));
        }

        opener.onclick = () => {
            openCategoryModifier(targetedKey, custom[targetedKey]);
        };

        remover.onclick = () => {
            if(targetedKey) {
                removeCustomCategory(targetedKey).then(_ => {
                    delete custom[targetedKey];
                    targetedKey = null;
                    document.querySelector("#create-category-creation").textContent = "Create Category";
                    completionMessager("Category removed...", false);
                });
            }
        };

        createButton.onclick = () => {
            const trimName = categoryName.value.trim();
            if(chipList.children.length === 0) {
                completionMessager("Category must have at least one unit!", true);
                return;
            }
            if(!trimName) {
                completionMessager("Category must have a name!", true);
                return;
            }
            if(trimName.length > MAX_CATEGORY_NAME_LENGTH) {
                completionMessager(`Category name must be at most ${MAX_CATEGORY_NAME_LENGTH} characters long!`, true);
                return;
            }
            if(trimName in Object.keys(custom)) {
                completionMessager("A custom category with that name already exists!", true);
            }

            const categoryValues = [...chipList.querySelectorAll(".unit-id")].map(c => parseInt(c.textContent));
            addCustomCategory(trimName, categoryValues).then(_ => {
                custom[trimName] = categoryValues;
                targetedKey = trimName;
                
                antiWrapper.classList.remove("hidden");
                wrapper.classList.add("hidden");
                completionMessager(`${targetedKey ? "Modified" : "Created"} custom category!`, false);
            });
        };
    });
}

export function openCategoryModifier(originalName = null, originalUnits = null) {
    const wrapper = document.querySelector("#category-creator");
    const antiWrapper = document.querySelector("#category-creator-menu");
    const chipList = document.querySelector("#category-units");
    const categoryName = document.querySelector("#category-name");
    const createButton = document.querySelector("#create-category-creation");

    chipList.innerHTML = "";

    if(originalName && originalUnits) {
        categoryName.value = originalName;
        for(const id of originalUnits.sort((a, b) => a - b)) {
            chipList.appendChild(createChip(id));
        }
        createButton.textContent = "Modify";
    } else {
        categoryName.value = "";
        chipList.innerHTML = "";
        createButton.textContent = "Create";
    }

    antiWrapper.classList.add("hidden");
    wrapper.classList.remove("hidden");
}

function createChip(id) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("chip");
    
    const icon = document.createElement("img");
    icon.classList.add("unit-icon");
    icon.src = `/assets/img/unit_icon/${id}_0.png`;

    const iconID = document.createElement("p");
    iconID.classList.add("unit-id");
    iconID.textContent = id;

    const removeUnit = document.createElement("div");
    removeUnit.classList.add("remove-unit");
    removeUnit.textContent = "x";
    removeUnit.onclick = () => {
        selectedUnits.delete(id);
        wrapper.remove();
    };

    wrapper.append(icon, iconID, removeUnit);
    return wrapper;
}

async function addCustomCategory(categoryName, categoryIDs) {
    if(targetedKey && targetedKey !== categoryName) {
        await removeCustomCategory(targetedKey);
    }

    const customDiv = document.querySelector("#gk-custom .sub-category-wrapper");
    if(customDiv) {
        const inserting = createSubCategoryButton("custom", categoryName);

        let inserted = false;
        for (const child of customDiv.children) {
            if (child.textContent.toLocaleLowerCase().localeCompare(categoryName.toLocaleLowerCase()) > 0) {
                child.insertAdjacentElement("beforebegin", inserting);
                inserted = true;
                break;
            }
        }
        if (!inserted) {
            customDiv.appendChild(inserting);
        }
    } else {
        const data = {};
        data[categoryName] = categoryIDs;

        const insertingInto = document.querySelector("#category-selection");
        const inserting = createSuperCategoryButton("custom", { "custom": data });

        let inserted = false;
        for (const child of insertingInto.children) {
            if (child.id.localeCompare(inserting.id) > 0) {
                child.insertAdjacentElement("beforebegin", inserting);
                inserted = true;
                break;
            }
        }
        if (!inserted) {
            insertingInto.appendChild(inserting);
        }
    }

    document.querySelector("#created-category-list").appendChild(createCategorySelectionButton(categoryName));
    await makeRequest(REQUEST_TYPES.MODIFY_CUSTOM_CATEGORY, { target: categoryName, updates: categoryIDs });
}

async function removeCustomCategory(categoryName) {
    window.localStorage.removeItem(`custom-${categoryName}`);

    const customWrapper = document.querySelector("#gk-custom");
    const customButtons = [...customWrapper.querySelector(".sub-category-wrapper").children];
    customButtons.find(c => c.textContent === categoryName).remove();
    if(customButtons.length === 1) {
        customWrapper.remove();
    }

    [...document.querySelector("#created-category-list").children].find(c => c.textContent === categoryName).remove();
    await makeRequest(REQUEST_TYPES.REMOVE_CUSTOM_CATEGORY, categoryName);
}

function createCategorySelectionButton(categoryName) {
    const catButton = document.createElement("button");
    const existingList = document.querySelector("#created-category-list");
    const opener = document.querySelector("#open-creator");
    const remover = document.querySelector("#delete-category");

    catButton.type = "button";
    catButton.classList.add("filter-button");
    catButton.classList.add("active");
    catButton.textContent = categoryName;
    catButton.onclick = () => {
        const toggleState = catButton.classList.contains("active");
        existingList.querySelectorAll("button").forEach(b => b.classList.add("active"));
        remover.disabled = !toggleState;
        if(toggleState) {
            catButton.classList.remove("active");
            opener.textContent = "Modify Category";
            targetedKey = categoryName;
        } else {
            opener.textContent = "Create Category";
            targetedKey = null;
        }
    };

    return catButton;
}